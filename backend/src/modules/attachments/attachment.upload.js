const path = require("path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const multer = require("multer");
const { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } = require("./attachment.validation");

const UPLOAD_DIR = path.resolve(__dirname, "../../../../uploads/attachments");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error(`File type '${file.mimetype}' is not allowed.`);
    err.code = "UNSUPPORTED_FILE_TYPE";
    err.statusCode = 415;
    cb(err, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = { upload, UPLOAD_DIR };
