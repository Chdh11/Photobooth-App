"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderIcon } from "lucide-react";
import CameraPage from "./camera/page";
import { Poppins } from "next/font/google";
import supabase from "@/lib/supabaseClient";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

type FolderData = {
  month: string;
};

export default function Home() {
  const [folders, setFolders] = useState<FolderData[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("id, created_at");

      if (error) {
        console.error("Failed to fetch photos:", error);
        return;
      }

      const grouped: Record<string, number> = {};

      data.forEach((photo) => {
        const date = new Date(photo.created_at);
        const monthStr = `${date.toLocaleString("default", {
          month: "long",
        })}${date.getFullYear()}`; // e.g., June2025

        grouped[monthStr] = (grouped[monthStr] || 0) + 1;
      });

      const folderList = Object.entries(grouped).map(([month, count]) => ({
        month,
        count,
      }));

      setFolders(folderList);
    };

    fetchPhotos();
  }, []);

  return (
    <main className="relative min-h-screen flex flex-row items-start justify-center bg-gradient-to-br from-pink-300 via-pink-100 to-pink-300 text-gray-900 p-6 gap-10">
      <div>
        <div>
          <h1
            className={`${poppins.className} text-4xl md:text-4xl font-extrabold text-white tracking-wide mb-6 mt-2 ml-8`}
          >
            Photobooth
          </h1>
        </div>

        {/* Folder List */}
        <div className="w-[225px] ml-8 flex flex-col gap-4 p-4 bg-white bg-opacity-10 rounded-xl shadow-inner backdrop-blur-md overflow-y-auto max-h-[80vh]">
          <h2 className="text-lg font-bold text-pink-400 mb-2 text-center">Folders</h2>
          {folders.length === 0 ? (
            <p className="text-gray-400 italic">No folders yet</p>
          ) : (
            folders.map(({ month }) => (
              <Link
                key={month}
                href={`/gallery/${month}`}
                className="bg-pink-100 rounded-lg px-3 py-2 shadow flex flex-col gap-1 h-[50px]"
              >
                <div className="flex items-center gap-2 text-pink-400">
                  <FolderIcon className="w-5 h-5" />
                  <span className="font-medium">{month}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Camera Section */}
      <div className="flex-1 flex justify-center">
        <div className="w-full ml-4 mt-5 mr-8 p-6 rounded-2xl bg-white bg-opacity-95 shadow-2xl">
          <CameraPage />
        </div>
      </div>
    </main>
  );
}
