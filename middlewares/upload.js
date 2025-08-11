import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cloudinary from '../lib/cloudinary.js';
import streamifier from 'streamifier';

// ----------------------
// IMAGE UPLOAD (UNCHANGED)
// ----------------------
const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext) && allowed.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'));
};

export const uploadImage = (req, res, next) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  }).single('image');

  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'organization-profiles' },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    try {
      const result = await streamUpload();
      req.imageUrl = result.secure_url;
      next();
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
};

// ----------------------
// EXCEL UPLOAD (UPDATED)
// ----------------------

const excelFilter = (req, file, cb) => {
  const ok =
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel';
  if (ok) cb(null, true);
  else cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
};

// Use memory storage so you can access `req.file.buffer`
export const uploadExcel = multer({
  storage: multer.memoryStorage(),
  fileFilter: excelFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('excel');

// ----------------------
// PDF or EXCEL UPLOAD
// ----------------------
const pdfOrExcelFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF or Excel files (.pdf, .xlsx, .xls) are allowed'));
  }
};

export const uploadPdfOrExcel = multer({
  storage: multer.memoryStorage(),
  fileFilter: pdfOrExcelFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
}).single('file'); // Field name is now 'file'

