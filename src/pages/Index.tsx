import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import CameraFeed from "@/components/ar/CameraFeed";
import ARScene from "@/components/ar/ARScene";
import ARControls from "@/components/ar/ARControls";
import LoadingScreen from "@/components/ar/LoadingScreen";

type AnimationType = "idle" | "walk" | "jump";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [arMode, setArMode] = useState(true);
  const [animation, setAnimation] = useState<AnimationType>("idle");
  const [pigPosition, setPigPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleCameraReady = useCallback(() => {
    setCameraActive(true);
    setArMode(true);
    // Slight delay for smoother transition
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleCameraError = useCallback(() => {
    setArMode(false);
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleJump = useCallback(() => {
    setAnimation("jump");
  }, []);

  const handleToggleAnimation = useCallback(() => {
    setAnimation((prev) => (prev === "walk" ? "idle" : "walk"));
  }, []);

  const handleReset = useCallback(() => {
    setPigPosition([0, 0, 0]);
    setAnimation("idle");
    setResetTrigger((prev) => prev + 1);
  }, []);

  const handleOrder = useCallback(() => {
    navigate("/checkout");
  }, [navigate]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Loading Screen */}
      {loading && <LoadingScreen />}

      {/* Camera Feed Background */}
      <CameraFeed onCameraReady={handleCameraReady} onCameraError={handleCameraError} />

      {/* 3D Scene Overlay */}
      <ARScene
        animation={animation}
        onAnimationChange={setAnimation}
        pigPosition={pigPosition}
        resetTrigger={resetTrigger}
      />

      {/* Top UI */}
      {!loading && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐷</span>
            <h1 className="text-lg font-bold text-foreground drop-shadow-lg">PigAR</h1>
          </div>
          <Badge
            variant={arMode && cameraActive ? "default" : "secondary"}
            className="rounded-full px-3 py-1 backdrop-blur-md"
          >
            <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
              arMode && cameraActive ? "bg-primary-foreground animate-pulse" : "bg-muted-foreground"
            }`} />
            {arMode && cameraActive ? "AR Aktif" : "Mode 3D"}
          </Badge>
        </div>
      )}

      {/* Bottom Controls */}
      {!loading && (
        <ARControls
          animation={animation}
          onJump={handleJump}
          onToggleAnimation={handleToggleAnimation}
          onReset={handleReset}
          onOrder={handleOrder}
        />
      )}
    </div>
  );
};

export default Index;
