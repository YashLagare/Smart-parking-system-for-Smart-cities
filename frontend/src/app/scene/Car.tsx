'use client';

import React, { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface CarProps {
  vehicleRef: React.RefObject<THREE.Group | null>;
  flWheelRef: React.RefObject<THREE.Object3D | null>;
  frWheelRef: React.RefObject<THREE.Object3D | null>;
  rlWheelRef: React.RefObject<THREE.Object3D | null>;
  rrWheelRef: React.RefObject<THREE.Object3D | null>;
  headlightsIntensity: number;
  brakeLightsActive: boolean;
}

// ─── MATERIAL PRESETS ───────────────────────────────────────────────
const BODY_PAINT = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#8b0000'),
  roughness: 0.12,
  metalness: 0.95,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
  envMapIntensity: 1.8,
  reflectivity: 1.0,
});

const DARK_CHROME = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#1a1a1a'),
  roughness: 0.15,
  metalness: 1.0,
  clearcoat: 0.8,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.5,
});

const CHROME_TRIM = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#c0c0c0'),
  roughness: 0.05,
  metalness: 1.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.02,
  envMapIntensity: 2.0,
});

const GLASS_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#0a1628'),
  roughness: 0.0,
  metalness: 0.0,
  transmission: 0.92,
  thickness: 0.8,
  transparent: true,
  opacity: 0.4,
  ior: 1.5,
  envMapIntensity: 1.2,
});

const TIRE_RUBBER = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#1a1a1a'),
  roughness: 0.9,
  metalness: 0.0,
});

const WHEEL_RIM = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#888888'),
  roughness: 0.2,
  metalness: 0.9,
  clearcoat: 0.6,
  clearcoatRoughness: 0.15,
  envMapIntensity: 1.4,
});

const INTERIOR = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#0d0d0d'),
  roughness: 0.8,
  metalness: 0.1,
});

const LIGHT_LENS = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#ffffff'),
  roughness: 0.0,
  metalness: 0.0,
  transmission: 0.6,
  transparent: true,
  opacity: 0.6,
  ior: 1.5,
});

// ─── HELPER: categorize mesh by name ────────────────────────────────
function assignMaterial(name: string): THREE.Material | null {
  const n = name.toLowerCase();

  // Body panels and main shell
  if (n.includes('body') || n.includes('hood') || n.includes('fender') ||
      n.includes('door') || n.includes('bumper') || n.includes('trunk') ||
      n.includes('roof') || n.includes('panel') || n.includes('quarter') ||
      n.includes('spoiler') || n.includes('skirt') || n.includes('shell')) {
    return BODY_PAINT;
  }

  // Glass / windows
  if (n.includes('glass') || n.includes('window') || n.includes('windshield') ||
      n.includes('windscreen')) {
    return GLASS_MATERIAL;
  }

  // Light lenses
  if (n.includes('light') || n.includes('lamp') || n.includes('headlight') ||
      n.includes('taillight') || n.includes('signal')) {
    return LIGHT_LENS;
  }

  // Tires
  if (n.includes('tire') || n.includes('tyre') || n.includes('rubber')) {
    return TIRE_RUBBER;
  }

  // Wheel rims / spokes
  if (n.includes('rim') || n.includes('spoke') || n.includes('hub') ||
      n.includes('disc') || n.includes('brake')) {
    return WHEEL_RIM;
  }

  // Chrome trim parts
  if (n.includes('chrome') || n.includes('grill') || n.includes('grille') ||
      n.includes('exhaust') || n.includes('mirror') || n.includes('handle')) {
    return CHROME_TRIM;
  }

  // Dark accents / diffuser / undercarriage
  if (n.includes('diffuser') || n.includes('splitter') || n.includes('under') ||
      n.includes('bottom') || n.includes('frame') || n.includes('chassis')) {
    return DARK_CHROME;
  }

  // Interior
  if (n.includes('interior') || n.includes('seat') || n.includes('dash') ||
      n.includes('steering') || n.includes('console') || n.includes('carpet')) {
    return INTERIOR;
  }

  return null;
}

export default function Car({
  vehicleRef,
  flWheelRef,
  frWheelRef,
  rlWheelRef,
  rrWheelRef,
  headlightsIntensity,
  brakeLightsActive,
}: CarProps) {
  // Load Aventador GLB model
  const { scene } = useGLTF('/assets/CAR Model.glb');
  const clonedCar = useMemo(() => scene.clone(), [scene]);

  // Bind wheel references, smooth normals, and apply PBR materials
  useEffect(() => {
    const fl = clonedCar.getObjectByName('Lamborghini_Aventador_Wheel_FL');
    const fr = clonedCar.getObjectByName('Lamborghini_Aventador_Wheel_FR');
    const rl = clonedCar.getObjectByName('Lamborghini_Aventador_Wheel_RL');
    const rr = clonedCar.getObjectByName('Lamborghini_Aventador_Wheel_RR');

    const centerWheelPivot = (wheelNode: THREE.Object3D | null | undefined) => {
      if (!wheelNode) return;

      // Handle both single mesh and group hierarchy
      wheelNode.traverse((child) => {
        if ((child as any).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry = mesh.geometry.clone();
          mesh.geometry.computeBoundingBox();
          const bbox = mesh.geometry.boundingBox;
          if (bbox) {
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            mesh.geometry.translate(-center.x, -center.y, -center.z);
            mesh.position.add(center);
          }
        }
      });
    };

    centerWheelPivot(fl);
    centerWheelPivot(fr);
    centerWheelPivot(rl);
    centerWheelPivot(rr);

    if (flWheelRef) flWheelRef.current = fl || null;
    if (frWheelRef) frWheelRef.current = fr || null;
    if (rlWheelRef) rlWheelRef.current = rl || null;
    if (rrWheelRef) rrWheelRef.current = rr || null;

    // Traverse all meshes: smooth normals + assign PBR materials
    clonedCar.traverse((child: any) => {
      if (child.isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // ── SMOOTH NORMALS ──────────────────────────────────
        // Recompute vertex normals to eliminate faceted low-poly look
        if (mesh.geometry) {
          mesh.geometry.computeVertexNormals();
        }

        // ── MATERIAL ASSIGNMENT ─────────────────────────────
        const assigned = assignMaterial(child.name);
        if (assigned) {
          mesh.material = assigned;
        } else {
          // Fallback: Apply body paint to any unrecognized large mesh
          // to ensure consistent premium appearance
          const existingMat = mesh.material as THREE.MeshStandardMaterial;
          if (existingMat && existingMat.color) {
            const hsl = { h: 0, s: 0, l: 0 };
            existingMat.color.getHSL(hsl);

            // If it's a reddish color, treat as body
            if (hsl.h < 0.1 || hsl.h > 0.9) {
              mesh.material = BODY_PAINT;
            } else if (hsl.l < 0.15) {
              // Very dark → dark chrome accent
              mesh.material = DARK_CHROME;
            } else if (hsl.s < 0.1 && hsl.l > 0.5) {
              // Gray/silver → chrome trim
              mesh.material = CHROME_TRIM;
            }
          }
        }
      }
    });
  }, [clonedCar, flWheelRef, frWheelRef, rlWheelRef, rrWheelRef]);

  return (
    <group ref={vehicleRef} position={[-35, 0.5, 45]} rotation={[0, Math.PI, 0]}>
      <primitive object={clonedCar} scale={0.012} />

      {/* Subtle rim/back light for vehicle separation from background */}
      <hemisphereLight
        args={['#2a3a4a', '#0a0a0a', 0.4]}
        position={[0, 3, -4]}
      />

      {/* LED Headlights Spotlights */}
      <group position={[0, 0.4, 2.1]} rotation={[0, Math.PI, 0]}>
        <spotLight
          position={[0.6, 0, 0]}
          angle={Math.PI / 6}
          penumbra={0.4}
          intensity={headlightsIntensity}
          color="#fffbf0"
          distance={45}
          castShadow
        />
        <spotLight
          position={[-0.6, 0, 0]}
          angle={Math.PI / 6}
          penumbra={0.4}
          intensity={headlightsIntensity}
          color="#fffbf0"
          distance={45}
          castShadow
        />
        {/* LED Glow Lenses */}
        {headlightsIntensity > 0 && (
          <>
            <mesh position={[0.6, 0, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color="#fffef5" />
            </mesh>
            <mesh position={[-0.6, 0, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color="#fffef5" />
            </mesh>
          </>
        )}
      </group>

      {/* Rear Brake lights indicators */}
      <group position={[0, 0.4, -2.1]}>
        <mesh position={[0.6, 0, 0]}>
          <boxGeometry args={[0.25, 0.08, 0.08]} />
          <meshBasicMaterial color={brakeLightsActive ? '#ff2020' : '#3a0808'} />
        </mesh>
        <mesh position={[-0.6, 0, 0]}>
          <boxGeometry args={[0.25, 0.08, 0.08]} />
          <meshBasicMaterial color={brakeLightsActive ? '#ff2020' : '#3a0808'} />
        </mesh>
      </group>
    </group>
  );
}
