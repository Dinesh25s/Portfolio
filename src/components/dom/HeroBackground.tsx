"use client";

import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
}

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;
    let path: Point[] = [];
    let gridPoints: Point[] = [];
    let gridCols = 20;
    let gridRows = 12;
    let cellW = 0;
    let cellH = 0;
    let numPoints = 80;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      // Rebuild path and grid with new dimensions
      path = [];
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        const x = width * 0.1 + t * width * 0.8;
        const y = height * 0.3 + Math.sin(t * Math.PI * 2) * height * 0.15 + Math.sin(t * Math.PI * 4) * height * 0.05;
        path.push({ x, y });
      }

      gridPoints = [];
      cellW = width / gridCols;
      cellH = height / gridRows;
      for (let i = 0; i <= gridRows; i++) {
        for (let j = 0; j <= gridCols; j++) {
          gridPoints.push({ x: j * cellW, y: i * cellH });
        }
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const TRAIL_LENGTH = 40;
    let trail: Point[] = [];

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw constraint net (subtle)
      ctx.strokeStyle = 'rgba(45, 55, 72, 0.3)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= gridRows; i++) {
        ctx.beginPath();
        for (let j = 0; j <= gridCols; j++) {
          const idx = i * (gridCols + 1) + j;
          const p = gridPoints[idx];
          const offset = Math.sin(time * 0.001 + j * 0.3 + i * 0.2) * 2;
          if (j === 0) ctx.moveTo(p.x, p.y + offset);
          else ctx.lineTo(p.x, p.y + offset);
        }
        ctx.stroke();
      }
      for (let j = 0; j <= gridCols; j++) {
        ctx.beginPath();
        for (let i = 0; i <= gridRows; i++) {
          const idx = i * (gridCols + 1) + j;
          const p = gridPoints[idx];
          const offset = Math.cos(time * 0.001 + j * 0.2 + i * 0.3) * 2;
          if (i === 0) ctx.moveTo(p.x, p.y + offset);
          else ctx.lineTo(p.x, p.y + offset);
        }
        ctx.stroke();
      }

      // Update and draw trail
      if (path.length > 0) {
        const t = (time * 0.0005) % 1;
        const idx = Math.floor(t * (numPoints - 1));
        const p = path[idx];
        trail.push({ x: p.x, y: p.y });
        if (trail.length > TRAIL_LENGTH) trail.shift();

        // Draw trail
        if (trail.length >= 2) {
          for (let i = 1; i < trail.length; i++) {
            const alpha = i / trail.length;
            ctx.strokeStyle = `rgba(0, 180, 216, ${alpha * 0.6})`;
            ctx.lineWidth = 2 * alpha;
            ctx.beginPath();
            ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
            ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
          }
        }

        // Draw drone marker at head
        const head = trail[trail.length - 1] || path[0];
        ctx.fillStyle = '#00b4d8';
        ctx.beginPath();
        ctx.arc(head.x, head.y, 4, 0, Math.PI * 2);
        ctx.fill();
        // Glow
        ctx.shadowColor = '#00b4d8';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw direction indicator
        const nextIdx = Math.min(idx + 1, numPoints - 1);
        const nextP = path[nextIdx];
        const angle = Math.atan2(nextP.y - head.y, nextP.x - head.x);
        ctx.strokeStyle = '#00b4d8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(head.x, head.y);
        ctx.lineTo(head.x + Math.cos(angle - 0.5) * 16, head.y + Math.sin(angle - 0.5) * 16);
        ctx.moveTo(head.x, head.y);
        ctx.lineTo(head.x + Math.cos(angle + 0.5) * 16, head.y + Math.sin(angle + 0.5) * 16);
        ctx.stroke();
      }

      // Draw some floating data points
      ctx.font = '10px JetBrains Mono';
      ctx.fillStyle = 'rgba(153, 160, 166, 0.5)';
      const dataPoints = ['ALT: 120.4m', 'VEL: 15.2m/s', 'HDG: 47°', 'SAT: 14'];
      for (let i = 0; i < dataPoints.length; i++) {
        const x = width - 120 + Math.sin(time * 0.0005 + i) * 10;
        const y = 80 + i * 24;
        ctx.fillText(dataPoints[i], x, y);
      }

      time += 16;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
