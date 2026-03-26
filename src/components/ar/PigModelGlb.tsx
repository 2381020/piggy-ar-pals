import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAnimations, useGLTF } from "@react-three/drei";

type AnimationType = "idle" | "walk" | "jump";

interface PigModelGlbProps {
  animation: AnimationType;
  modelUrl: string;
  onJumpComplete?: () => void;
  onClick?: () => void;
  groupRef: MutableRefObject<THREE.Group | null>;
}

const PigModelGlb = ({
  animation,
  modelUrl,
  onJumpComplete,
  onClick,
  groupRef
}: PigModelGlbProps) => {

  const modelScale = 1.1;

  const wrapperRef = useRef<THREE.Group | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  const baseYRef = useRef(0);
  const isJumping = useRef(false);
  const jumpProgressRef = useRef(0);

  const setWrapperRef = useCallback((node: THREE.Group | null) => {
    wrapperRef.current = node;
    groupRef.current = node;
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

  // ================= BASE Y =================
  useEffect(() => {
    if (!wrapperRef.current) return;

    wrapperRef.current.position.y = 0;
    baseYRef.current = 0;
  }, []);

  // ================= 🔍 DEBUG ANIMATION =================
  useEffect(() => {
    console.log("Animation Clips:", animations.map(a => a.name));
  }, [animations]);

  // ================= 🔥 AUTO PLAY (TEST) =================
  useEffect(() => {
    if (!actions) return;

    Object.values(actions).forEach((action) => {
      action.reset().fadeIn(0.3).play();
    });
  }, [actions]);

  // ================= JUMP =================
  useEffect(() => {
    if (animation === "jump" && !isJumping.current) {
      isJumping.current = true;
      jumpProgressRef.current = 0;
    }
  }, [animation]);

  useFrame((_, delta) => {
    if (!wrapperRef.current) return;

    if (isJumping.current) {
      jumpProgressRef.current += delta * 2.5;

      const t = Math.min(jumpProgressRef.current, 1);
      const height = Math.sin(t * Math.PI) * 0.3;

      wrapperRef.current.position.y = baseYRef.current + height;

      if (t >= 1) {
        isJumping.current = false;
        onJumpComplete?.();
      }

      return;
    }

    wrapperRef.current.position.y = THREE.MathUtils.lerp(
      wrapperRef.current.position.y,
      baseYRef.current,
      delta * 5
    );
  });

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