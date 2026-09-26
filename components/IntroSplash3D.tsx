"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { RoundedBox, Text, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

const NAV_BG = "#0E1712";
const ACCENT = "#22C08C";

function Laptop({ onOpened }: { onOpened: () => void }) {
  const lidPivot = useRef<THREE.Group>(null);
  const screenGlow = useRef<THREE.MeshStandardMaterial>(null);
  const logoRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!lidPivot.current) return;

    lidPivot.current.rotation.x = -Math.PI / 2 + 0.05;
    if (logoRef.current) logoRef.current.scale.setScalar(0.001);
    if (screenGlow.current) screenGlow.current.emissiveIntensity = 0;

    const tl = gsap.timeline({ delay: 0.1 });

    tl.to(lidPivot.current.rotation, {
      x: -0.12,
      duration: 1.3,
      ease: "power3.out",
    })
      .to(
        screenGlow.current!,
        { emissiveIntensity: 1.1, duration: 0.5, ease: "power2.out" },
        "-=0.5"
      )
      .to(
        logoRef.current!.scale,
        { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.4"
      )
      .call(() => onOpened());

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group position={[0, -0.3, 0]}>
      <RoundedBox args={[3.2, 0.14, 2.1]} radius={0.05} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#B9BBB8" metalness={0.85} roughness={0.35} />
      </RoundedBox>

      <group ref={lidPivot} position={[0, 0.07, -1.02]}>
        <group position={[0, 1.0, 0]}>
          <RoundedBox args={[3.2, 2.0, 0.1]} radius={0.05} smoothness={4}>
            <meshStandardMaterial color="#B9BBB8" metalness={0.85} roughness={0.35} />
          </RoundedBox>
          <mesh position={[0, 0, 0.056]}>
            <planeGeometry args={[2.95, 1.82]} />
            <meshStandardMaterial
              ref={screenGlow}
              color={NAV_BG}
              emissive={NAV_BG}
              emissiveIntensity={0}
              roughness={0.2}
            />
          </mesh>
          <group ref={logoRef} position={[0, 0, 0.07]}>
            <Text fontSize={0.26} anchorX="right" anchorY="middle" letterSpacing={-0.02} color="white">
              Smart
            </Text>
            <Text
              fontSize={0.26}
              anchorX="left"
              anchorY="middle"
              letterSpacing={-0.02}
              color={ACCENT}
            >
              Click
            </Text>
          </group>
        </group>
      </group>
    </group>
  );
}

function Scene({ onOpened }: { onOpened: () => void }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.3, 5.2]} fov={35} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} castShadow />
      <directionalLight position={[-4, 2, -2]} intensity={0.5} color="#88ffcc" />
      <directionalLight position={[0, 3, -4]} intensity={0.4} color="#ffffff" />
      <pointLight position={[0, 2, 3]} intensity={0.3} />

      <Laptop onOpened={onOpened} />

      <ContactShadows
        position={[0, -0.62, 0]}
        opacity={0.55}
        scale={8}
        blur={2.2}
        far={2}
        resolution={512}
        color="#000000"
      />
    </>
  );
}

const SESSION_KEY = "smartclick_intro_seen";

export default function IntroSplash3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(SESSION_KEY);
    if (!alreadySeen) {
      setShow(true);
      sessionStorage.setItem(SESSION_KEY, "1");
      document.body.style.overflow = "hidden";
    }
    setMounted(true);
  }, []);

  function handleOpened() {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.6,
      delay: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.style.overflow = "";
        setShow(false);
      },
    });
  }

  if (!mounted || !show) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[9999] bg-black">
      <Canvas shadows dpr={[1, 2]}>
        <Scene onOpened={handleOpened} />
      </Canvas>
    </div>
  );
}