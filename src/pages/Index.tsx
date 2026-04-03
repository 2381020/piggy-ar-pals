import { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import CameraFeed from "@/components/ar/CameraFeed";
import ARScene from "@/components/ar/ARScene";
import LoadingScreen from "@/components/ar/LoadingScreen";

type FloorState = "searching" | "detected" | "placed";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [arMode, setArMode] = useState(true);
  const [floorState, setFloorState] = useState<FloorState>("searching");
  const [gyroPermission, setGyroPermission] = useState(false);

  const handleCameraReady = useCallback(() => {
    setCameraActive(true);
    setArMode(true);
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleCameraError = useCallback(() => {
    setArMode(false);
    setTimeout(() => setLoading(false), 800);
  }, []);

  // Request gyroscope permission (wajib di iOS 13+)
  const requestGyroPermission = useCallback(async () => {
    // Cek apakah DeviceOrientationEvent.requestPermission ada (iOS)
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission === "function") {
      try {
        const permission = await DOE.requestPermission();
        if (permission === "granted") {
          setGyroPermission(true);
          return true;
        } else {
          console.warn("Gyroscope permission denied");
          return false;
        }
      } catch (err) {
        console.warn("Gyroscope permission error:", err);
        return false;
      }
    } else {
      // Android / desktop — permission tidak diperlukan
      setGyroPermission(true);
      return true;
    }
  }, []);

  // Otomatis request gyro permission setelah kamera aktif
  useEffect(() => {
    if (cameraActive && arMode) {
      requestGyroPermission();
    }
  }, [cameraActive, arMode, requestGyroPermission]);

  // Simulasi deteksi lantai — setelah kamera aktif + gyro ready, tunggu 2.5 detik
  useEffect(() => {
    if (!cameraActive || !arMode || !gyroPermission) return;

    setFloorState("searching");

    const timer = setTimeout(() => {
      setFloorState("detected");
    }, 2500);

    return () => clearTimeout(timer);
  }, [cameraActive, arMode, gyroPermission]);

  // Ketuk layar untuk menempatkan babi setelah lantai terdeteksi
  const handlePlacePig = useCallback(() => {
    if (floorState === "detected") {
      setFloorState("placed");
    }
  }, [floorState]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {loading && <LoadingScreen />}

      <CameraFeed onCameraReady={handleCameraReady} onCameraError={handleCameraError} />

      {/* ARScene render setelah gyro permission diberikan */}
      {cameraActive && gyroPermission && (
        <ARScene groundDetected={floorState === "placed"} />
      )}

      {/* ===== HEADER ===== */}
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

      {/* ===== FLOOR DETECTION OVERLAY ===== */}
      {!loading && cameraActive && floorState === "searching" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-4 flex flex-col items-center gap-3">
            {/* Scanning animation */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-2 border-white/30 rounded-lg animate-ping" />
              <div className="absolute inset-2 border-2 border-white/50 rounded-md animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                </svg>
              </div>
            </div>
            <p className="text-white text-sm font-medium">Mendeteksi lantai...</p>
            <p className="text-white/60 text-xs">Arahkan kamera ke permukaan datar</p>
          </div>
        </div>
      )}

      {/* ===== TAP TO PLACE OVERLAY ===== */}
      {!loading && cameraActive && floorState === "detected" && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center cursor-pointer"
          onClick={handlePlacePig}
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-4 flex flex-col items-center gap-3 animate-bounce-slow">
            {/* Tap icon */}
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <p className="text-white text-sm font-medium">Lantai terdeteksi! ✅</p>
            <p className="text-white/80 text-xs font-medium">Ketuk layar untuk menempatkan babi 🐷</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
