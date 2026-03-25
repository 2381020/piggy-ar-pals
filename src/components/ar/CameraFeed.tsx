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

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          onCameraReady();
        }
      } catch (err) {
        console.warn("Camera not available, using fallback mode:", err);
        setHasCamera(false);
        onCameraError();
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onCameraReady, onCameraError]);

  if (!hasCamera) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-muted to-secondary" />
    );
  }

  return (
    <video
      ref={videoRef}
      className="fixed inset-0 w-full h-full object-cover"
      playsInline
      muted
      autoPlay
    />
  );
};

export default CameraFeed;
