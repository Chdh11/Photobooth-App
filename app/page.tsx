// app/page.tsx
import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import { FolderIcon } from "lucide-react";
import CameraPage from "./camera/page";
import { Poppins, Lobster } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });
const lobster = Lobster({ subsets: ["latin"], weight: "400" });

export default function Home() {
  const uploadPath = path.join(process.cwd(), "public/uploads");

  let folderData: { name: string; count: number }[] = [];

  if (fs.existsSync(uploadPath)) {
    const folders = fs.readdirSync(uploadPath).filter((name) =>
      fs.statSync(path.join(uploadPath, name)).isDirectory()
    );

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
<main className="relative min-h-screen flex flex-row items-start justify-center bg-gradient-to-br from-pink-300 via-pink-100 to-pink-300 text-gray-900 p-6 gap-10">

      
      <div>
        {/* App name */}
        <div>
          <h1 className={`${poppins.className} text-4xl md:text-4xl font-extrabold text-white tracking-wide mb-6 mt-2 ml-8`}>
            Photobooth
          </h1>
        </div>

        {/* Left: Folder List */}
      <div className="w-[225px] ml-8 flex flex-col gap-4 p-4 bg-white bg-opacity-10 rounded-xl shadow-inner backdrop-blur-md overflow-y-auto max-h-[80vh]">
        <h2 className="text-lg font-bold text-pink-400 mb-2 text-center">Folders</h2>
        {folderData.length === 0 ? (
          <p className="text-gray-400 italic">No folders yet</p>
        ) : (
          folderData.map(({ name, count }) => (
            <Link
              key={name}
              href={`/gallery/${name}`}
              className="bg-pink-100  rounded-lg px-3 py-2 shadow flex flex-col gap-1 h-[75px]"
            >
              <div className="flex items-center gap-2 text-pink-400">
                <FolderIcon className="w-5 h-5" />
                <span className="font-medium">{name}</span>
              </div>
              <span className="text-xs text-pink-400">{count} snap{count !== 1 && "s"}</span>
            </Link>
          ))
        )}
      </div>
      </div>

      {/* Right: Camera Section */}
      <div className="flex-1 flex justify-center">
        <div className="w-full ml-4 mt-5 mr-8 p-6 rounded-2xl  bg-white bg-opacity-95 shadow-2xl">
          <CameraPage />
        </div>
      </div>
    </main>
  );
}
