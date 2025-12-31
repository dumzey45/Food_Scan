const express = require("express");
const cors = require("cors");
const multer = require("multer");
const jpeg = require("jpeg-js");
const tf = require("@tensorflow/tfjs"); // ✅ PURE JS VERSION

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.use(express.json({ limit: "10mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* =======================
   LOAD MODEL
======================= */
let model = null;

(async () => {
  try {
    console.log("⏳ Loading model...");
    model = await tf.loadGraphModel(
      "https://cdn.jsdelivr.net/gh/dumzey45/food-scan-model@main/model.json"
    );
    console.log("✅ Model loaded");
  } catch (err) {
    console.error("❌ Model load failed:", err);
  }
})();

/* =======================
   ROUTES
======================= */

app.get("/", (req, res) => {
  res.status(200).send("Food Scan backend is LIVE 🚀");
});

app.post("/predict", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    if (!model) {
      return res.status(503).json({ error: "Model still loading" });
    }

    const decoded = jpeg.decode(req.file.buffer, true);

    const inputTensor = tf.tidy(() => {
      const { data, width, height } = decoded;

      // RGBA → RGB
      const rgb = new Uint8Array(width * height * 3);
      for (let i = 0, j = 0; i < data.length; i += 4) {
        rgb[j++] = data[i];
        rgb[j++] = data[i + 1];
        rgb[j++] = data[i + 2];
      }

      return tf
        .tensor3d(rgb, [height, width, 3])
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(255)
        .expandDims(0);
    });

    const prediction = model.predict(inputTensor);
    const score = (await prediction.data())[0];

    tf.dispose([inputTensor, prediction]);

    res.json({
      label: score >= 0.6 ? "Fresh" : "Rotten",
      confidence: Math.round(score * 100),
    });
  } catch (err) {
    console.error("❌ Prediction error:", err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
