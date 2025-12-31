const express = require("express");
const tf = require("@tensorflow/tfjs");
const multer = require("multer");
const cors = require("cors");

const app = express();

// MEMORY ONLY upload
const upload = multer({
  storage: multer.memoryStorage(),
});

app.use(cors());
app.use(express.json());

let model;

// Load model once at startup
(async () => {
  try {
    console.log("Loading model...");
    model = await tf.loadGraphModel(
      "https://cdn.jsdelivr.net/gh/dumzey45/food-scan-model@main/model.json"
    );
    console.log("Model loaded successfully!");
  } catch (err) {
    console.error("Failed to load model:", err);
  }
})();

app.post("/predict", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image sent" });
    }

    if (!model) {
      return res.status(500).json({ error: "Model not loaded yet" });
    }

    // Convert buffer directly to tensor (no sharp needed)
    const imgTensor = tf.node.decodeImage(req.file.buffer, 3) // 3 channels (RGB)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(255.0)
      .expandDims();

    const prediction = model.predict(imgTensor);
    const score = (await prediction.data())[0];

    tf.dispose([imgTensor, prediction]);

    res.json({
      label: score >= 0.6 ? "Fresh" : "Rotten",
      confidence: Math.round(score * 100),
    });
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

// Health check route
app.get("/", (req, res) => {
  res.send("Food Scanner backend is running! POST image to /predict");
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
