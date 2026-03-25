import { RotateCw, Sparkles, Film, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Joystick from "./Joystick";

type AnimationType = "idle" | "walk" | "jump";

interface ARControlsProps {
  animation: AnimationType;
  onJump: () => void;
  onToggleAnimation: () => void;
  onReset: () => void;
  onMove: (dx: number, dy: number) => void;
  onMoveStop: () => void;
}

const ARControls = ({ animation, onJump, onToggleAnimation, onReset, onMove, onMoveStop }: ARControlsProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6">
      <div className="mx-auto max-w-md flex items-end justify-between">
        {/* Joystick - left side */}
        <Joystick onMove={onMove} onStop={onMoveStop} size={110} />

        {/* Action buttons - right side */}
        <div className="flex flex-col gap-2">
          <ControlButton
            icon={<ArrowLeft className="h-4 w-4" />}
            label="Keluar"
            onClick={() => navigate("/")}
            active={false}
          />
          <ControlButton
            icon={<RotateCw className="h-4 w-4" />}
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
