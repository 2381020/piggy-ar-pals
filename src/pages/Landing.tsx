import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Landing = () => {
  const navigate = useNavigate();
  const [requesting, setRequesting] = useState(false);

  const handlePlay = async () => {
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      // Stop the test stream immediately
      stream.getTracks().forEach((t) => t.stop());
      navigate("/ar");
    } catch {
      toast.error("Izin kamera diperlukan untuk mode AR");
    } finally {
      setRequesting(false);
    }
  };

  const handleSettings = () => {
    toast.info("Settings coming soon!");
  };

  const handleExit = () => {
    window.close();
    // fallback if window.close doesn't work
    toast.info("Tutup tab ini untuk keluar");
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[hsl(var(--primary)/0.15)] to-background flex flex-col items-center justify-center gap-6 p-6">
      {/* Logo & Title */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <span className="text-8xl drop-shadow-lg animate-bounce">🐷</span>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
          PigAR
        </h1>
        <p className="text-muted-foreground text-sm">
          Augmented Reality Experience
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          onClick={handlePlay}
          disabled={requesting}
          className="h-14 rounded-2xl text-lg font-bold shadow-lg"
          size="lg"
        >
          <Play className="mr-2 h-6 w-6" />
          {requesting ? "Meminta izin..." : "Play"}
        </Button>

        <Button
          onClick={handleSettings}
          variant="secondary"
          className="h-12 rounded-2xl text-base font-semibold"
          size="lg"
        >
          <Settings className="mr-2 h-5 w-5" />
          Settings
        </Button>

        <Button
          onClick={handleExit}
          variant="outline"
          className="h-12 rounded-2xl text-base font-semibold"
          size="lg"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Exit
        </Button>
      </div>
    </div>
  );
};

export default Landing;
