import { ContactShadows } from "@react-three/drei";

const Ground = () => {
  return (
    <>
      {/* 🔥 Contact Shadow - bayangan presisi mengikuti model */}
      <ContactShadows
        position={[0, 0, -3]}
        opacity={0.65}
        scale={8}
        blur={2}
        far={5}
        resolution={1024}
        color="#000000"
      />

      {/* 🔥 Ground plane - menerima directional shadow */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, -3]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </>
  );
};

export default Ground;