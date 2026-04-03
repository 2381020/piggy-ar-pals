import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Komponen ini membaca gyroscope/orientation sensor dari HP
 * dan memutar kamera 3D sesuai gerakan HP.
 * Sehingga objek 3D tampak "diam di tempat" di dunia nyata.
 */

const DeviceOrientationCamera = () => {
  const { camera } = useThree();

  const orientationRef = useRef({
    alpha: 0,  // compass direction (0-360)
    beta: 0,   // tilt front-back (-180 to 180)
    gamma: 0,  // tilt left-right (-90 to 90)
  });

  const initialAlphaRef = useRef<number | null>(null);
  const enabled = useRef(false);

  // Helper quaternions (reusable, no GC pressure)
  const zee = useRef(new THREE.Vector3(0, 0, 1));
  const euler = useRef(new THREE.Euler());
  const q0 = useRef(new THREE.Quaternion());
  const q1 = useRef(new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5))); // -90° around X

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha === null || event.beta === null || event.gamma === null) return;

      // Simpan alpha awal untuk offset (babi muncul di depan user)
      if (initialAlphaRef.current === null) {
        initialAlphaRef.current = event.alpha;
      }

      orientationRef.current = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
      };

      enabled.current = true;
    };

    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  useFrame(() => {
    if (!enabled.current) return;

    const { alpha, beta, gamma } = orientationRef.current;
    const initialAlpha = initialAlphaRef.current ?? 0;

    // Konversi derajat ke radian
    const alphaRad = THREE.MathUtils.degToRad(alpha - initialAlpha); // offset supaya babi di depan
    const betaRad = THREE.MathUtils.degToRad(beta);
    const gammaRad = THREE.MathUtils.degToRad(gamma);

    // Algoritma dari THREE.DeviceOrientationControls
    // Set Euler dari device orientation
    euler.current.set(betaRad, alphaRad, -gammaRad, "YXZ");

    // Convert ke quaternion
    camera.quaternion.setFromEuler(euler.current);

    // Kompensasi: device orientation API mengasumsikan landscape,
    // kita perlu rotate -90° around Z untuk portrait mode
    camera.quaternion.multiply(q1.current);

    // Kompensasi orientasi layar (portrait)
    const screenOrientation = window.screen.orientation?.angle || 0;
    q0.current.setFromAxisAngle(zee.current, -THREE.MathUtils.degToRad(screenOrientation));
    camera.quaternion.premultiply(q0.current);
  });

  return null;
};

export default DeviceOrientationCamera;
