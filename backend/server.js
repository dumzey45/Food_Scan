const express = require("express");
const tf = require("@tensorflow/tfjs");
const multer = require("multer");
const cors = require("cors");
const jpeg = require("jpeg-js"); // ← NEW

const app = express();

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

let model;

(async () => {
  try {
    console.log("Loading model...");
    model = await tf.loadGraphModel(
      "https://cdn.jsdelivr.net/gh/dumzey45/food-scan-model@main/model.json"
    );
    console.log("Model loaded successfully!");
  } catch (err) {
    console.error("Model load failed:", err);
  }
})();

app.post("/predict", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image sent" });
    }

    if (!model) {
      return res.status(500).json({ error: "Model not loaded" });
    }

    // Decode JPEG with jpeg-js (pure JS, no native deps)
    const jpegData = jpeg.decode(req.file.buffer, { useTArray: true });

    const imgTensor = tf.tidy(() => {
      const tensor = tf.tensor3d(jpegData.data, [jpegData.height, jpegData.width, 3], "int32");
      return tensor
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(255.0)
        .expandDims();
    });

    const prediction = model.predict(imgTensor);
    const score = (await prediction.data())[0];

    tf.dispose([imgTensor, prediction]);

    res.json({
      label: score >= 0.6 ? "Fresh" : "Rotten",
      confidence: Math.round(score * 100),
    });
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Food Scanner backend running! POST to /predict");
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});