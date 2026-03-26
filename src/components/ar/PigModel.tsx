import { useRef, useMemo, useEffect, useCallback, useLayoutEffect } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type AnimationType = "idle" | "walk" | "jump";

interface PigModelProps {
  animation: AnimationType;
  onJumpComplete?: () => void;
  position?: [number, number, number];
  onClick?: () => void;
  groupRef?: MutableRefObject<THREE.Group | null>;
}

const PigModel = ({
  animation,
  onJumpComplete,
  position = [0, 0, 0],
  onClick,
  groupRef: externalGroupRef
}: PigModelProps) => {

  const internalGroupRef = useRef<THREE.Group>(null);
  const groupRef = externalGroupRef ?? internalGroupRef;

  const modelRef = useRef<THREE.Group>(null);

  const baseYRef = useRef(0);
  const offsetYRef = useRef(0);

  const jumpProgressRef = useRef(0);
  const walkPhase = useRef(0);
  const idlePhase = useRef(0);
  const isJumping = useRef(false);

  // ================= AUDIO =================
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playOink = useCallback(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }

    const ctx = audioCtxRef.current;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const duration = 0.3;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + duration);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + duration);
  }, []);

  // ================= GEOMETRY =================
  const pigParts = useMemo(() => ({
    bodyGeom: new THREE.CapsuleGeometry(0.18, 0.3, 8, 16),
    headGeom: new THREE.SphereGeometry(0.14, 16, 16),
    snoutGeom: new THREE.CylinderGeometry(0.06, 0.07, 0.06, 12),
    earGeom: new THREE.ConeGeometry(0.04, 0.08, 8),
    legGeom: new THREE.CylinderGeometry(0.03, 0.035, 0.12, 8),
    eyeGeom: new THREE.SphereGeometry(0.02, 8, 8),
    tailGeom: new THREE.TorusGeometry(0.03, 0.008, 6, 12, Math.PI * 1.5)
  }), []);

  const pinkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f5a0b5" }), []);
  const darkPinkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e8879e" }), []);
  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a1a1a" }), []);
  const noseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d4748a" }), []);

  // ================= REFS =================
  const legFLRef = useRef<THREE.Mesh>(null);
  const legFRRef = useRef<THREE.Mesh>(null);
  const legBLRef = useRef<THREE.Mesh>(null);
  const legBRRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  // ================= AUTO ALIGN KE LANTAI =================
  useLayoutEffect(() => {
    if (!modelRef.current) return;

    const box = new THREE.Box3().setFromObject(modelRef.current);
    if (!Number.isFinite(box.min.y)) return;

    offsetYRef.current = -box.min.y;
  }, []);

  // ================= INIT POSITION =================
  useEffect(() => {
    if (!groupRef.current) return;

    groupRef.current.position.set(position[0], 0, position[2]);
    baseYRef.current = 0;
  }, [position]);

  // ================= JUMP =================
  useEffect(() => {
    if (animation === "jump" && !isJumping.current) {
      isJumping.current = true;
      jumpProgressRef.current = 0;
    }
  }, [animation]);

  // ================= FRAME =================
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const speed = delta * 3;

    if (isJumping.current) {
      jumpProgressRef.current += delta * 2.5;

      const t = Math.min(jumpProgressRef.current, 1);
      const height = Math.sin(t * Math.PI) * 0.3;

      groupRef.current.position.y = baseYRef.current + height;

      if (t >= 1) {
        isJumping.current = false;
        onJumpComplete?.();
      }

      return;
    }

    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      baseYRef.current,
      speed
    );

    // WALK
    if (animation === "walk") {
      walkPhase.current += delta * 6;
      const swing = Math.sin(walkPhase.current) * 0.4;

      legFLRef.current && (legFLRef.current.rotation.x = swing);
      legBRRef.current && (legBRRef.current.rotation.x = swing);
      legFRRef.current && (legFRRef.current.rotation.x = -swing);
      legBLRef.current && (legBLRef.current.rotation.x = -swing);

      headRef.current && (headRef.current.rotation.x = Math.sin(walkPhase.current) * 0.05);
      tailRef.current && (tailRef.current.rotation.z = Math.sin(walkPhase.current * 4) * 0.4);
    }

    // IDLE
    else {
      idlePhase.current += delta * 2;
      const breathe = Math.sin(idlePhase.current) * 0.01;

      bodyRef.current && (bodyRef.current.scale.y = 1 + breathe);
      tailRef.current && (tailRef.current.rotation.z = Math.sin(idlePhase.current * 3) * 0.3);

      [legFLRef, legFRRef, legBLRef, legBRRef].forEach((ref) => {
        if (ref.current) {
          ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0, speed);
        }
      });
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={() => {
        onClick?.();
        playOink();
      }}
      scale={0.3}
    >
      {/* 🔥 AUTO OFFSET */}
      <group ref={modelRef} position={[0, offsetYRef.current, 0]}>

        {/* BODY */}
        <mesh ref={bodyRef} geometry={pigParts.bodyGeom} material={pinkMat} rotation={[0, 0, Math.PI / 2]} position={[0, 0.22, 0]} />

        {/* HEAD */}
        <group ref={headRef} position={[0.28, 0.3, 0]}>
          <mesh geometry={pigParts.headGeom} material={pinkMat} />
          <mesh geometry={pigParts.snoutGeom} material={noseMat} position={[0.12, -0.02, 0]} rotation={[0, 0, Math.PI / 2]} />
          <mesh geometry={pigParts.eyeGeom} material={darkMat} position={[0.08, 0.04, 0.08]} />
          <mesh geometry={pigParts.eyeGeom} material={darkMat} position={[0.08, 0.04, -0.08]} />
        </group>

        {/* TAIL */}
        <mesh ref={tailRef} geometry={pigParts.tailGeom} material={darkPinkMat} position={[-0.32, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} />

        {/* LEGS */}
        <mesh ref={legFLRef} geometry={pigParts.legGeom} material={darkPinkMat} position={[0.12, 0.06, 0.1]} />
        <mesh ref={legFRRef} geometry={pigParts.legGeom} material={darkPinkMat} position={[0.12, 0.06, -0.1]} />
        <mesh ref={legBLRef} geometry={pigParts.legGeom} material={darkPinkMat} position={[-0.12, 0.06, 0.1]} />
        <mesh ref={legBRRef} geometry={pigParts.legGeom} material={darkPinkMat} position={[-0.12, 0.06, -0.1]} />

      </group>
    </group>
  );
};

export default PigModel;