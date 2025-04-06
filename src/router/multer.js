const log = console.log;
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'folder')); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    let filename = `${Date.now()}-${file.originalname}`; // Generate unique filename
    req.filename = filename;
    cb(null, filename); // Generate unique filename
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid/Unsupported Filetype'), false);
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10
  },
  filefilter: null
})


module.exports = upload