const express = require("express");
const tf = require("@tensorflow/tfjs");
const multer = require("multer");
const cors = require("cors");
const sharp = require("sharp");

const app = express();

// MEMORY ONLY upload
const upload = multer({
  storage: multer.memoryStorage(),
});

app.use(cors());
app.use(express.json());

let model;

// Load model once
(async () => {
  console.log("Loading model...");
  model = await tf.loadGraphModel("https://cdn.jsdelivr.net/gh/dumzey45/food-scan-model@main/model.json");
  console.log("Model loaded!");
})();

app.post("/predict", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image sent" });
    }

    // Image is already in RAM
    const { data, info } = await sharp(req.file.buffer)
      .resize(224, 224)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const imgTensor = tf
      .tensor(new Uint8Array(data), [1, info.height, info.width, 3])
      .toFloat()
      .div(255.0);

    const prediction = model.predict(imgTensor);
    const score = (await prediction.data())[0];

    tf.dispose([imgTensor, prediction]);

    res.json({
      label: score >= 0.6 ? "Fresh" : "Rotten",
      confidence: Math.round(score * 100),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
