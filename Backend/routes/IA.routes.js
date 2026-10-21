const express = require("express");
const multer = require("multer");

const { procesarIA } = require("../controllers/IA/IA.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === "application/pdf" ||
                  file.mimetype === "application/x-pdf" ||
                  file.originalname?.toLowerCase().endsWith(".pdf")
    if (isPdf) {
      cb(null, true)
    } else {
      cb(new Error("Solo se permiten archivos PDF"))
    }
  }
})

router.get("/", (req, res) => { res.json({ ok: true, message: "API IA funcionando" }) })

router.post("/", (req, res, next) => {
  upload.single("pdf")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    next()
  })
}, procesarIA)

module.exports = router;