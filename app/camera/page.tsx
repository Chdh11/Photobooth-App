"use client";

import { useEffect, useRef, useState } from "react";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("none");

  useEffect(() => {
    let stream: MediaStream;

    const setupCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx!.filter = filter;
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL("image/jpeg");
    setPhotos((prev) => [...prev, dataURL].slice(0, 3));
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

  const uploadToServer = async () => {
    const photoboothCanvas = await generatePhotostripCanvas();
    if (!photoboothCanvas) return;

    photoboothCanvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "photobooth.jpg");
      formData.append("month", "June2025");
      formData.append("message", message);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Photo booth strip saved!");
        setPhotos([]);
        setMessage("");
      } else {
        alert("Upload failed.");
      }
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
    <div className="p-6 flex flex-col items-center justify-center">
      <div className="relative w-full max-w-2xl mb-4">
        {loading && (
          <div className="absolute inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center rounded">
            <div className="text-white animate-pulse text-lg">Loading camera...</div>
          </div>
        )}
        <video
          ref={videoRef}
          className="rounded shadow w-full"
          style={{ filter }}
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-3 mb-2 mt-4 flex-wrap justify-center">
        <button onClick={() => setFilter("none")} className="px-3 py-1 bg-pink-100 text-pink-400 rounded w-[130px] hover:bg-pink-200 cursor-pointer ">Normal</button>
        <button onClick={() => setFilter("grayscale(100%)")} className="px-3 py-2 bg-pink-100 text-pink-400 rounded w-[130px] hover:bg-pink-200 cursor-pointer">Black & White</button>
        <button onClick={() => setFilter("sepia(100%)")} className="px-3 py-2 bg-pink-100 text-pink-400 rounded w-[130px] hover:bg-pink-200 cursor-pointer">Sepia</button>
        <button onClick={() => setFilter("contrast(150%)")} className="px-3 py-2 bg-pink-100 text-pink-400 rounded w-[130px] hover:bg-pink-200 cursor-pointer">High Contrast</button>
        <button onClick={() => setFilter("hue-rotate(90deg)")} className="px-3 py-2 bg-pink-100 text-pink-400 rounded w-[130px] hover:bg-pink-200 cursor-pointer">Hue Shift</button>
      </div>

      {photos.length < 3 && (
        <button
          onClick={capturePhoto}
          className="mb-4 mt-4 w-75 bg-pink-100 text-pink-400 px-4 py-2 rounded hover:bg-pink-200 cursor-pointer"
        >
          Say Cheese {photos.length + 1}/3
        </button>
      )}

      {photos.length === 3 && (
        <>
          <textarea
            className="w-full max-w-md border rounded p-2 mb-4 mt-4 text-black"
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="bg-white p-4 rounded shadow w-full max-w-md">
            {photos.map((src, i) => (
              <img key={i} src={src} alt={`photo-${i}`} className="mb-2 border rounded" />
            ))}
            <p className="italic text-sm">{message}</p>
          </div>
          <button
            onClick={uploadToServer}
            className="mt-6 w-75 bg-pink-100 text-pink-400 px-4 py-2 rounded hover:bg-pink-200 cursor-pointer"
          >
            Save to Library
          </button>
          <button
            onClick={cancelUpload}
            className="mt-2 w-75 bg-pink-100 text-pink-400 px-4 py-2 rounded hover:bg-pink-200 cursor-pointer"
          >
            Cancel Upload
          </button>
          <button
            onClick={downloadPhotostrip}
            className="mt-2 w-75 bg-pink-100 text-pink-400 px-4 py-2 rounded hover:bg-pink-200 cursor-pointer"
          >
            Download Photo Strip
          </button>
        </>
      )}
    </div>
  );
}
