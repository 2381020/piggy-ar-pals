import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense, useRef, useCallback, MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import PigModel from "./PigModel";
import Ground from "./Ground";

type AnimationType = "idle" | "walk" | "jump";

interface ARSceneProps {
  animation: AnimationType;
  onAnimationChange: (anim: AnimationType) => void;
  pigPosition: [number, number, number];
  resetTrigger: number;
  moveRef: MutableRefObject<{ x: number; z: number }>;
  onPositionChange: (pos: [number, number, number]) => void;
}

// Inner component to use useFrame
const MovablePig = ({
  animation,
  onJumpComplete,
  pigPosition,
  onClick,
  moveRef,
  onPositionChange,
}: {
  animation: AnimationType;
  onJumpComplete: () => void;
  pigPosition: [number, number, number];
  onClick: () => void;
  moveRef: MutableRefObject<{ x: number; z: number }>;
  onPositionChange: (pos: [number, number, number]) => void;
}) => {
  const posRef = useRef<[number, number, number]>([...pigPosition]);

  useFrame((_, delta) => {
    const { x, z } = moveRef.current;
    if (Math.abs(x) > 0.05 || Math.abs(z) > 0.05) {
      const speed = delta * 1.5;
      posRef.current = [
        posRef.current[0] + x * speed,
        0,
        posRef.current[2] + z * speed,
      ];
      onPositionChange([...posRef.current]);
    }
  });

  return (
    <PigModel
      animation={animation}
      onJumpComplete={onJumpComplete}
      position={pigPosition}
      onClick={onClick}
    />
  );
};

const ARScene = ({ animation, onAnimationChange, pigPosition, resetTrigger, moveRef, onPositionChange }: ARSceneProps) => {
  const controlsRef = useRef<any>(null);

  const handleJumpComplete = useCallback(() => {
    onAnimationChange("idle");
  }, [onAnimationChange]);

  const handlePigClick = useCallback(() => {
    onAnimationChange("jump");
  }, [onAnimationChange]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 1, 2.5], fov: 50, near: 0.1, far: 100 }}
      style={{ position: "absolute", inset: 0 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-near={0.1}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-2, 3, -2]} intensity={0.3} />

      <Environment preset="city" />

      <Suspense fallback={null}>
        <MovablePig
          animation={animation}
          onJumpComplete={handleJumpComplete}
          pigPosition={pigPosition}
          onClick={handlePigClick}
          moveRef={moveRef}
          onPositionChange={onPositionChange}
        />
      </Suspense>

      <Ground />

      <OrbitControls
        ref={controlsRef}
        target={[0, 0.3, 0]}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={0.1}
      />
    </Canvas>
  );
};

export default ARScene;
