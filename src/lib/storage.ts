import fs from "fs/promises";
import path from "path";

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
}

export interface StorageProvider {
  uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    subfolder?: string
  ): Promise<UploadResult>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

/**
 * Local Disk Storage Provider for Development
 * Stores uploads in /public/uploads and returns local public URLs.
 * Easily swappable for AWS S3 or Cloudinary by implementing StorageProvider.
 */
class LocalStorageProvider implements StorageProvider {
  private baseUploadDir: string;

  constructor() {
    this.baseUploadDir = path.join(process.cwd(), "public", "uploads");
  }

  private async ensureDir(targetPath: string) {
    try {
      await fs.access(targetPath);
    } catch {
      await fs.mkdir(targetPath, { recursive: true });
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    subfolder = ""
  ): Promise<UploadResult> {
    const uploadPath = path.join(this.baseUploadDir, subfolder);
    await this.ensureDir(uploadPath);

    // Sanitize and generate unique filename
    const ext = path.extname(originalName);
    const base = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    const finalName = `${base}_${uniqueSuffix}${ext}`;
    const destination = path.join(uploadPath, finalName);

    await fs.writeFile(destination, fileBuffer);

    const publicUrl = subfolder
      ? `/uploads/${subfolder}/${finalName}`
      : `/uploads/${finalName}`;

    return {
      url: publicUrl,
      filename: finalName,
      size: fileBuffer.length,
    };
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      if (!fileUrl.startsWith("/uploads/")) return false;
      const relativePath = fileUrl.replace(/^\/uploads\//, "");
      const fullPath = path.join(this.baseUploadDir, relativePath);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton storage provider export
export const storage: StorageProvider = new LocalStorageProvider();
