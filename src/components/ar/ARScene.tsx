import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense, useRef, useState, useCallback } from "react";
import PigModel from "./PigModel";
import Ground from "./Ground";

type AnimationType = "idle" | "walk" | "jump";

interface ARSceneProps {
  animation: AnimationType;
  onAnimationChange: (anim: AnimationType) => void;
  pigPosition: [number, number, number];
  resetTrigger: number;
}

const ARScene = ({ animation, onAnimationChange, pigPosition, resetTrigger }: ARSceneProps) => {
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
      {/* Lighting */}
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

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Pig Model */}
      <Suspense fallback={null}>
        <PigModel
          animation={animation}
          onJumpComplete={handleJumpComplete}
          position={pigPosition}
          onClick={handlePigClick}
        />
      </Suspense>

      {/* Ground with shadow */}
      <Ground />

      {/* Orbit Controls */}
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
