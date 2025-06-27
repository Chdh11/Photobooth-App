import fs from "fs";
import path from "path";
import Image from "next/image";
import { notFound } from "next/navigation";

export default function GalleryPage({ params }: { params: { month: string } }) {
  const month = params.month;
  const folderPath = path.join(process.cwd(), "public", "uploads", month);

  if (!fs.existsSync(folderPath)) {
    return notFound();
  }

  const imageFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith(".jpg"));

  const imageData = imageFiles.map((filename) => {
    const jsonFile = filename.replace(".jpg", ".json");
    const jsonPath = path.join(folderPath, jsonFile);

    let message = "";
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, "utf-8");
      message = JSON.parse(data).message;
    }

    return {
      src: `/uploads/${month}/${filename}`,
      message,
    };
  });

  return (
    <div className="p-10">
      <h1 className="text-2xl text-white font-bold mb-4">{month} Gallery</h1>
      {imageData.length === 0 ? (
        <p>No photos yet!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-white">
          {imageData.map(({ src, message }, i) => (
            <div key={i} className="border rounded shadow p-2">
              <Image src={src} alt={`photo-${i}`} width={400} height={600} className="rounded" />
              {message && <p className="mt-2 text-sm italic">{message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
