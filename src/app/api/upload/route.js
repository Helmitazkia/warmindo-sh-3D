import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "Tidak ada file yang diupload" },
        { status: 400 }
      );
    }

    // Validate file type (jpg, png, jpeg, webp)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "Ukuran file maksimal 5MB." },
        { status: 400 }
      );
    }

    // Check target folder type (e.g. payment-methods or payment-proofs)
    const folderType = formData.get("folder") || formData.get("type") || "payment-proofs";
    const safeFolder = folderType === "payment-methods" || folderType === "qris" ? "payment-methods" : "payment-proofs";
    const filePrefix = safeFolder === "payment-methods" ? "qris" : "proof";

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${filePrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/uploads/${safeFolder}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: "File berhasil diupload",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: `Upload gagal: ${error.message}` },
      { status: 500 }
    );
  }
}
