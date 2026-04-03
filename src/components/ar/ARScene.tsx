import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import PigModelGlb from "./PigModelGlb";
import Ground from "./Ground";
import * as THREE from "three";
import blackPigUrl from "../../assets/black-pig.glb";

interface ARSceneProps {
  groundDetected: boolean;
}

const StaticPig = () => {
  const pigGroupRef = useRef<THREE.Group | null>(null);

  // Posisi fix di depan kamera, di atas lantai
  useEffect(() => {
    if (!pigGroupRef.current) return;
    pigGroupRef.current.position.set(0, 0, 0);
    pigGroupRef.current.rotation.y = Math.PI;
  }, []);

  return (
    <PigModelGlb
      modelUrl={blackPigUrl}
      groupRef={pigGroupRef}
    />
  );
};

const ARScene = ({ groundDetected }: ARSceneProps) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.5, 4], fov: 50, near: 0.1, far: 100 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      gl={{ alpha: true, antialias: true }}
    >
      {/* LIGHT */}
      <ambientLight intensity={0.8} />

      <directionalLight
        position={[2, 4, 3]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-bias={-0.002}
      />

      <directionalLight position={[-2, 3, -1]} intensity={0.3} />

      <Environment preset="city" />

      {/* Babi hanya muncul jika lantai terdeteksi */}
      {groundDetected && (
        <Suspense fallback={null}>
          <StaticPig />
        </Suspense>
      )}

      {/* Ground & shadow hanya muncul jika lantai terdeteksi */}
      {groundDetected && <Ground />}
    </Canvas>
  );
};

export default ARScene;