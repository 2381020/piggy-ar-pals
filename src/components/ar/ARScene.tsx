import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, DeviceOrientationControls, ContactShadows } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import PigModelGlb from "./PigModelGlb";
// Kita akan buat Ground internal di PlacementPig untuk handle pointer
import * as THREE from "three";
import blackPigUrl from "../../assets/black-pig.glb";

type FloorState = "searching" | "detected" | "placed";

interface ARSceneProps {
  floorState: FloorState;
  pigScale: number;
}

const PlacementPig = ({ floorState, pigScale }: { floorState: FloorState; pigScale: number }) => {
  const pigGroupRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  
  const targetPos = useRef(new THREE.Vector3(0, 0, -3));

  useFrame(() => {
    if (!pigGroupRef.current) return;

    if (floorState === "detected") {
      // Saat mencari (detected), babi mengikuti kamera di jarak 3m
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      dir.y = 0;
      if (dir.lengthSq() < 0.001) dir.set(0, 0, -1);
      else dir.normalize();

      const distance = 3;
      targetPos.current.set(
        camera.position.x + dir.x * distance,
        0,
        camera.position.z + dir.z * distance
      );

      pigGroupRef.current.position.lerp(targetPos.current, 0.25);
      
      const dx = camera.position.x - pigGroupRef.current.position.x;
      const dz = camera.position.z - pigGroupRef.current.position.z;
      pigGroupRef.current.rotation.y = Math.atan2(dx, dz);
    } 
    else if (floorState === "placed" && isDragging) {
      // Saat digeser (placed & dragging), transisikan perlahan ke posisi jari supaya smooth
      pigGroupRef.current.position.lerp(targetPos.current, 0.3);
      
      // Babi tetap menghadap kamera
      const dx = camera.position.x - pigGroupRef.current.position.x;
      const dz = camera.position.z - pigGroupRef.current.position.z;
      pigGroupRef.current.rotation.y = Math.atan2(dx, dz);
    }
  });

  return (
    <>
      {/* Bidang transparan sangat besar sebagai pendeteksi sentuhan jari untuk menggeser */}
      {floorState === "placed" && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          onPointerDown={(e) => {
            e.stopPropagation();
            setIsDragging(true);
            targetPos.current.set(e.point.x, 0, e.point.z);
            if (e.target && "setPointerCapture" in e.target) {
              (e.target as any).setPointerCapture(e.pointerId);
            }
          }}
          onPointerMove={(e) => {
            if (isDragging) {
              e.stopPropagation();
              targetPos.current.set(e.point.x, 0, e.point.z);
            }
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            setIsDragging(false);
            if (e.target && "releasePointerCapture" in e.target) {
              (e.target as any).releasePointerCapture(e.pointerId);
            }
          }}
          // Kita jadikan transparan sepenuhnya, hanya untuk mendeteksi pointer
          visible={false}
        >
          <planeGeometry args={[100, 100]} />
        </mesh>
      )}

      {/* Model Babi */}
      <group ref={pigGroupRef} position={[0, 0, -3]} scale={pigScale}>
        <PigModelGlb modelUrl={blackPigUrl} />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.65}
          scale={8}
          blur={2}
          far={5}
          resolution={1024}
          color="#000000"
        />
      </group>
      
      {/* Ground plane untuk menerima bayangan directional light (yang asli tetap ada agar bayangan nampak) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial transparent opacity={0.1} /> {/* transparansi 0 agar tak terlihat */}
      </mesh>
    </>
  );
};

const ARScene = ({ floorState, pigScale }: ARSceneProps) => {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 1.2, 0],
        fov: 60,
        near: 0.1,
        far: 100,
      }}
      // HAPUS pointerEvents: "none" agar deteksi jari bisa berjalan!
      style={{ position: "absolute", inset: 0 }}
      gl={{ alpha: true, antialias: true }}
    >
      {(floorState === "detected" || floorState === "placed") && (
        <DeviceOrientationControls />
      )}

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

      {(floorState === "detected" || floorState === "placed") && (
        <Suspense fallback={null}>
          <PlacementPig floorState={floorState} pigScale={pigScale} />
        </Suspense>
      )}
    </Canvas>
  );
};

export default ARScene;