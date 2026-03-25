import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type AnimationType = "idle" | "walk" | "jump";

interface PigModelProps {
  animation: AnimationType;
  onJumpComplete?: () => void;
  position?: [number, number, number];
  onClick?: () => void;
}

const PigModel = ({ animation, onJumpComplete, position = [0, 0, 0], onClick }: PigModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [jumpProgress, setJumpProgress] = useState(0);
  const walkPhase = useRef(0);
  const idlePhase = useRef(0);
  const isJumping = useRef(false);

  // Create pig geometry parts
  const pigParts = useMemo(() => {
    // Body
    const bodyGeom = new THREE.CapsuleGeometry(0.18, 0.3, 8, 16);
    // Head
    const headGeom = new THREE.SphereGeometry(0.14, 16, 16);
    // Snout
    const snoutGeom = new THREE.CylinderGeometry(0.06, 0.07, 0.06, 12);
    // Ears
    const earGeom = new THREE.ConeGeometry(0.04, 0.08, 8);
    // Legs
    const legGeom = new THREE.CylinderGeometry(0.03, 0.035, 0.12, 8);
    // Eyes
    const eyeGeom = new THREE.SphereGeometry(0.02, 8, 8);
    // Tail
    const tailGeom = new THREE.TorusGeometry(0.03, 0.008, 6, 12, Math.PI * 1.5);

    return { bodyGeom, headGeom, snoutGeom, earGeom, legGeom, eyeGeom, tailGeom };
  }, []);

  const pinkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f5a0b5", roughness: 0.6 }), []);
  const darkPinkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e8879e", roughness: 0.5 }), []);
  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a1a1a", roughness: 0.3 }), []);
  const noseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d4748a", roughness: 0.4 }), []);

  // Refs for animated parts
  const legFLRef = useRef<THREE.Mesh>(null);
  const legFRRef = useRef<THREE.Mesh>(null);
  const legBLRef = useRef<THREE.Mesh>(null);
  const legBRRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (animation === "jump" && !isJumping.current) {
      isJumping.current = true;
      setJumpProgress(0);
    }
  }, [animation]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const speed = delta * 3;

    // Idle animation
    if (animation === "idle" || (animation !== "walk" && !isJumping.current)) {
      idlePhase.current += delta * 2;
      const breathe = Math.sin(idlePhase.current) * 0.005;
      
      if (bodyRef.current) {
        bodyRef.current.scale.y = 1 + breathe;
      }
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(idlePhase.current * 0.5) * 0.03;
      }
      if (tailRef.current) {
        tailRef.current.rotation.z = Math.sin(idlePhase.current * 3) * 0.3;
      }
      // Reset legs
      [legFLRef, legFRRef, legBLRef, legBRRef].forEach(ref => {
        if (ref.current) {
          ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0, speed);
        }
      });
    }

    // Walk animation
    if (animation === "walk") {
      walkPhase.current += delta * 6;
      const swing = Math.sin(walkPhase.current) * 0.4;

      if (legFLRef.current) legFLRef.current.rotation.x = swing;
      if (legBRRef.current) legBRRef.current.rotation.x = swing;
      if (legFRRef.current) legFRRef.current.rotation.x = -swing;
      if (legBLRef.current) legBLRef.current.rotation.x = -swing;

      if (bodyRef.current) {
        bodyRef.current.position.y = Math.abs(Math.sin(walkPhase.current * 2)) * 0.01;
      }
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(walkPhase.current) * 0.05;
      }
      if (tailRef.current) {
        tailRef.current.rotation.z = Math.sin(walkPhase.current * 4) * 0.4;
      }
    }

    // Jump animation
    if (isJumping.current) {
      setJumpProgress(prev => {
        const next = prev + delta * 2.5;
        if (next >= 1) {
          isJumping.current = false;
          onJumpComplete?.();
          return 0;
        }
        return next;
      });

      const jumpHeight = Math.sin(jumpProgress * Math.PI) * 0.35;
      groupRef.current.position.y = jumpHeight;

      // Tuck legs during jump
      const tuck = Math.sin(jumpProgress * Math.PI) * 0.6;
      if (legFLRef.current) legFLRef.current.rotation.x = -tuck;
      if (legFRRef.current) legFRRef.current.rotation.x = -tuck;
      if (legBLRef.current) legBLRef.current.rotation.x = tuck;
      if (legBRRef.current) legBRRef.current.rotation.x = tuck;
    } else if (animation !== "walk") {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, speed);
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={onClick} scale={1.8}>
      {/* Body */}
      <mesh ref={bodyRef} geometry={pigParts.bodyGeom} material={pinkMat} rotation={[0, 0, Math.PI / 2]} position={[0, 0.22, 0]} castShadow />

      {/* Head */}
      <group ref={headRef} position={[0.28, 0.3, 0]}>
        <mesh geometry={pigParts.headGeom} material={pinkMat} castShadow />
        {/* Snout */}
        <mesh geometry={pigParts.snoutGeom} material={noseMat} position={[0.12, -0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow />
        {/* Eyes */}
        <mesh geometry={pigParts.eyeGeom} material={darkMat} position={[0.08, 0.04, 0.08]} />
        <mesh geometry={pigParts.eyeGeom} material={darkMat} position={[0.08, 0.04, -0.08]} />
        {/* Ears */}
        <mesh geometry={pigParts.earGeom} material={darkPinkMat} position={[-0.02, 0.14, 0.08]} rotation={[0, 0, -0.3]} castShadow />
        <mesh geometry={pigParts.earGeom} material={darkPinkMat} position={[-0.02, 0.14, -0.08]} rotation={[0, 0, -0.3]} castShadow />
      </group>

      {/* Tail */}
      <mesh ref={tailRef} geometry={pigParts.tailGeom} material={darkPinkMat} position={[-0.32, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} />

      {/* Front legs */}
      <mesh ref={legFLRef} geometry={pigParts.legGeom} material={darkPinkMat} position={[0.12, 0.06, 0.1]} castShadow />
      <mesh ref={legFRRef} geometry={pigParts.legGeom} material={darkPinkMat} position={[0.12, 0.06, -0.1]} castShadow />
      {/* Back legs */}
      <mesh ref={legBLRef} geometry={pigParts.legGeom} material={darkPinkMat} position={[-0.12, 0.06, 0.1]} castShadow />
      <mesh ref={legBRRef} geometry={pigParts.legGeom} material={darkPinkMat} position={[-0.12, 0.06, -0.1]} castShadow />
    </group>
  );
};

export default PigModel;
