"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderIcon } from "lucide-react";
import CameraPage from "./camera/page";
import { Poppins } from "next/font/google";
import supabase from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

type FolderData = {
  month: string;
  count: number;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [folders, setFolders] = useState<FolderData[]>([]);

  useEffect(() => {
  const fetchPhotos = async () => {

    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (!user) return; // stop if not logged in

    const { data, error } = await supabase
      .from("photos")
      .select("id, created_at")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to fetch photos:", error);
      return;
    }

    const grouped: Record<string, number> = {};

    data.forEach((photo) => {
      const date = new Date(photo.created_at);

      const monthStr = `${date.toLocaleString("en-US", {
        month: "long",
      })}${date.getFullYear()}`;

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
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };
return (
  <main className="min-h-[100dvh] w-full overflow-x-hidden flex flex-col lg:flex-row items-center lg:items-start justify-center bg-gradient-to-br from-pink-300 via-pink-100 to-pink-300 text-gray-900 px-4 py-6 md:p-6 gap-6 md:gap-10">

    {/* LEFT SECTION */}
    <div className="w-full max-w-xs flex flex-col items-center lg:items-star lg:ml-4 lg:mt-2">

      {/* Title */}
      <h1
        className={`${poppins.className} text-4xl md:text-5xl lg:text-5xl font-extrabold text-white tracking-wide mb-6`}
      >
        Photobooth
      </h1>

      {/* Login / Logout */}
      <div className="w-full mb-4">
        {user ? (
          <button
            onClick={handleLogout}
            className="w-full bg-pink-100 text-pink-400 px-4 py-2 rounded-xl hover:bg-pink-200 cursor-pointer"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="block text-center w-full bg-pink-100 text-pink-400 px-4 py-2 rounded-xl hover:bg-pink-200 cursor-pointer"
          >
            Login
          </Link>
        )}
      </div>

      {/* Folder List */}
      <div className="w-full flex flex-col gap-3 p-4 bg-white/70 rounded-xl shadow-inner backdrop-blur-md max-h-[60vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-pink-400 text-center">
          Folders
        </h2>

        {!user ? (
          <p className="text-gray-400 italic text-center">
            Login to view your saved photostrips
          </p>
        ) : folders.length === 0 ? (
          <p className="text-gray-400 italic text-center">
            No folders yet
          </p>
        ) : (
          folders.map(({ month }) => (
            <Link
              key={month}
              href={`/gallery/${month}`}
              className="bg-pink-200 rounded-lg px-3 py-2 shadow flex items-center gap-2 text-pink-400 cursor-pointer"
            >
              <FolderIcon className="w-5 h-5" />
              <span className="font-medium">{month}</span>
            </Link>
          ))
        )}
      </div>
    </div>

    {/* CAMERA SECTION */}
    <div className="w-full flex justify-center">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-full bg-white/95 rounded-2xl shadow-2xl p-4 sm:p-5 lg:p-6">
        <CameraPage />
      </div>
    </div>

  </main>
);
}
