const express = require("express");
const multer = require("multer");

const { procesarIA } = require("../controllers/IA/IA.controller");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"));
    }
  }
});

router.get("/", (req, res) => {res.json({ok: true,message: "API IA funcionando"});});

router.post("/",upload.single("pdf"),procesarIA);

module.exports = router;