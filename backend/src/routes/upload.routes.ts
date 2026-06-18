import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/upload.controller";
import { authMiddleware } from "../middleware/auth";
import { FileError } from "../utils/AppError";

const router = Router();

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];
const ALLOWED_MIMETYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/x-markdown",
];

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = "." + file.originalname.split(".").pop()?.toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new FileError(`Unsupported file type "${ext}". Please upload a PDF, DOCX, TXT, or Markdown (.md) file.`) as any, false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

router.post("/", authMiddleware as any, upload.single("file"), uploadFile as any);

export default router;
