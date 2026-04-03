import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { useAnimations, useGLTF } from "@react-three/drei";

interface PigModelGlbProps {
  modelUrl: string;
  onClick?: () => void;
  groupRef?: MutableRefObject<THREE.Group | null>;
}

const PigModelGlb = ({
  modelUrl,
  onClick,
  groupRef
}: PigModelGlbProps) => {

  const modelScale = 1.1;

  const wrapperRef = useRef<THREE.Group | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  const setWrapperRef = useCallback((node: THREE.Group | null) => {
    wrapperRef.current = node;
    if (groupRef) {
      groupRef.current = node;
    }
  }, [groupRef]);

  const { scene, animations } = useGLTF(modelUrl) as unknown as {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
  };

  const { actions } = useAnimations(animations, modelRef);

  const [offset, setOffset] = useState(new THREE.Vector3());

  // ================= AUTO ALIGN =================
  useEffect(() => {
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    if (!Number.isFinite(box.min.y)) return;

    const center = box.getCenter(new THREE.Vector3());

    const offsetX = -center.x * modelScale;
    const offsetZ = -center.z * modelScale;
    const offsetY = -box.min.y * modelScale;

    setOffset(new THREE.Vector3(offsetX, offsetY, offsetZ));
  }, [scene]);

  // ================= ENABLE SHADOW =================
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  // ================= BASE Y =================
  useEffect(() => {
    if (!wrapperRef.current) return;
    wrapperRef.current.position.y = 0;
  }, []);

  // ================= AUTO PLAY IDLE ANIMATION =================
  useEffect(() => {
    if (!actions) return;

    Object.values(actions).forEach((action) => {
      if (action) {
        action.reset().fadeIn(0.3).play();
      }
    });
  }, [actions]);

  // ================= RENDER =================
  return (
    <group
      ref={setWrapperRef}
      onClick={onClick}
    >
      <primitive
        object={scene}
        ref={modelRef}
        scale={[modelScale, modelScale, modelScale]}
        position={[offset.x, offset.y, offset.z]}
      />
    </group>
  );
};

export default PigModelGlb;