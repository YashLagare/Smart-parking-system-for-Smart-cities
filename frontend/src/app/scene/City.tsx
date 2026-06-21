'use client';

import React, { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface CityProps {
  skyscrapers: Array<{
    x: number;
    z: number;
    shouldSkip: boolean;
    url: string;
    scale: number;
    rotationY: number;
  }>;
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

export default function City({ skyscrapers }: CityProps) {
  return (
    <>
      {/* Asphalt Roads System */}
      <group position={[0, 0, 0]}>
        {/* Main Road N-S 1 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-35, 0.01, 0]} receiveShadow>
          <planeGeometry args={[9, 200]} />
          <meshStandardMaterial color="#11131a" roughness={0.8} metalness={0.1} />
        </mesh>
        {/* Main Road N-S 2 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.01, 0]} receiveShadow>
          <planeGeometry args={[9, 200]} />
          <meshStandardMaterial color="#11131a" roughness={0.8} metalness={0.1} />
        </mesh>
        {/* Crossing E-W 1 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 5]} receiveShadow>
          <planeGeometry args={[200, 9]} />
          <meshStandardMaterial color="#11131a" roughness={0.8} metalness={0.1} />
        </mesh>
        {/* Crossing E-W 2 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -25]} receiveShadow>
          <planeGeometry args={[200, 9]} />
          <meshStandardMaterial color="#11131a" roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Painted Lane dividers */}
        {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map((val, idx) => (
          <React.Fragment key={idx}>
            <mesh position={[-35, 0.02, val]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.2, 3]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
            </mesh>
            <mesh position={[10, 0.02, val]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.2, 3]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
            </mesh>
            <mesh position={[val, 0.02, 5]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[0.2, 3]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
            </mesh>
            <mesh position={[val, 0.02, -25]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[0.2, 3]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* Sidewalk borders and lawns */}
      <group>
        <mesh position={[-39.7, 0.1, 0]} receiveShadow>
          <boxGeometry args={[0.4, 0.2, 200]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
        <mesh position={[-30.3, 0.1, 0]} receiveShadow>
          <boxGeometry args={[0.4, 0.2, 200]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
        
        <mesh position={[5.3, 0.1, 0]} receiveShadow>
          <boxGeometry args={[0.4, 0.2, 200]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
        <mesh position={[14.7, 0.1, 0]} receiveShadow>
          <boxGeometry args={[0.4, 0.2, 200]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-48, 0.01, 0]} receiveShadow>
          <planeGeometry args={[16, 200]} />
          <meshStandardMaterial color="#0f1f15" roughness={0.95} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[24, 0.01, 0]} receiveShadow>
          <planeGeometry args={[18, 200]} />
          <meshStandardMaterial color="#0f1f15" roughness={0.95} />
        </mesh>

        {/* Scattered Trees and streetlights */}
        {[-80, -50, -20, 10, 40, 70].map((val, idx) => (
          <React.Fragment key={idx}>
            <AssetModel url="/assets/Tree.glb" position={[-44, 0, val]} scale={0.8} />
            <AssetModel url="/assets/Tree.glb" position={[22, 0, val]} scale={0.8} />
            
            <AssetModel url="/assets/Lamp post.glb" position={[-39.5, 0, val]} scale={1.2} rotation={[0, Math.PI / 2, 0]} />
            <AssetModel url="/assets/Lamp post.glb" position={[14.5, 0, val]} scale={1.2} rotation={[0, -Math.PI / 2, 0]} />
          </React.Fragment>
        ))}

        {/* Intersecting Traffic Lights */}
        <AssetModel url="/assets/Traffic light.glb" position={[-39.5, 0, 9.5]} scale={1.2} rotation={[0, Math.PI, 0]} />
        <AssetModel url="/assets/Traffic light.glb" position={[5.5, 0, 9.5]} scale={1.2} />
        <AssetModel url="/assets/Traffic light.glb" position={[14.5, 0, -20.5]} scale={1.2} rotation={[0, -Math.PI / 2, 0]} />
      </group>

      {/* Buildings instanced grid */}
      {skyscrapers.map((b, index) => {
        if (b.shouldSkip) return null;
        return (
          <AssetModel 
            key={index} 
            url={b.url} 
            position={[b.x, 0, b.z]} 
            scale={b.scale} 
            rotation={[0, b.rotationY, 0]} 
          />
        );
      })}
    </>
  );
}
