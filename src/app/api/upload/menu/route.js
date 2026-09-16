import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "Tidak ada file gambar yang diupload" },
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
        { success: false, message: "Ukuran file gambar maksimal 5MB." },
        { status: 400 }
      );
    }

    // Sanitize filename & generate clean asset name
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const rawBaseName = file.name
      .replace(/\.[^/.]+$/, "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");

    const safeBaseName = rawBaseName.length > 0 ? rawBaseName : "menu";
    const filename = `${safeBaseName}_${Date.now()}.${ext}`;

    // Target directory: public/asset
    const assetDir = path.join(process.cwd(), "public", "asset");
    await mkdir(assetDir, { recursive: true });

    // Write file to public/asset
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(assetDir, filename);
    await writeFile(filePath, buffer);

    // Return URL pointing to /asset/...
    const publicUrl = `/asset/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: "Gambar menu berhasil diupload ke /asset",
    });
  } catch (error) {
    console.error("Upload menu error:", error);
    return NextResponse.json(
      { success: false, message: `Upload gagal: ${error.message}` },
      { status: 500 }
    );
  }
}
