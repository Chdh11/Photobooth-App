import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const month = formData.get("month") as string;
    const message = formData.get("message") as string;

    if (!file || !month) {
      return NextResponse.json({ error: "Missing file or month" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads", month);
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const baseFilename = `photobooth-${timestamp}`;
    const imagePath = path.join(uploadDir, `${baseFilename}.jpg`);
    const metadataPath = path.join(uploadDir, `${baseFilename}.json`);

    await writeFile(imagePath, buffer);
    await writeFile(metadataPath, JSON.stringify({ message }));

    return NextResponse.json({ success: true, filename: `${baseFilename}.jpg` });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
