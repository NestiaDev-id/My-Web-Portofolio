import { useCompoundBody } from "@react-three/cannon";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "@/providers/ThemeProvider";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

// Colors for smooth transition
const LIGHT_CLAY = new THREE.Color("#f0f0f0");
const DARK_CLAY = new THREE.Color("#2a2a2a");
const LIGHT_SCREEN = new THREE.Color("#f5f5f5");
const DARK_SCREEN = new THREE.Color("#1a1a1a");

function Laptop({ position, rotation = [0, -0.3, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const { theme } = useTheme();
  const screenAngle = -0.4;
  const isDark = theme === "dark";
  
  const baseMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const displayMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const [ref] = useCompoundBody<THREE.Group>(() => ({
    mass: 0, 
    position,
    rotation,
    shapes: [
      { type: "Box", args: [3, 0.2, 2], position: [0, 0.1, 0] },
      { 
        type: "Box", 
        args: [3, 2, 0.1], 
        position: [0, 1.1, -0.95], 
        rotation: [screenAngle, 0, 0] 
      },
    ],
  }));

  useFrame(() => {
    const targetBody = isDark ? DARK_CLAY : LIGHT_CLAY;
    const targetScreen = isDark ? DARK_SCREEN : LIGHT_SCREEN;
    const targetEmissive = isDark ? 1 : 2;

    if (baseMatRef.current) baseMatRef.current.color.lerp(targetBody, 0.1);
    if (screenMatRef.current) screenMatRef.current.color.lerp(targetScreen, 0.1);
    if (displayMatRef.current) {
        displayMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(displayMatRef.current.emissiveIntensity, targetEmissive, 0.1);
    }
  });

  return (
    <group ref={ref}>
      <group position={[0, 0.1, 0]}>
        <RoundedBox args={[3, 0.2, 2]} radius={0.05} smoothness={4}>
          <meshStandardMaterial ref={baseMatRef} color={isDark ? DARK_CLAY : LIGHT_CLAY} roughness={1.0} metalness={0.05} />
        </RoundedBox>
      </group>

      <group position={[0, 0.2, -0.9]} rotation={[screenAngle, 0, 0]}>
        <group position={[0, 1, 0]}>
          <RoundedBox args={[3, 2, 0.1]} radius={0.05} smoothness={4}>
            <meshStandardMaterial ref={screenMatRef} color={isDark ? DARK_SCREEN : LIGHT_SCREEN} roughness={1.0} metalness={0.05} />
          </RoundedBox>
          
          <mesh position={[0, 0, 0.051]}>
            <planeGeometry args={[2.8, 1.8]} />
            <meshPhysicalMaterial 
               ref={displayMatRef}
               color="#ffffff"
               emissive="#3498db"
               emissiveIntensity={isDark ? 1 : 2}
               roughness={0.1}
               transmission={1}
               transparent
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function CoffeeCup({ position }: { position: [number, number, number] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const size = 0.7; 
  const height = 0.8;
  const thickness = 0.1;
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  const [ref] = useCompoundBody<THREE.Group>(() => ({
    mass: 0, 
    position,
    shapes: [
      { type: "Box", args: [size * 1.5, 0.1, size * 1.5], position: [0, 0.6, 0] },
      { type: "Box", args: [thickness, height, size * 2], position: [-size, 0.4, 0] }, 
      { type: "Box", args: [thickness, height, size * 2], position: [size, 0.4, 0] },  
      { type: "Box", args: [size * 2, height, thickness], position: [0, 0.4, -size] }, 
      { type: "Box", args: [size * 2, height, thickness], position: [0, 0.4, size] },  
    ],
  }));

  useFrame(() => {
    const target = isDark ? DARK_CLAY : LIGHT_CLAY;
    if (matRef.current) matRef.current.color.lerp(target, 0.1);
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[size, size * 0.6, height, 32]} />
        <meshStandardMaterial ref={matRef} color={isDark ? DARK_CLAY : LIGHT_CLAY} roughness={1.0} metalness={0.0} />
      </mesh>
      
      <mesh position={[size, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.2, 0.05, 16, 32]} />
        <meshStandardMaterial ref={matRef} color={isDark ? DARK_CLAY : LIGHT_CLAY} roughness={1.0} />
      </mesh>
    </group>
  );
}

export default function DeskAssets() {
  return (
    <group>
        <Laptop position={[3, 0, -1]} rotation={[0, -0.3, 0]} />
        <CoffeeCup position={[8.5, 0, 0.5]} />
        
        <mesh position={[4.5, -0.1, 0.5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[6, 32]} />
            <shadowMaterial transparent opacity={0.15} color="#000" />
        </mesh>
    </group>
  );
}
