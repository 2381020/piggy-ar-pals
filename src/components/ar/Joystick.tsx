import { useRef, useCallback, useEffect, useState } from "react";

interface JoystickProps {
  onMove: (dx: number, dy: number) => void;
  onStop: () => void;
  size?: number;
}

const Joystick = ({ onMove, onStop, size = 120 }: JoystickProps) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });

  const maxDist = size / 2 - 20;

  const arrowAngle = Math.atan2(stickPos.y, stickPos.x);

  const getPos = useCallback(
    (clientX: number, clientY: number) => {
      if (!baseRef.current) return { x: 0, y: 0 };

      const rect = baseRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      let dx = clientX - cx;
      let dy = clientY - cy;

      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }

      return { x: dx, y: dy };
    },
    [maxDist],
  );

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      setDragging(true);
      const pos = getPos(clientX, clientY);
      setStickPos(pos);
      onMove(pos.x / maxDist, pos.y / maxDist);
    },
    [getPos, maxDist, onMove],
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragging) return;

      const pos = getPos(clientX, clientY);
      setStickPos(pos);
      onMove(pos.x / maxDist, pos.y / maxDist);
    },
    [dragging, getPos, maxDist, onMove],
  );

  const handleEnd = useCallback(() => {
    setDragging(false);
    setStickPos({ x: 0, y: 0 });
    onStop();
  }, [onStop]);

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      e.preventDefault(); // ✅ boleh di sini
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const onEnd = () => handleEnd();

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchend", onEnd);
    window.addEventListener("mouseup", onEnd);

    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("mouseup", onEnd);
    };
  }, [dragging, handleMove, handleEnd]);

  return (
    <div
      ref={baseRef}
      className="rounded-full border-2 border-foreground/20 bg-foreground/10 backdrop-blur-md relative"
      style={{
        width: size,
        height: size,
        touchAction: "none", // 🔥 penting
        userSelect: "none", // 🔥 biar ga ke-select
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        // ❌ jangan pakai preventDefault di sini
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }}
    >
      {/* Stick */}
      <div
        className="absolute rounded-full bg-primary shadow-lg border-2 border-primary-foreground/30"
        style={{
          width: 40,
          height: 40,
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${stickPos.x}px), calc(-50% + ${stickPos.y}px))`,
          transition: dragging ? "none" : "transform 0.2s ease-out",
        }}
      >
        {/* Arrow */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) rotate(${arrowAngle + Math.PI / 2}rad)`,
          }}
        >
          <path d="M12 4L20 12L12 20L4 12L12 4Z" fill="white" />
        </svg>
      </div>
    </div>
  );
};

export default Joystick;
