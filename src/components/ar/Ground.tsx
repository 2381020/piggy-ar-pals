import { ContactShadows } from "@react-three/drei";

const Ground = () => {
  return (
    <>
      {/* Contact shadows for realistic grounding */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.6}
        scale={10}
        blur={2.5}
        far={4}
        color="#000000"
      />
      {/* Transparent ground plane for visual reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </>
  );
};

export default Ground;
