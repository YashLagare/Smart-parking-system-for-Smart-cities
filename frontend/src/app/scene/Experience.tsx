'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

import City from './City';
import Car from './Car';
import Garage from './Garage';

interface ExperienceProps {
  stage: number;
  onStageTransition: (nextStage: number) => void;
}

export default function Experience({ stage, onStageTransition }: ExperienceProps) {
  const { camera } = useThree();

  // Group Refs
  const vehicleRef = useRef<THREE.Group>(null);
  const flWheelRef = useRef<THREE.Object3D | null>(null);
  const frWheelRef = useRef<THREE.Object3D | null>(null);
  const rlWheelRef = useRef<THREE.Object3D | null>(null);
  const rrWheelRef = useRef<THREE.Object3D | null>(null);

  const gateRef = useRef<THREE.Group>(null);
  const scanHologramRef = useRef<THREE.Mesh>(null);

  // Animation States
  const [steeringAngle, setSteeringAngle] = useState(0);
  const [headlightsIntensity, setHeadlightsIntensity] = useState(0);
  const [brakeLightsActive, setBrakeLightsActive] = useState(false);
  const [assignedSlotOccupied, setAssignedSlotOccupied] = useState(false);

  // Route points
  const routePoints: [number, number, number][] = [
    [-35, 0.5, 45],  // Start
    [-35, 0.5, 5],   // Crossroad 1
    [10, 0.5, 5],    // Crossroad 2
    [10, 0.5, -25],  // Turn to garage block
    [24, 0.5, -25],  // Move along lane to aisle
    [24, 0.5, -35],  // Move down aisle to S-12 level
    [32, 0.5, -35],  // Reverse park into S-12
  ];

  // Skyscraper grid coordinates
  const skyscrapers = useMemo(() => {
    const BUILDING_COUNT = 32;
    const GRID_SIZE = 6;
    const BLOCK_SPACING = 16;
    const buildingTypes = [
      '/assets/Skyscraper.glb',
      '/assets/Large Building.glb',
      '/assets/Low Building.glb',
      '/assets/Small Building.glb'
    ];

    return Array.from({ length: BUILDING_COUNT }).map((_, index) => {
      const gridX = index % GRID_SIZE;
      const gridZ = Math.floor(index / GRID_SIZE);

      const x = (gridX - (GRID_SIZE - 1) / 2) * BLOCK_SPACING * 2;
      const z = (gridZ - (GRID_SIZE - 1) / 2) * BLOCK_SPACING * 2;

      const shouldSkip = (Math.abs(x - 30) < 18 && Math.abs(z + 30) < 18) || (Math.abs(x + 35) < 15);
      const url = buildingTypes[index % buildingTypes.length];
      const scale = url.includes('Skyscraper') ? 0.35 : url.includes('Large') ? 0.45 : 0.6;
      const rotationY = (index % 4) * (Math.PI / 2);

      return { x, z, shouldSkip, url, scale, rotationY };
    });
  }, []);

  // GSAP Cinematic Timelines
  useEffect(() => {
    // Stage 1: Cinematic Drone Introduction — closer, lower end position
    if (stage === 1) {
      gsap.killTweensOf(camera.position);
      camera.position.set(-70, 80, 80);
      camera.lookAt(0, 0, 0);

      gsap.to(camera.position, {
        x: -42,
        y: 8,
        z: 55,
        duration: 5,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.lookAt(-35, 1, 45);
        },
        onComplete: () => {
          onStageTransition(2);
        }
      });
    }

    // Stage 2: Vehicle Activation — tight 3/4 hero shot
    if (stage === 2) {
      gsap.to(camera.position, {
        x: -31,
        y: 2.8,
        z: 50,
        duration: 3,
        ease: 'power1.inOut',
        onStart: () => {
          gsap.timeline()
            .to({}, { duration: 0.2, onStart: () => setHeadlightsIntensity(3) })
            .to({}, { duration: 0.2, onStart: () => setHeadlightsIntensity(0) })
            .to({}, { duration: 0.2, onStart: () => setHeadlightsIntensity(6) });

          setBrakeLightsActive(true);
        },
        onUpdate: () => {
          camera.lookAt(-35, 0.8, 45);
        },
        onComplete: () => {
          setBrakeLightsActive(false);
          onStageTransition(3);
        }
      });
    }

    // Stage 3: AI Parking Scanner — closer to garage, maintain parking context
    if (stage === 3) {
      gsap.to(camera.position, {
        x: 18,
        y: 12,
        z: -15,
        duration: 4,
        ease: 'power1.inOut',
        onUpdate: () => {
          camera.lookAt(30, 0, -30);
        },
        onComplete: () => {
          onStageTransition(4);
        }
      });
    }

    // Stage 4: Route Generation — show vehicle + route in frame
    if (stage === 4) {
      gsap.to(camera.position, {
        x: -22,
        y: 16,
        z: 48,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => {
          camera.lookAt(-15, 1, 18);
        },
        onComplete: () => {
          onStageTransition(5);
        }
      });
    }

    // Stage 5: Autonomous Driving — lower cinematic follow-cam
    if (stage === 5 && vehicleRef.current) {
      const vehicle = vehicleRef.current;
      vehicle.position.set(-35, 0.5, 45);
      vehicle.rotation.set(0, Math.PI, 0);

      const driveTimeline = gsap.timeline({
        onComplete: () => {
          onStageTransition(6);
        }
      });

      // Segment 1: Drive north to crossroad 1
      driveTimeline.to(vehicle.position, {
        x: -35,
        z: 5,
        duration: 3.8,
        ease: 'power1.inOut',
        onUpdate: () => {
          // Lower follow cam with offset for cinematic framing
          camera.position.x = vehicle.position.x + 4;
          camera.position.y = 3.2;
          camera.position.z = vehicle.position.z + 8;
          camera.lookAt(
            vehicle.position.x,
            vehicle.position.y + 0.5,
            vehicle.position.z
          );
        }
      });

      // Corner 1 Turn East
      driveTimeline.to(vehicle.rotation, {
        y: Math.PI / 2,
        duration: 0.7,
        ease: 'none',
        onStart: () => setSteeringAngle(-0.3),
        onUpdate: () => {
          camera.position.x = vehicle.position.x - 5;
          camera.position.y = 2.8;
          camera.position.z = vehicle.position.z + 5;
          camera.lookAt(
            vehicle.position.x,
            vehicle.position.y + 0.5,
            vehicle.position.z
          );
        },
        onComplete: () => setSteeringAngle(0)
      });

      // Segment 2: Drive east to crossroad 2
      driveTimeline.to(vehicle.position, {
        x: 10,
        z: 5,
        duration: 3.5,
        ease: 'power1.inOut',
        onUpdate: () => {
          camera.position.x = vehicle.position.x - 6;
          camera.position.y = 3;
          camera.position.z = vehicle.position.z + 5;
          camera.lookAt(
            vehicle.position.x,
            vehicle.position.y + 0.5,
            vehicle.position.z
          );
        }
      });
    }

    // Stage 6: Garage Entrance — side-tracking shot
    if (stage === 6 && vehicleRef.current) {
      const vehicle = vehicleRef.current;
      const entryTimeline = gsap.timeline({
        onComplete: () => {
          onStageTransition(7);
        }
      });

      // Corner 2 Turn North into garage lane
      entryTimeline.to(vehicle.rotation, {
        y: Math.PI,
        duration: 0.7,
        ease: 'none',
        onStart: () => setSteeringAngle(0.3),
        onUpdate: () => {
          camera.position.x = vehicle.position.x - 4;
          camera.position.y = 2.5;
          camera.position.z = vehicle.position.z - 4;
          camera.lookAt(
            vehicle.position.x,
            vehicle.position.y + 0.4,
            vehicle.position.z
          );
        },
        onComplete: () => setSteeringAngle(0)
      });

      // Drive north through gate
      entryTimeline.to(vehicle.position, {
        x: 10,
        z: -25,
        duration: 2.5,
        ease: 'power1.inOut',
        onUpdate: () => {
          camera.position.x = 4;
          camera.position.y = 2.5;
          camera.position.z = vehicle.position.z + 5;
          camera.lookAt(
            vehicle.position.x,
            vehicle.position.y + 0.4,
            vehicle.position.z
          );

          // Retract gate down
          if (vehicle.position.z < -10 && gateRef.current) {
            gsap.to(gateRef.current.position, {
              y: -1.4,
              duration: 1.2,
              overwrite: 'auto'
            });
          }
        }
      });

      // Corner 3 Turn East inside garage
      entryTimeline.to(vehicle.rotation, {
        y: Math.PI / 2,
        duration: 0.8,
        ease: 'none',
        onStart: () => setSteeringAngle(-0.3),
        onUpdate: () => {
          camera.position.x = vehicle.position.x - 4;
          camera.position.y = 3;
          camera.position.z = vehicle.position.z + 4;
          camera.lookAt(
            vehicle.position.x,
            vehicle.position.y + 0.4,
            vehicle.position.z
          );
        },
        onComplete: () => setSteeringAngle(0)
      });
    }

    // Stage 7: Auto-Parking — close hero shot during reverse park
    if (stage === 7 && vehicleRef.current) {
      const vehicle = vehicleRef.current;
      const parkTimeline = gsap.timeline({
        onComplete: () => {
          onStageTransition(8);
        }
      });

      // Drive East past slot to aisle
      parkTimeline.to(vehicle.position, {
        x: 24,
        z: -25,
        duration: 1.2,
        ease: 'power1.inOut',
        onUpdate: () => {
          camera.position.x = vehicle.position.x - 5;
          camera.position.y = 3;
          camera.position.z = vehicle.position.z + 4;
          camera.lookAt(
            vehicle.position.x,
            vehicle.position.y + 0.4,
            vehicle.position.z
          );
        }
      });

      // Turn North into aisle
      parkTimeline.to(vehicle.rotation, {
        y: Math.PI,
        duration: 0.6,
        ease: 'none',
        onStart: () => setSteeringAngle(0.3),
        onUpdate: () => {
          camera.lookAt(
            vehicle.position.x,
            vehicle.position.y + 0.4,
            vehicle.position.z
          );
        },
        onComplete: () => setSteeringAngle(0)
      });

      // Drive North along aisle to S-12 alignment
      parkTimeline.to(vehicle.position, {
        x: 24,
        z: -35,
        duration: 1.5,
        ease: 'power1.inOut',
        onUpdate: () => {
          camera.position.x = vehicle.position.x - 5;
          camera.position.y = 3.5;
          camera.position.z = vehicle.position.z + 3;
          camera.lookAt(
            vehicle.position.x,
            vehicle.position.y + 0.4,
            vehicle.position.z
          );
        }
      });

      // Turn West to align for reverse park
      parkTimeline.to(vehicle.rotation, {
        y: 1.5 * Math.PI,
        duration: 0.6,
        ease: 'none',
        onStart: () => setSteeringAngle(0.3),
        onUpdate: () => {
          camera.lookAt(
            vehicle.position.x,
            vehicle.position.y + 0.4,
            vehicle.position.z
          );
        },
        onComplete: () => setSteeringAngle(0)
      });

      // Reverse park into slot — hero shot
      parkTimeline.to(vehicle.position, {
        x: 32,
        z: -35,
        duration: 2.2,
        ease: 'power1.out',
        onStart: () => setBrakeLightsActive(true),
        onUpdate: () => {
          // Cinematic hero angle during the park
          camera.position.set(
            vehicle.position.x - 6,
            3.2,
            vehicle.position.z + 5
          );
          camera.lookAt(
            vehicle.position.x,
            vehicle.position.y + 0.3,
            vehicle.position.z
          );
        },
        onComplete: () => {
          setBrakeLightsActive(false);
          setAssignedSlotOccupied(true);
          // Raise gate arm back up
          if (gateRef.current) {
            gsap.to(gateRef.current.position, {
              y: 0.5,
              duration: 0.8,
              overwrite: 'auto'
            });
          }
        }
      });

      parkTimeline.to({}, { duration: 1 });
    }

    // Stage 8: Completion — moderate zoom-out then hero completion shot
    if (stage === 8) {
      const timeline = gsap.timeline({
        onComplete: () => {
          onStageTransition(9);
        }
      });

      // Pull back to show parked vehicle in context
      timeline.to(camera.position, {
        x: 18,
        y: 10,
        z: -22,
        duration: 3,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.lookAt(32, 0.5, -35);
        },
      });

      // Hold on the hero shot
      timeline.to({}, { duration: 1 });
    }
  }, [stage, camera, onStageTransition]);

  // Frame animators
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Scan Hologram sweep movement (Stage 3)
    if (scanHologramRef.current && stage === 3) {
      scanHologramRef.current.position.x = 30 + Math.sin(time * 3.5) * 12;
      scanHologramRef.current.position.z = -30 + Math.cos(time * 2) * 8;
    }

    // Wheel roll and steering yaw adjustments (stages 5, 6, 7)
    if (stage === 5 || stage === 6 || stage === 7) {
      const wheelRollSpeed = 0.2;

      if (flWheelRef.current) flWheelRef.current.rotation.x += wheelRollSpeed;
      if (frWheelRef.current) frWheelRef.current.rotation.x += wheelRollSpeed;
      if (rlWheelRef.current) rlWheelRef.current.rotation.x += wheelRollSpeed;
      if (rrWheelRef.current) rrWheelRef.current.rotation.x += wheelRollSpeed;

      if (flWheelRef.current) flWheelRef.current.rotation.y = steeringAngle;
      if (frWheelRef.current) frWheelRef.current.rotation.y = steeringAngle;
    }
  });

  return (
    <>
      {/* EXR environment reflection sky dome */}
      <Environment files="/assets/german_town_street_4k.exr" background blur={0.6} />

      {/* ── LIGHTING SETUP ────────────────────────────────────────── */}

      {/* Ambient fill — soft cool tone */}
      <ambientLight intensity={0.35} color="#c8d0e0" />

      {/* Key light — slightly warm directional sun */}
      <directionalLight
        position={[30, 60, 25]}
        intensity={2.5}
        color="#fff5e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
      />

      {/* Fill light — cool, from opposite side */}
      <directionalLight
        position={[-25, 40, -20]}
        intensity={0.6}
        color="#d0e0f0"
      />

      {/* Back light — subtle depth separation */}
      <directionalLight
        position={[0, 20, -50]}
        intensity={0.4}
        color="#b0c0d0"
      />

      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.35}
        scale={120}
        blur={2}
        far={20}
        color="#000000"
      />

      {/* ── GROUND VIGNETTE ───────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#080b12" roughness={1} metalness={0} />
      </mesh>

      {/* Modular City street structure */}
      <City skyscrapers={skyscrapers} />

      {/* Garage concrete grid structures & gate barrier */}
      <Garage gateRef={gateRef} assignedSlotOccupied={assignedSlotOccupied} stage={stage} />

      {/* ── NAVIGATION ROUTE ──────────────────────────────────────── */}
      {(stage === 4 || stage === 5 || stage === 6 || stage === 7 || stage === 8) && (
        <Line
          points={routePoints}
          color="#4da6ff"
          lineWidth={10}
        />
      )}

      {/* ── SCANNING SWEEP (Stage 3) ──────────────────────────────── */}
      {stage === 3 && (
        <mesh ref={scanHologramRef} position={[30, 8, -30]}>
          <cylinderGeometry args={[0.1, 10, 18, 32, 1, true]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.06}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Steerable Car model */}
      <Car
        vehicleRef={vehicleRef}
        flWheelRef={flWheelRef}
        frWheelRef={frWheelRef}
        rlWheelRef={rlWheelRef}
        rrWheelRef={rrWheelRef}
        headlightsIntensity={headlightsIntensity}
        brakeLightsActive={brakeLightsActive}
      />
    </>
  );
}
