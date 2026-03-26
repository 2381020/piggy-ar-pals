import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense, useRef, useCallback, useEffect, MutableRefObject } from "react";
import PigModelGlb from "./PigModelGlb";
import Ground from "./Ground";
import * as THREE from "three";
import blackPigUrl from "../../assets/black-pig.glb";

type AnimationType = "idle" | "walk" | "jump";

interface ARSceneProps {
  animation: AnimationType;
  onAnimationChange: (anim: AnimationType) => void;
  pigPosition: [number, number, number];
  resetTrigger: number;
  moveRef: MutableRefObject<{ x: number; z: number }>;
}

const MovablePig = ({
  animation,
  onJumpComplete,
  pigPosition,
  onClick,
  moveRef,
  resetTrigger,
}: {
  animation: AnimationType;
  onJumpComplete: () => void;
  pigPosition: [number, number, number];
  onClick: () => void;
  moveRef: MutableRefObject<{ x: number; z: number }>;
  resetTrigger: number;
}) => {

  const pigGroupRef = useRef<THREE.Group | null>(null);

  // 🔥 velocity system
  const velocity = useRef(new THREE.Vector3());

  // ✅ INIT POSISI
  useEffect(() => {
    if (!pigGroupRef.current) return;

    pigGroupRef.current.position.set(0, 0, -15);
    pigGroupRef.current.rotation.y = Math.PI;
  }, []);

  // ✅ RESET (tidak ganggu movement)
  useEffect(() => {
    if (!pigGroupRef.current) return;

    pigGroupRef.current.position.set(pigPosition[0], 0, pigPosition[2]);
    velocity.current.set(0, 0, 0);
  }, [resetTrigger]);

  useFrame((_, delta) => {
    if (!pigGroupRef.current) return;

    const { x, z } = moveRef.current;

    const moveSpeed = 6;
    const accel = 6;
    const friction = 5;

    const inputDir = new THREE.Vector3(x, 0, z);

    let targetVel = new THREE.Vector3(0, 0, 0);

    // 🎮 movement logic
    if (inputDir.length() > 0.001) {
      targetVel = inputDir.normalize().multiplyScalar(moveSpeed);
      velocity.current.lerp(targetVel, accel * delta);
    } else {
      velocity.current.lerp(new THREE.Vector3(0, 0, 0), friction * delta);
    }

    // 🚀 APPLY MOVEMENT
    pigGroupRef.current.position.x += velocity.current.x * delta;
    pigGroupRef.current.position.z += velocity.current.z * delta;

    // 🔥 ROTASI SUPER SMOOTH (FIX MUNCUNG)
    if (velocity.current.length() > 0.01) {
      const dir = velocity.current.clone().normalize();

      // ⚠️ kalau arah salah, ganti -Math.PI/2 jadi +Math.PI/2
      const targetYaw = Math.atan2(dir.x, dir.z) - Math.PI / 2;

      const currentYaw = pigGroupRef.current.rotation.y;

      let deltaAngle =
        ((targetYaw - currentYaw + Math.PI) % (Math.PI * 2)) - Math.PI;

      const turnSmooth = 3;

      pigGroupRef.current.rotation.y += deltaAngle * delta * turnSmooth;
    }
  });

  return (
    <PigModelGlb
      animation={animation}
      modelUrl={blackPigUrl}
      onJumpComplete={onJumpComplete}
      onClick={onClick}
      groupRef={pigGroupRef}
    />
  );
};

const ARScene = ({
  animation,
  onAnimationChange,
  pigPosition,
  resetTrigger,
  moveRef
}: ARSceneProps) => {

  const handleJumpComplete = useCallback(() => {
    onAnimationChange("idle");
  }, [onAnimationChange]);

  const handlePigClick = useCallback(() => {
    onAnimationChange("jump");
  }, [onAnimationChange]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 2.5, 20], fov: 70 }}
      style={{ position: "absolute", inset: 0 }}
      gl={{ alpha: true, antialias: true }}
    >
      {/* LIGHT */}
      <ambientLight intensity={0.7} />

      <directionalLight
        position={[3, 5, 2]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <directionalLight position={[-2, 3, -2]} intensity={0.4} />

      <Environment preset="city" />

      <Suspense fallback={null}>
        <MovablePig
          animation={animation}
          onJumpComplete={handleJumpComplete}
          pigPosition={pigPosition}
          onClick={handlePigClick}
          moveRef={moveRef}
          resetTrigger={resetTrigger}
        />
      </Suspense>

      <Ground />

      <OrbitControls
        target={[0, 0, 0]}
        minDistance={10}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
};

export default ARScene;