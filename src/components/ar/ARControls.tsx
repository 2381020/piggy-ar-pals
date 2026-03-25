import { RotateCw, ZoomIn, MapPin, Sparkles, Film, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

type AnimationType = "idle" | "walk" | "jump";

interface ARControlsProps {
  animation: AnimationType;
  onJump: () => void;
  onToggleAnimation: () => void;
  onReset: () => void;
  onOrder: () => void;
}

const ARControls = ({ animation, onJump, onToggleAnimation, onReset, onOrder }: ARControlsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6">
      {/* Main action buttons */}
      <div className="mx-auto max-w-md">
        {/* Order button */}
        <Button
          onClick={onOrder}
          className="mb-3 w-full h-12 rounded-2xl bg-primary text-primary-foreground text-base font-bold shadow-lg hover:bg-primary/90"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Order Sekarang
        </Button>

        {/* Control buttons row */}
        <div className="flex gap-2 justify-center">
          <ControlButton
            icon={<RotateCw className="h-4 w-4" />}
            label="Putar"
            onClick={() => {}}
            active={false}
          />
          <ControlButton
            icon={<ZoomIn className="h-4 w-4" />}
            label="Zoom"
            onClick={() => {}}
            active={false}
          />
          <ControlButton
            icon={<MapPin className="h-4 w-4" />}
            label="Reset"
            onClick={onReset}
            active={false}
          />
          <ControlButton
            icon={<Sparkles className="h-4 w-4" />}
            label="Lompat"
            onClick={onJump}
            active={animation === "jump"}
          />
          <ControlButton
            icon={<Film className="h-4 w-4" />}
            label={animation === "walk" ? "Jalan" : "Diam"}
            onClick={onToggleAnimation}
            active={animation === "walk"}
          />
        </div>
      </div>
    </div>
  );
};

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active: boolean;
}

const ControlButton = ({ icon, label, onClick, active }: ControlButtonProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2.5 text-xs font-medium transition-all backdrop-blur-md ${
      active
        ? "bg-primary text-primary-foreground shadow-lg"
        : "bg-foreground/10 text-foreground hover:bg-foreground/20"
    }`}
  >
    {icon}
    <span className="text-[10px]">{label}</span>
  </button>
);

export default ARControls;
