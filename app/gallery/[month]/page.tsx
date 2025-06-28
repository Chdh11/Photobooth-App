"use client";

import { useEffect, useState } from "react";
// import { createClient } from "@supabase/supabase-js";
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
      const { data, error } = await supabase
        .from("photos")
        .select("id, image_url, message, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching photos:", error);
      } else {
        const filtered = data.filter((photo) => {
          const createdMonth = new Date(photo.created_at).toLocaleString("default", {
            month: "long",
            year: "numeric",
          });
          return createdMonth.replace(/\s+/g, '').toLowerCase() === month;
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
                width={400}
                height={600}
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
