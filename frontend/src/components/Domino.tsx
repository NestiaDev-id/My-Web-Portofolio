import { useBox } from "@react-three/cannon";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export default function Domino({
  position,
}: {
  position: [number, number, number];
}) {
  const [ref] = useBox<THREE.Mesh>(() => ({
    mass: 1,
    position,
    args: [0.2, 1, 0.5], 
    material: { friction: 0.3, restitution: 0.5 },
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <RoundedBox args={[0.2, 1, 0.5]} radius={0.05} smoothness={4}>
        <meshStandardMaterial 
            color="#f5f5f5" 
            roughness={0.9} 
            metalness={0.05} 
        />
      </RoundedBox>
    </mesh>
  );
}
