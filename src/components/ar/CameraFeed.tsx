import { useEffect, useRef, useState } from "react";

interface CameraFeedProps {
  onCameraReady: () => void;
  onCameraError: () => void;
}

const CameraFeed = ({ onCameraReady, onCameraError }: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let mounted = true;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported");
        }

        // 🔥 LANGKAH 1: Coba kamera belakang (environment) secara KETAT
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: "environment" }, // HARUS kamera belakang
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // 🔥 LANGKAH 2: Kamera belakang tidak tersedia
          // Coba kamera apapun, tapi cek apakah itu environment
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

          // Cek apakah kamera yang didapat benar-benar environment
          const track = stream.getVideoTracks()[0];
          const settings = track.getSettings();
          const capabilities = track.getCapabilities?.();

          // Jika facingMode diketahui dan bukan environment → tolak
          if (settings.facingMode && settings.facingMode !== "environment") {
            console.warn("Kamera depan terdeteksi, bukan kamera belakang");
            stream.getTracks().forEach((t) => t.stop());
            throw new Error("Hanya kamera belakang yang didukung untuk AR");
          }

          // Jika capabilities ada facingMode dan hanya "user" → tolak
          if (
            capabilities?.facingMode &&
            capabilities.facingMode.length === 1 &&
            capabilities.facingMode[0] === "user"
          ) {
            console.warn("Perangkat hanya memiliki kamera depan");
            stream.getTracks().forEach((t) => t.stop());
            throw new Error("Perangkat hanya memiliki kamera depan");
          }
        }

        if (!videoRef.current || !mounted) return;

        videoRef.current.srcObject = stream;

        // iOS fix
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.muted = true;

        await videoRef.current.play();

        onCameraReady();
      } catch (err) {
        console.warn("Camera error:", err);
        if (mounted) {
          setHasCamera(false);
          onCameraError();
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onCameraReady, onCameraError]);

  // ================= FALLBACK =================
  if (!hasCamera) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center text-white gap-3">
        <span className="text-4xl">📷</span>
        <p className="text-sm font-medium">Kamera belakang tidak tersedia</p>
        <p className="text-xs opacity-60 text-center px-8">
          AR membutuhkan kamera belakang (environment).
          <br />
          Gunakan perangkat mobile untuk pengalaman terbaik.
        </p>
      </div>
    );
  }

  // ================= VIDEO =================
  return (
    <video
      ref={videoRef}
      className="fixed inset-0 w-full h-full object-cover"
      autoPlay
      playsInline
      muted
    />
  );
};

export default CameraFeed;
