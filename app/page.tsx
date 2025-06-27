import fs from "fs";
import path from "path";
import Link from "next/link";
import { CameraIcon, FolderIcon } from "lucide-react";

export default function Home() {
  const uploadPath = path.join(process.cwd(), "public/uploads");

  let folderData: { name: string; count: number }[] = [];

  if (fs.existsSync(uploadPath)) {
    const folders = fs.readdirSync(uploadPath).filter((name) => {
      return fs.statSync(path.join(uploadPath, name)).isDirectory();
    });

    folderData = folders.map((folder) => {
      const files = fs.readdirSync(path.join(uploadPath, folder));
      const photoCount = files.filter((f) => f.endsWith(".jpg")).length;

      return {
        name: folder,
        count: photoCount,
      };
    });
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📚 Your Photo Library</h1>
        <Link
          href="/camera"
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          <CameraIcon className="w-5 h-5" />
          Open Camera
        </Link>
      </div>

      {folderData.length === 0 ? (
        <p className="text-gray-500 italic">No folders yet. Go click some photos!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folderData.map(({ name, count }) => (
            <Link
              key={name}
              href={`/gallery/${name}`}
              className="border rounded p-4 hover:bg-gray-50 flex flex-col gap-1 shadow"
            >
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <FolderIcon className="w-5 h-5" />
                <span>{name}</span>
              </div>
              <span className="text-sm text-gray-600">
                {count} photo{count !== 1 && "s"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
