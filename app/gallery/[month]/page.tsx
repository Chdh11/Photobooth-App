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
    <div className="p-10 bg-black ">
      <h1 className="text-2xl text-white font-bold mb-4">
        {month?.charAt(0).toUpperCase() + month?.slice(1)} Gallery
      </h1>
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : photos.length === 0 ? (
        <p className="text-white">No photos yet!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-white">
          {photos.map(({ id, image_url }, i) => (
            <div key={id} className="border rounded shadow p-2">
              <Image
                src={
                  supabase.storage.from("photostripes").getPublicUrl(image_url).data.publicUrl
                }
                alt={`photo-${i}`}
                width={500}
                height={900}
                className="rounded"
              />
              
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => downloadPhoto(image_url)}
                  className="ml-2 px-1 py-1 text-sm bg-black  rounded cursor-pointer"
                >
                  <img src="/download.png" alt="download" className="w-5 h-5" />
                </button>

                <button
                  onClick={() => deletePhoto(id, image_url)}
                  className="px-1 py-1 text-sm bg-black rounded cursor-pointer"
                >
                  <img src="/delete.png" alt="delete" className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
