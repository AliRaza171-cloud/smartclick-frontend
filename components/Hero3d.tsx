"use client";

import { Canvas } from "@react-three/fiber";
import { Float, RoundedBox, ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

// Abstract, brand-colored floating shapes rather than a literal product photo —
// deliberately not trying to render a specific product in 3D (that needs real
// scanned/modeled assets, which don't exist yet). This is the landing page's
// visual signature piece, swapped for real per-product 3D/360° views in
// Phase 5 once actual product photography exists.
function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={1.3} />
      <directionalLight position={[-4, -2, -4]} intensity={0.3} />

      <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
        <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.18} smoothness={4} position={[0, 0.1, 0]}>
          <meshStandardMaterial color="#0F8A6E" roughness={0.35} metalness={0.1} />
        </RoundedBox>
      </Float>

      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1} position={[1.7, -0.7, -0.6]}>
        <mesh>
          <torusGeometry args={[0.5, 0.16, 16, 64]} />
          <meshStandardMaterial color="#141413" roughness={0.4} />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1.4} position={[-1.6, 0.9, -0.4]}>
        <mesh>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial color="#D9C7A3" roughness={0.5} />
        </mesh>
      </Float>

      <ContactShadows position={[0, -1.3, 0]} opacity={0.3} scale={6} blur={2.4} far={2} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.6}
        maxPolarAngle={Math.PI / 2 + 0.25}
        minPolarAngle={Math.PI / 2 - 0.4}
      />
    </>
  );
}

export default function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 40 }} dpr={[1, 2]} style={{ background: "transparent" }}>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}