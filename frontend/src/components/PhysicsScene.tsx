import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, useBox, usePlane } from "@react-three/cannon";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import Ball from "./Ball";
import Domino from "./Domino";
import DeskAssets from "./DeskAssets";
import { TrendingUp } from "lucide-react";

// Floor component - Invisible but catches shadows
function Floor() {
  const [ref] = usePlane<THREE.Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.5, 0],
    material: { friction: 0.6, restitution: 0.1 },
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <shadowMaterial transparent opacity={0.2} color="#000000" />
    </mesh>
  );
}

// Invisible Wall Component (Supports visible mode for demonstration)
function InvisibleWall({ position, args, rotation, visible = false }: { 
    position: [number, number, number], 
    args: [number, number, number], 
    rotation?: [number, number, number],
    visible?: boolean
}) {
  const [ref] = useBox<THREE.Mesh>(() => ({
    mass: 0,
    position,
    args,
    rotation: rotation ? rotation : [0, 0, 0],
    material: { friction: 0.1, restitution: 0.8 },
  }));

  return (
      <mesh ref={ref}>
          <boxGeometry args={args} />
          <meshBasicMaterial 
            color="#ff0000" 
            transparent={true} 
            opacity={0.3} 
            visible={visible} 
          />
      </mesh>
  )
}

// Circular Boundary - A ring of invisible boxes to keep the ball on the island
function CircularBoundary({ radius, center, segments = 64 }: { radius: number; center: [number, number]; segments?: number }) {
  return (
    <>
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const x = center[0] + Math.cos(angle) * radius;
        const z = center[1] + Math.sin(angle) * radius;
        
        // TAMBAH PENGALI 1.5 agar antar segmen saling mengunci (overlap)
        const segmentWidth = (2 * Math.PI * radius) / segments * 1.5; 
        
        return (
          <InvisibleWall 
            key={`wall-${i}`} 
            position={[x, 5, z]} 
            // Tebalkan sedikit dindingnya (args[2] dari 1 ke 2) agar bola tidak tembus
            args={[segmentWidth, 10, 2]} 
            rotation={[0, -angle, 0]} 
            visible={false} 
          />
        );
      })}
    </>
  );
}


function SceneContent() {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    if (groupRef.current) {
        const targetRotX = -mouse.y * 0.05;
        const targetRotY = mouse.x * 0.05;
        
        // Use lerp for smooth motion without creating new instances
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.1);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1);
    }
  });

  const dominoPositions = useMemo(() => {
      const positions: [number, number, number][] = [];
      for(let i=0; i<5; i++) positions.push([2 + i*0.8, 0, -2.5]);
      positions.push([6, 0, -1.5]);
      positions.push([6.5, 0, -0.5]);
      positions.push([6, 0, 0.5]);
      for(let i=0; i<5; i++) positions.push([5 - i*0.8, 0, 1.5]);
      return positions;
  }, []);

  return (
    <group ref={groupRef}>
         <Physics
            gravity={[0, -12, 0]}
            defaultContactMaterial={{
              friction: 0.5,
              restitution: 0.3,
            }}
          >
            <Floor />
            <CircularBoundary radius={9} center={[6, 0.5]} segments={32} />

            <DeskAssets />
            <Ball position={[0, 2, 0]} />
            {dominoPositions.map((pos, i) => (
              <Domino 
                key={`domino-${i}`} 
                position={pos} 
              />
            ))}
          </Physics>
    </group>
  )
}

export default function PhysicsScene() {
  return (
    <div className="w-full h-full relative group overflow-visible">
      <Canvas
        shadows
        dpr={1} 
        camera={{ position: [-2, 12, 22], fov: 40 }}
        gl={{ 
            alpha: true, 
            antialias: true, 
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
            checkShaderErrors: false 
        }}
        onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                console.warn('WebGL Context Lost. This usually means the GPU is overloaded. Simplifiying Scene...');
            }, false);
        }}
        style={{ background: "transparent", pointerEvents: "auto" }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" blur={1} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={0.8} // Softer light for clay look
            castShadow
            shadow-mapSize-width={512} 
            shadow-mapSize-height={512}
            shadow-bias={-0.0005}
          />
          <ambientLight intensity={0.8} /> 
          
          <ContactShadows 
            resolution={256} 
            scale={20} 
            blur={2.5} 
            opacity={0.2} // Subtle shadows for clay feel
            far={10} 
            color="#000000" 
          />

          <SceneContent />

          {/* 
              REMOVED EffectComposer: 
              Post-processing combined with transparency is often the 
              trigger for 'Context Lost' on many GPUs.
          */}

          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            enableRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
