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
        // 🔥 cek apakah browser support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported");
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" }, // 🔥 lebih fleksibel
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!videoRef.current || !mounted) return;

        videoRef.current.srcObject = stream;

        // 🔥 iOS fix (HARUS)
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
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
        <p className="text-sm opacity-70">Camera not available</p>
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
