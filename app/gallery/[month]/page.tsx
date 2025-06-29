"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";

interface Photo {
  id: number;
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
          const formatted = `${photoDate.toLocaleString("default", {
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

  return (
    <div className="p-10">
      <h1 className="text-2xl text-white font-bold mb-4">
        {month.charAt(0).toUpperCase() + month.slice(1)} Gallery
      </h1>
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : photos.length === 0 ? (
        <p className="text-white">No photos yet!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-white">
          {photos.map(({ id, image_url, message }, i) => (
            <div key={id} className="border rounded shadow p-2">
              <Image
                src={
                  supabase.storage.from("photostrips").getPublicUrl(image_url).data.publicUrl
                }
                alt={`photo-${i}`}
                width={500}
                height={900}
                className="rounded"
              />
              {message && <p className="mt-2 text-sm italic">{message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
