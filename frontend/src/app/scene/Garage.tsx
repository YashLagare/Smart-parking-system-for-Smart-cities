'use client';

import React, { useEffect, useMemo } from 'react';
import { useGLTF, Line } from '@react-three/drei';
import * as THREE from 'three';

interface GarageProps {
  gateRef: React.RefObject<THREE.Group | null>;
  assignedSlotOccupied: boolean;
  stage: number;
}

// Helper instancing renderer
function AssetModel({ url, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], castShadow = true, receiveShadow = true }: any) {
  const { scene } = useGLTF(url) as any;
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
      }
    });
  }, [clonedScene, castShadow, receiveShadow]);

  return <primitive object={clonedScene} position={position} scale={scale} rotation={rotation} />;
}

export default function Garage({ gateRef, assignedSlotOccupied, stage }: GarageProps) {
  return (
    <group position={[30, 0, -30]}>
      {/* ── FLOOR SLAB — lighter concrete gray ──────────────────── */}
      <mesh position={[0, 0.01, -4]} receiveShadow>
        <boxGeometry args={[18, 0.1, 24]} />
        <meshStandardMaterial color="#2a3142" roughness={0.92} metalness={0.05} />
      </mesh>

      {/* ── ROOF SLAB — medium gray concrete ────────────────────── */}
      <mesh position={[0, 4.5, -4]} receiveShadow castShadow>
        <boxGeometry args={[18, 0.2, 24]} />
        <meshStandardMaterial color="#3d4555" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* ── COLUMNS — concrete with contrast ────────────────────── */}
      {[[-8.5, -15.5], [-8.5, -4.5], [-8.5, 7.5], [8.5, -15.5], [8.5, -4.5], [8.5, 7.5]].map((coord, idx) => (
        <mesh key={idx} position={[coord[0], 2.25, coord[1]]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 4.5, 16]} />
          <meshStandardMaterial color="#5a6577" roughness={0.7} metalness={0.05} />
        </mesh>
      ))}

      {/* ── PARKING SLOTS ───────────────────────────────────────── */}
      {Array.from({ length: 6 }).map((_, i) => {
        const slotZ = -14 + i * 4.5;
        const isTargetSlot = i === 2; // Slot A-17
        const isOccupied = i !== 2 && i % 2 === 0;

        return (
          <group key={i} position={[2, 0.05, slotZ]}>
            {/* Painted boundary lines — warm white, thicker, closed rectangle */}
            <Line
              points={[
                [-3.5, 0, -2], [3.5, 0, -2],
                [3.5, 0, 2], [-3.5, 0, 2],
                [-3.5, 0, -2],
              ]}
              color="#e5e5d0"
              lineWidth={3}
            />

            {/* Slot label marker (center dot) */}
            {isTargetSlot && (
              <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.2, 0.35, 24]} />
                <meshBasicMaterial
                  color={assignedSlotOccupied ? '#4caf50' : '#ffffff'}
                  transparent
                  opacity={0.4}
                />
              </mesh>
            )}

            {/* Target slot floor highlight */}
            {isTargetSlot && (stage === 3 || stage === 4 || stage === 7 || stage === 8) && (
              <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[6.8, 3.8]} />
                <meshBasicMaterial
                  color={assignedSlotOccupied ? '#4caf50' : '#ffffff'}
                  transparent
                  opacity={assignedSlotOccupied ? 0.12 : 0.08}
                />
              </mesh>
            )}

            {/* Target slot emphasis border */}
            {isTargetSlot && (stage === 3 || stage === 4 || stage === 7 || stage === 8) && (
              <Line
                points={[
                  [-3.5, 0.01, -2], [3.5, 0.01, -2],
                  [3.5, 0.01, 2], [-3.5, 0.01, 2],
                  [-3.5, 0.01, -2],
                ]}
                color={assignedSlotOccupied ? '#4caf50' : '#ffffff'}
                lineWidth={5}
              />
            )}

            {/* Parked Traffic Cars */}
            {isOccupied && (
              <group position={[0, 0.45, 0]} rotation={[0, 1.5 * Math.PI, 0]}>
                <AssetModel
                  url={i % 3 === 0 ? '/assets/SUV.glb' : '/assets/Taxi.glb'}
                  scale={1.2}
                />
              </group>
            )}
          </group>
        );
      })}

      {/* ── ENTRANCE GATE ───────────────────────────────────────── */}
      <group ref={gateRef} position={[-7.5, 0.5, 5]}>
        <AssetModel url="/assets/Traffic Barrier.glb" scale={0.012} rotation={[0, Math.PI / 2, 0]} />
      </group>
    </group>
  );
}
