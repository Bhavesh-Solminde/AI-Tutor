import { Router } from "express";
import multer from "multer";
import { examSetup, uploadSyllabus, uploadPYQ, getExam, deleteExam } from "../controllers/exam.controller";
import { authMiddleware } from "../middleware/auth";
import { aiRateLimiter } from "../middleware/rateLimiter";
import { FileError } from "../utils/AppError";

const router = Router();

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = "." + file.originalname.split(".").pop()?.toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new FileError(`Unsupported file type "${ext}". Please upload a PDF, DOCX, TXT, or Markdown (.md) file.`) as any, false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

router.post("/setup", authMiddleware as any, examSetup as any);
router.post("/upload-syllabus", authMiddleware as any, aiRateLimiter, upload.single("file"), uploadSyllabus as any);
router.post("/upload-pyq", authMiddleware as any, upload.single("file"), uploadPYQ as any);
router.get("/:userId", authMiddleware as any, getExam as any);
router.delete("/:userId", authMiddleware as any, deleteExam as any);

export default router;

