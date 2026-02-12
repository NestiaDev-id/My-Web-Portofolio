import { useSphere } from "@react-three/cannon";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface BallProps {
  position?: [number, number, number];
  radius?: number;
}

export default function Ball({
  position = [-4, 0.5, 0],
  radius = 0.3,
}: BallProps) {
  const { camera, mouse, raycaster } = useThree();
  const [isHeld, setIsHeld] = useState(false);
  const [ref, api] = useSphere<THREE.Mesh>(() => ({
    mass: 5,
    position,
    args: [radius],
    material: { friction: 0.4, restitution: 0.3 },
    linearDamping: 0.1,
    angularDamping: 0.1,
  }));

  // Keyboard state
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Raycasting plane for dragging - Match the 'held height' (y=2) to avoid parallax offset
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -2));
  const planeIntersect = useRef(new THREE.Vector3());

  useFrame(() => {
    if (isHeld) {
      // Logic for dragging the ball
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(dragPlane.current, planeIntersect.current)) {
        // RADIAL CONSTRAINT: Stay within circular island (Center [4.5, 0.5], Radius 12)
        const centerX = 4.5;
        const centerZ = 0.5;
        const maxRadius = 12.0;

        const deltaX = planeIntersect.current.x - centerX;
        const deltaZ = planeIntersect.current.z - centerZ;
        const distance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);

        let targetX = planeIntersect.current.x;
        let targetZ = planeIntersect.current.z;

        if (distance > maxRadius) {
          const ratio = maxRadius / distance;
          targetX = centerX + deltaX * ratio;
          targetZ = centerZ + deltaZ * ratio;
        }
        
        api.position.set(targetX, 2, targetZ);
        api.velocity.set(0, 0, 0); 
        api.angularVelocity.set(0, 0, 0);
      }
    } else {
      // WASD Controls - Increased force for snappier movement
      const force = 35; 
      const direction = new THREE.Vector3(0, 0, 0);

      if (keys.current["w"]) direction.z -= 1;
      if (keys.current["s"]) direction.z += 1;
      if (keys.current["a"]) direction.x -= 1;
      if (keys.current["d"]) direction.x += 1;

      if (direction.length() > 0) {
        direction.normalize().multiplyScalar(force);
        api.applyForce([direction.x, 0, direction.z], [0, 0, 0]);
      }
    }
  });

  return (
    <mesh
      ref={ref}
      castShadow
      onPointerDown={(e: any) => {
        e.stopPropagation();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setIsHeld(true);
      }}
      onPointerUp={(e: any) => {
        e.stopPropagation();
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        setIsHeld(false);
        // Add a little downward impulse when released
        api.velocity.set(0, -2, 0);
      }}
      style={{ cursor: isHeld ? "grabbing" : "grab" } as any}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshPhysicalMaterial
        color={isHeld ? "#f1c40f" : "#ffffff"} 
        transmission={1.0}        // Full transparency
        roughness={0.1}          // Slight blur for frosted look
        thickness={0.5}          // Glass thickness effect
        envMapIntensity={2.0}    // Realistic reflections
        metalness={0.05}
        clearcoat={1.0}          // Extra shiny coat
        clearcoatRoughness={0.05}
        emissive={isHeld ? "#f1c40f" : "#a5d8ff"}
        emissiveIntensity={isHeld ? 0.8 : 0.2}
        attenuationColor="#ffffff"
        attenuationDistance={0.5}
        transparent
      />
    </mesh>
  );
}
