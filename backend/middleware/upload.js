import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ absolute path (best practice)
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    // ✅ unique + clean filename
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;