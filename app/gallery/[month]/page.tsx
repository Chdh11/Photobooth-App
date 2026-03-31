"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";


interface Photo {
  id: string;
  image_url: string;
  message: string;
  created_at: string;
}

export default function GalleryPage() {
  const params = useParams();
  const month = (params?.month as string)?.toLowerCase();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not authenticated", userError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("photos")
        .select("id, image_url, message, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching photos:", error);
      } else {
        const filtered = data.filter((photo) => {
          const photoDate = new Date(photo.created_at);
          const formatted = `${photoDate.toLocaleString("en-US", {
            month: "long",
          })}${photoDate.getFullYear()}`.toLowerCase();

          return formatted === month;
        });
        setPhotos(filtered);
      }
      setLoading(false);
    };

    if (month) fetchPhotos();
  }, [month]);

      const downloadPhoto = async (fileName: string) => {
        const { data } = supabase.storage
          .from("photostripes")
          .getPublicUrl(fileName);

        const response = await fetch(data.publicUrl);
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "photobooth.jpg";
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      };

    const deletePhoto = async (photoId: string, fileName: string) => {
      const confirmDelete = confirm("Are you sure you want to delete this photo?");
      if (!confirmDelete) return;

      // delete from storage
      const { error: storageError } = await supabase.storage
        .from("photostripes")
        .remove([fileName]);

      if (storageError) {
        console.error(storageError);
        alert("Failed to delete from storage");
        return;
      }

      // delete from database
      const { error: dbError } = await supabase
        .from("photos")
        .delete()
        .eq("id", photoId);

      if (dbError) {
        console.error(dbError);
        alert("Failed to delete from database");
        return;
      }

      // update UI
      setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    };

  
  

  return (
  <div className="w-full max-w-6xl mx-auto px-4 py-6">

    {/* Title */}
    <h1 className="text-xl sm:text-2xl text-white font-bold mb-6 text-center md:text-left">
      {month?.charAt(0).toUpperCase() + month?.slice(1)} Gallery
    </h1>

    {loading ? (
      <p className="text-white text-center">Loading...</p>
    ) : photos.length === 0 ? (
      <p className="text-white text-center">No photos yet!</p>
    ) : (

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

        {photos.map(({ id, image_url }, i) => (
          <div
            key={id}
            className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
          >

            {/* Image */}
            <div className="w-full aspect-[1/3] overflow-hidden">
              <Image
                src={
                  supabase.storage
                    .from("photostripes")
                    .getPublicUrl(image_url).data.publicUrl
                }
                alt={`photo-${i}`}
                width={500}
                height={900}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center p-2">
              <button
                onClick={() => downloadPhoto(image_url)}
                className="p-1.5 sm:p-2 bg-black rounded hover:bg-gray-800 transition"
              >
                <img
                  src="/download.png"
                  alt="download"
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                />
              </button>

              <button
                onClick={() => deletePhoto(id, image_url)}
                className="p-1.5 sm:p-2 bg-black rounded hover:bg-gray-800 transition"
              >
                <img
                  src="/delete.png"
                  alt="delete"
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                />
              </button>
            </div>

          </div>
        ))}
      </div>
    )}
  </div>
);
}
