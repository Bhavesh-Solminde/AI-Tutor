import { cloudinary } from "../config/cloudinary";

/**
 * Uploads a PDF buffer to Cloudinary using raw resource type.
 * Returns the secure Cloudinary URL.
 */
export async function uploadPdfToCloudinary(
  buffer: Buffer,
  originalName: string
): Promise<string> {
  const publicId = `${Date.now()}_${originalName.replace(/\.[^.]+$/, "").replace(/\s+/g, "_")}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // Store as raw file (not image)
        folder: "neuralnest/pdfs",
        public_id: publicId,
        format: "pdf",
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve(result!.secure_url);
        }
      }
    );
    stream.end(buffer);
  });
}
