const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

console.log('Upload middleware initialized with directory:', uploadsDir);

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Processing file upload:', file.originalname);
    cb(null, uploadsDir); // Sử dụng đường dẫn tuyệt đối
  },
  filename: function (req, file, cb) {
    const filename = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1000)}${path.extname(file.originalname)}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  },
});

// Check file type
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  console.log(`File validation: ${file.originalname}, valid extension: ${extname}, valid mimetype: ${mimetype}`);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! Please upload a JPEG, JPG, PNG, or WEBP file.'));
  }
};

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB size limit
  fileFilter: fileFilter,
});

module.exports = upload; 