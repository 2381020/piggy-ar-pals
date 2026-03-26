import { ContactShadows } from "@react-three/drei";

const Ground = () => {
  return (
    <>
      {/* 🔥 Contact Shadow (lebih presisi) */}
      <ContactShadows
        position={[0, 0, 0]}   // 🔥 sejajar lantai (bukan -0.01)
        opacity={0.5}
        scale={6}              // 🔥 jangan terlalu besar
        blur={2}
        far={3}                // 🔥 lebih fokus
        resolution={512}       // 🔥 shadow lebih halus
        color="#000000"
      />

      {/* 🔥 Invisible ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}   // 🔥 sejajar dengan shadow
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </>
  );
};

export default Ground;