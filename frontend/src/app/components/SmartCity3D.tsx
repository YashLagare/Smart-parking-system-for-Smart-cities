'use client';

import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';

interface SmartCityProps {
  onSelectLot?: (lotName: string) => void;
  selectedLotName?: string;
}

export default function SmartCity3D({ onSelectLot, selectedLotName }: SmartCityProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isSimulationRunning } = useStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Simulate cyber-city blocks & cars
    const roads = [
      { startX: 100, startY: 100, endX: 700, endY: 100 },
      { startX: 100, startY: 300, endX: 700, endY: 300 },
      { startX: 250, startY: 50, endX: 250, endY: 400 },
      { startX: 550, startY: 50, endX: 550, endY: 400 },
    ];

    // Static parking lots on canvas
    const lots = [
      { id: '1', name: 'Downtown Smart Arena', x: 250, y: 100, occupiedColor: '#ff007f', freeColor: '#00d2ff', size: 40, capacity: 10, occupied: 6 },
      { id: '2', name: 'Metro Terminal Parking', x: 550, y: 300, occupiedColor: '#ff007f', freeColor: '#00d2ff', size: 36, capacity: 8, occupied: 4 },
      { id: '3', name: 'Tech District Hub', x: 250, y: 300, occupiedColor: '#ff007f', freeColor: '#00d2ff', size: 44, capacity: 12, occupied: 3 },
    ];

    // Vehicles list
    const vehicles = Array.from({ length: 6 }, (_, i) => ({
      roadIndex: i % roads.length,
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.003,
      size: 6,
      color: i % 2 === 0 ? '#00d2ff' : '#9d4edd',
    }));

    // Radar scan state
    let radarAngle = 0;

    const render = () => {
      ctx.fillStyle = '#070913';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw grid backdrop (Isometric style perspective lines)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw roads as glowing cyan tracks
      roads.forEach((road) => {
        ctx.strokeStyle = 'rgba(0, 210, 255, 0.06)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(road.startX, road.startY);
        ctx.lineTo(road.endX, road.endY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 210, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(road.startX, road.startY);
        ctx.lineTo(road.endX, road.endY);
        ctx.stroke();

        // Dash core center road line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([8, 12]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(road.startX, road.startY);
        ctx.lineTo(road.endX, road.endY);
        ctx.stroke();
        ctx.setLineDash([]); // reset
      });

      // 3. Draw moving autonomous vehicles
      if (isSimulationRunning) {
        vehicles.forEach((car) => {
          car.progress += car.speed;
          if (car.progress > 1) {
            car.progress = 0;
            car.roadIndex = (car.roadIndex + 1) % roads.length;
          }
        });
      }

      vehicles.forEach((car) => {
        const road = roads[car.roadIndex];
        const carX = road.startX + (road.endX - road.startX) * car.progress;
        const carY = road.startY + (road.endY - road.startY) * car.progress;

        // Glow circle
        const glowGrad = ctx.createRadialGradient(carX, carY, 1, carX, carY, 10);
        glowGrad.addColorStop(0, car.color);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(carX, carY, 10, 0, Math.PI * 2);
        ctx.fill();

        // Car core dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(carX, carY, car.size / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Draw Radar sweep scan from the center
      const centerX = width / 2;
      const centerY = height / 2;
      const radarRadius = Math.min(width, height) * 0.45;

      radarAngle += 0.005;
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radarRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Radar line
      const sweepX = centerX + Math.cos(radarAngle) * radarRadius;
      const sweepY = centerY + Math.sin(radarAngle) * radarRadius;
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      // 5. Draw Parking Lots (as glowing volumetric blocks)
      lots.forEach((lot) => {
        const isSelected = selectedLotName === lot.name;
        const lotColor = isSelected ? '#00d2ff' : '#9d4edd';

        // Draw glowing bounding box
        ctx.shadowBlur = isSelected ? 20 : 10;
        ctx.shadowColor = lotColor;
        
        ctx.fillStyle = 'rgba(13, 17, 30, 0.85)';
        ctx.strokeStyle = lotColor;
        ctx.lineWidth = isSelected ? 3 : 1.5;
        
        ctx.beginPath();
        ctx.rect(lot.x - lot.size / 2, lot.y - lot.size / 2, lot.size, lot.size);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow

        // Draw parking occupancy progress bar on lot bottom
        const barWidth = lot.size - 8;
        const barHeight = 4;
        const barX = lot.x - lot.size / 2 + 4;
        const barY = lot.y + lot.size / 2 - 8;

        // Background progress bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Filled progress bar (occupancy rate)
        const occRate = lot.occupied / lot.capacity;
        ctx.fillStyle = occRate > 0.8 ? '#ff007f' : '#00d2ff';
        ctx.fillRect(barX, barY, barWidth * occRate, barHeight);

        // Label above
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px Outfit, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${lot.occupied}/${lot.capacity}`,
          lot.x,
          lot.y - lot.size / 2 - 5
        );

        // Name below
        ctx.fillStyle = isSelected ? '#00d2ff' : 'rgba(255,255,255,0.7)';
        ctx.font = '8px Outfit, system-ui, sans-serif';
        ctx.fillText(lot.name.split(' ')[0] || lot.name, lot.x, lot.y + lot.size / 2 + 12);
      });

      // Canvas border decoration (Target lock accents)
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.15)';
      ctx.lineWidth = 1;
      const cornerSize = 15;
      
      // Top Left Corner
      ctx.beginPath();
      ctx.moveTo(cornerSize, 5); ctx.lineTo(5, 5); ctx.lineTo(5, cornerSize);
      ctx.stroke();
      // Top Right
      ctx.beginPath();
      ctx.moveTo(width - cornerSize, 5); ctx.lineTo(width - 5, 5); ctx.lineTo(width - 5, cornerSize);
      ctx.stroke();
      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(cornerSize, height - 5); ctx.lineTo(5, height - 5); ctx.lineTo(5, height - cornerSize);
      ctx.stroke();
      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(width - cornerSize, height - 5); ctx.lineTo(width - 5, height - 5); ctx.lineTo(width - 5, height - cornerSize);
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    // Click handler to select lots
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Adjust coordinate spaces
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const adjustedX = clickX * scaleX;
      const adjustedY = clickY * scaleY;

      // Check if clicked lot
      lots.forEach((lot) => {
        const dx = adjustedX - lot.x;
        const dy = adjustedY - lot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < lot.size) {
          if (onSelectLot) {
            onSelectLot(lot.name);
          }
        }
      });
    };

    canvas.addEventListener('click', handleCanvasClick);
    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [isSimulationRunning, onSelectLot, selectedLotName]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
      <div className="absolute bottom-3 left-3 bg-dark-bg/80 backdrop-blur-md border border-white/5 px-2 py-1 rounded text-[8px] tracking-wider text-gray-400">
        AI VECTOR CORE SCANS ACTIVE
      </div>
      {isSimulationRunning && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-cyber-blue/10 border border-cyber-blue/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-ping" />
          <span className="text-[8px] font-bold text-cyber-blue tracking-wider uppercase">Live Grid Feed</span>
        </div>
      )}
    </div>
  );
}
