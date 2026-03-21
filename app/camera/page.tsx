"use client";

import { useEffect, useRef, useState } from "react";
import supabase from "../../lib/supabaseClient"; 
import { User } from "@supabase/supabase-js";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("none");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const filters = [
  { name: "Normal", value: "contrast(120%) brightness(110%) saturate(110%)" },

  // darker black & white with stronger contrast
  { name: "B&W", value: "grayscale(100%) contrast(140%) brightness(90%)" },

  { name: "Vintage", value: "sepia(50%) contrast(120%) brightness(110%)" },

  { name: "High Contrast", value: "contrast(180%)" },

  { name: "Dreamy", value: "brightness(130%) blur(1px)" },

  { name: "Invert", value: "invert(100%)" },

  // subtle pink tone
  { name: "Soft Pink", value: "hue-rotate(-10deg) saturate(110%) brightness(110%)" },

  // dark night aesthetic
  { name: "Midnight", value: "brightness(90%) contrast(100%) saturate(80%) hue-rotate(50deg)" },
];

  useEffect(() => {
    let stream: MediaStream;
    

    const setupCamera = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const savedPhotos = localStorage.getItem("photobooth_photos");
      const savedMessage = localStorage.getItem("photobooth_message");

      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
        localStorage.removeItem("photobooth_photos");
      }

      if (savedMessage) {
        setMessage(savedMessage);
        localStorage.removeItem("photobooth_message");
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error);
            setLoading(false);
          };
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setLoading(false);
      }
    };

    setupCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const CAPTURE_WIDTH = 960;
    const CAPTURE_HEIGHT = 720; // 4:3 ratio

    canvas.width = CAPTURE_WIDTH;
    canvas.height = CAPTURE_HEIGHT;

    const ctx = canvas.getContext("2d");
    // canvas.width = video.videoWidth;
    // canvas.height = video.videoHeight;

    ctx!.filter = filter;
    ctx!.translate(canvas.width, 0);
    ctx!.scale(-1, 1);
    ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL("image/jpeg");
    setPhotos((prev) => [...prev, dataURL].slice(0, 3));

    // Trigger flash
    setFlash(true);
    setTimeout(() => setFlash(false), 100);
  };

  const startCountdown = () => {
    let timeLeft = 3;
    setCountdown(timeLeft);
    const interval = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft === 0) {
        clearInterval(interval);
        setCountdown(null);
        capturePhoto();
      }
    }, 1000);
  };

  const generatePhotostripCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (photos.length < 3) return null;

    const sampleImage = new Image();
    sampleImage.src = photos[0];
    return new Promise((resolve) => {
      sampleImage.onload = async () => {
        const width = sampleImage.width;
        const height = sampleImage.height;
        const totalHeight = height * 3 + 80;

        const photoboothCanvas = document.createElement("canvas");
        photoboothCanvas.width = width;
        photoboothCanvas.height = totalHeight;
        const ctx = photoboothCanvas.getContext("2d");
        if (!ctx) return resolve(null);

        for (let i = 0; i < photos.length; i++) {
          const img = new Image();
          img.src = photos[i];
          await new Promise((res) => {
            img.onload = () => {
              ctx.drawImage(img, 0, i * height, width, height);
              res(null);
            };
          });
        }

        ctx.fillStyle = "#fff";
        ctx.font = "20px sans-serif ";
        ctx.fillText(message, 10, totalHeight - 30);

        resolve(photoboothCanvas);
      };
    });
  };

  // const uploadToServer = async () => {
  //   const photoboothCanvas = await generatePhotostripCanvas();
  //   if (!photoboothCanvas) return;

  //   photoboothCanvas.toBlob(async (blob) => {
  //     if (!blob) return;

  //     const formData = new FormData();
  //     formData.append("file", blob, "photobooth.jpg");
  //     formData.append("month", "June2025");
  //     formData.append("message", message);

  //     const res = await fetch("/api/upload", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (res.ok) {
  //       alert("Photo booth strip saved!");
  //       setPhotos([]);
  //       setMessage("");
  //     } else {
  //       alert("Upload failed.");
  //     }
  //   }, "image/jpeg");
  // };

  

const uploadToSupabase = async () => {

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    localStorage.setItem("photobooth_photos", JSON.stringify(photos));
    localStorage.setItem("photobooth_message", message);
    window.location.href = "/login";
    return;
  }

  const canvas = await generatePhotostripCanvas();
  if (!canvas) return;

  canvas.toBlob(async (blob) => {
    if (!blob) return;

    const fileName = `photostrip-${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from('photostripes')
      .upload(fileName, blob, { contentType: 'image/jpeg' });

    if (error) {
      alert("Upload failed: " + error.message);
      return;
    }

    // const { data: publicUrlData } = supabase
    //   .storage
    //   .from('photostrips')
    //   .getPublicUrl(fileName);

    // await supabase.from('photos').insert([
    //   { image_url: fileName, message }
    // ]);
    // const {
    //   data: { user }
    // } = await supabase.auth.getUser();

    const { error: insertError } = await supabase
      .from("photos")
      .insert([
        { image_url: fileName, message, user_id: user.id }
      ]);

    if (insertError) {
      console.error(insertError);
      alert(insertError.message);
    }


    alert("Uploaded to Supabase!");
    setPhotos([]);
    setMessage("");
  }, "image/jpeg");
};


  const downloadPhotostrip = async () => {
    const photoboothCanvas = await generatePhotostripCanvas();
    if (!photoboothCanvas) return;

    const link = document.createElement("a");
    link.download = "photobooth.jpg";
    link.href = photoboothCanvas.toDataURL("image/jpeg");
    link.click();
  };

  

  function cancelUpload(): void {
    setPhotos([]);
    setMessage("");
    alert("Upload cancelled.");
  }

  return (
  <div className="w-full max-w-sm md:max-w-md lg:max-w-xl mx-auto px-4 py-6">
    <div className="bg-white/90 rounded-2xl shadow-xl p-4 sm:p-5 flex flex-col items-center">

      {/* Camera */}
      <div className="relative w-full mb-4 overflow-hidden rounded-xl">
        {loading && (
          <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
            <div className="text-white animate-pulse text-lg">
              Loading camera...
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full aspect-[4/3] max-h-[60vh] object-cover"
          style={{ filter, transform: "scaleX(-1)" }}
          autoPlay
          playsInline
          muted
        />

        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white text-6xl sm:text-7xl font-bold drop-shadow-lg animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {flash && (
          <div className="absolute inset-0 bg-white/80 animate-fade-out pointer-events-none" />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2 w-full max-w-xs">
        {filters.map((f) => (
          <button
            key={f.name}
            onClick={() => setFilter(f.value)}
            className="px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm md:px-4 md:py-2 md:text-base bg-pink-100 text-pink-400 hover:bg-pink-200 rounded cursor-pointer"
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Capture Button */}
      {photos.length < 3 && (
        <button
          onClick={startCountdown}
          className="mt-4 w-full bg-pink-100 text-pink-400 
px-3 py-1.5 text-sm 
sm:px-4 sm:py-2 sm:text-base 
md:px-5 md:py-2.5 md:text-lg 
rounded font-medium transition-all hover:bg-pink-200 cursor-pointer"
        >
          Say Cheese {photos.length + 1}/3
        </button>
      )}

      {/* Result Section */}
      {photos.length === 3 && (
        <div className="w-full max-w-xs flex flex-col items-center">
          <textarea
            className="w-full border rounded p-2 mt-4 text-black"
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="bg-white p-3 rounded shadow w-full mt-4">
            {photos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`photo-${i}`}
                className="mb-2 rounded"
              />
            ))}
            <p className="italic text-sm">{message}</p>
          </div>

          <button
            onClick={uploadToSupabase}
            className="mt-4 w-full bg-pink-100 text-pink-400 
px-3 py-1.5 text-sm 
sm:px-4 sm:py-2 sm:text-base 
md:px-5 md:py-2.5 md:text-lg 
rounded font-medium transition-all hover:bg-pink-200 cursor-pointer"
          >
            {user ? "Save to Library" : "Login to Save"}
          </button>

          <button
            onClick={cancelUpload}
            className="mt-2 w-full bg-pink-100 text-pink-400 
px-3 py-1.5 text-sm 
sm:px-4 sm:py-2 sm:text-base 
md:px-5 md:py-2.5 md:text-lg 
rounded font-medium transition-all hover:bg-pink-200 cursor-pointer"
          >
            Cancel Upload
          </button>

          <button
            onClick={downloadPhotostrip}
            className="mt-2 w-full bg-pink-100 text-pink-400 
px-3 py-1.5 text-sm 
sm:px-4 sm:py-2 sm:text-base 
md:px-5 md:py-2.5 md:text-lg 
rounded font-medium transition-all hover:bg-pink-200 cursor-pointer"
          >
            Download Photo Strip
          </button>
        </div>
      )}
    </div>
  </div>
);
}
