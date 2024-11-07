const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { extractInformationByDocType } = require('../utils/extraction');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'));
    }
  }
});

router.post('/process-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const docType = req.body.documentType || 'passport';
    const imageBuffer = req.file.buffer;

    // Perform OCR
    const result = await Tesseract.recognize(
      imageBuffer,
      'eng',
      { logger: info => console.log(info) }
    );

    const extractedInfo = extractInformationByDocType(result.data.text, docType);

    res.json({
      success: true,
      data: {
        extractedInfo,
      }
    });

  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing document'
    });
  }
});

module.exports = router;
