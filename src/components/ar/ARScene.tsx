import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, DeviceOrientationControls, ContactShadows } from "@react-three/drei";
import { Suspense, useRef } from "react";
import PigModelGlb from "./PigModelGlb";
import Ground from "./Ground";
import * as THREE from "three";
import blackPigUrl from "../../assets/black-pig.glb";

type FloorState = "searching" | "detected" | "placed";

interface ARSceneProps {
  floorState: FloorState;
}

const PlacementPig = ({ floorState }: { floorState: FloorState }) => {
  const pigGroupRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();
  
  const raycaster = useRef(new THREE.Raycaster());
  // Bidang lantai diasumsikan di ketinggian y=0
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const targetPos = useRef(new THREE.Vector3(0, 0, -3));

  useFrame(() => {
    if (!pigGroupRef.current) return;

    if (floorState === "detected") {
      // 1. Tembak raycaster dari tengah layar (koordinat 0,0 dari kamera) ke lantai Y=0
      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
      const hitPoint = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane.current, hitPoint);
      
      if (hitPoint) {
        // Jangan biarkan babi jatuh terlalu jauh (max radius 8 meter dari kamera)
        const camPosFloor = new THREE.Vector3(camera.position.x, 0, camera.position.z);
        if (hitPoint.distanceTo(camPosFloor) > 8) {
           const dir = hitPoint.sub(camPosFloor).normalize();
           hitPoint.copy(camPosFloor.clone().add(dir.multiplyScalar(8)));
        }
        targetPos.current.copy(hitPoint);
      }

      // 2. Transisi posisi babi secara halus ke tujuan (efek dragging)
      pigGroupRef.current.position.lerp(targetPos.current, 0.15);
      
      // 3. Pastikan babi selalu memutar wajahnya menatap arah kamera (user)
      const dx = camera.position.x - pigGroupRef.current.position.x;
      const dz = camera.position.z - pigGroupRef.current.position.z;
      pigGroupRef.current.rotation.y = Math.atan2(dx, dz);
    }
  });

  return (
    // Grup ini bergerak saat "detected", lalu DIAM PERMANEN saat "placed"
    <group ref={pigGroupRef} position={[0, 0, -3]}>
      {/* Jangan teruskan groupRef ke dalam PigModelGlb karena ref sudah dipakai di <group> wrapper ini */}
      <PigModelGlb modelUrl={blackPigUrl} />
      
      {/* Contact Shadow digabung ke grup babi, jadi akan ikut pindah-pindah otomatis */}
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
  );
};

const ARScene = ({ floorState }: ARSceneProps) => {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 1.2, 0], // Setinggi mata rata-rata user (~1.2m) di dunia virtual
        fov: 60,
        near: 0.1,
        far: 100,
      }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      gl={{ alpha: true, antialias: true }}
    >
      {/* 🔥 Gyroscope Control aktif agar kamera bisa berputar saat user mencari tempat */}
      {(floorState === "detected" || floorState === "placed") && (
        <DeviceOrientationControls />
      )}

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

      {/* Tampilkan babi saat sedang "detected" (preview posisi) atau "placed" (fix) */}
      {(floorState === "detected" || floorState === "placed") && (
        <Suspense fallback={null}>
          <PlacementPig floorState={floorState} />
        </Suspense>
      )}

      {/* Ground (Penerima bayangan matahari) selalu di tengah dunia di Y = 0 */}
      {(floorState === "detected" || floorState === "placed") && <Ground />}
    </Canvas>
  );
};

export default ARScene;