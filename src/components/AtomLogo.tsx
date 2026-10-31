import React, { useState, useEffect, useRef } from 'react';

interface AtomLogoProps {
  size?: number;
  className?: string;
  interactive?: boolean;
}

interface ElectronConfig {
  id: string;
  color: string;
  borderColor?: string;
  glow: string;
  tiltDeg: number;
  initialAngle: number;
  baseSpeed: number; // radians per second
  a: number; // semi-major axis (ellipse width)
  b: number; // semi-minor axis (ellipse height)
  baseSize: number;
}

export const AtomLogo: React.FC<AtomLogoProps> = ({
  size = 40,
  className = '',
  interactive = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);

  // Keep ref in sync for the animation loop without restarting it
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const backCirclesRef = useRef<(SVGCircleElement | null)[]>([]);
  const frontCirclesRef = useRef<(SVGCircleElement | null)[]>([]);

  // 4 Orbiting Electrons: grey, yellow, black, pink with distinct elliptical parameters
  const electrons: ElectronConfig[] = [
    {
      id: 'grey',
      color: '#94a3b8',
      borderColor: 'rgba(255, 255, 255, 0.85)',
      glow: 'rgba(148, 163, 184, 0.8)',
      tiltDeg: -35,
      initialAngle: 0,
      baseSpeed: 1.25,
      a: 19.5, // semi-major axis
      b: 7.2,  // semi-minor axis (distinctly elliptical)
      baseSize: 3.4,
    },
    {
      id: 'yellow',
      color: '#facc15',
      borderColor: 'rgba(255, 255, 255, 0.9)',
      glow: 'rgba(250, 204, 21, 0.9)',
      tiltDeg: 35,
      initialAngle: 1.6,
      baseSpeed: 1.15,
      a: 19.5,
      b: 7.2,
      baseSize: 3.4,
    },
    {
      id: 'black',
      color: '#0f172a',
      borderColor: '#94a3b8',
      glow: 'rgba(15, 23, 42, 0.9)',
      tiltDeg: 80,
      initialAngle: 3.2,
      baseSpeed: 1.35,
      a: 19.5,
      b: 7.2,
      baseSize: 3.4,
    },
    {
      id: 'pink',
      color: '#f472b6',
      borderColor: 'rgba(255, 255, 255, 0.9)',
      glow: 'rgba(244, 114, 182, 0.9)',
      tiltDeg: -75,
      initialAngle: 4.8,
      baseSpeed: 1.2,
      a: 19.5,
      b: 7.2,
      baseSize: 3.4,
    },
  ];

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const angles = electrons.map((e) => e.initialAngle);
    let speedMultiplier = 1.0;

    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth acceleration on hover
      const targetMultiplier = isHoveredRef.current ? 2.6 : 1.0;
      speedMultiplier += (targetMultiplier - speedMultiplier) * (dt * 6);

      electrons.forEach((e, i) => {
        angles[i] += e.baseSpeed * speedMultiplier * dt;
        const theta = angles[i];

        // 1. Parametric position on ellipse in its local frame:
        // x_local = a * cos(theta), y_local = b * sin(theta)
        const xLocal = e.a * Math.cos(theta);
        const yLocal = e.b * Math.sin(theta);

        // 2. Rotate by tilt angle in radians:
        const rad = (e.tiltDeg * Math.PI) / 180;
        const cosRad = Math.cos(rad);
        const sinRad = Math.sin(rad);

        const xRot = xLocal * cosRad - yLocal * sinRad;
        const yRot = xLocal * sinRad + yLocal * cosRad;

        const cx = 25 + xRot;
        const cy = 25 + yRot;

        // Depth cue: yLocal < 0 represents passing behind the nucleus
        const isBehind = Math.sin(theta) < 0;
        const depthScale = isBehind ? 0.88 : 1.12;
        const r = e.baseSize * depthScale;

        const backCircle = backCirclesRef.current[i];
        const frontCircle = frontCirclesRef.current[i];

        if (isBehind) {
          if (backCircle) {
            backCircle.setAttribute('cx', cx.toFixed(2));
            backCircle.setAttribute('cy', cy.toFixed(2));
            backCircle.setAttribute('r', r.toFixed(2));
            backCircle.style.display = 'inline';
            backCircle.style.opacity = '0.75';
          }
          if (frontCircle) {
            frontCircle.style.display = 'none';
          }
        } else {
          if (frontCircle) {
            frontCircle.setAttribute('cx', cx.toFixed(2));
            frontCircle.setAttribute('cy', cy.toFixed(2));
            frontCircle.setAttribute('r', r.toFixed(2));
            frontCircle.style.display = 'inline';
            frontCircle.style.opacity = '1.0';
          }
          if (backCircle) {
            backCircle.style.display = 'none';
          }
        }
      });

      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 cursor-pointer select-none transition-transform duration-300 ${
        isHovered ? 'scale-105' : 'scale-100'
      } ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      title="OMEGA Nucleus & 4 Orbiting Electrons (Elliptical Paths)"
    >
      <svg
        ref={svgRef}
        viewBox="0 0 50 50"
        className="w-full h-full overflow-visible"
        style={{
          filter: isHovered
            ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.55))'
            : 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.25))',
        }}
      >
        <defs>
          {/* Radial gradient for glowing central blue sphere (nucleus) */}
          <radialGradient id="nucleusGradient" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="38%" stopColor="#3b82f6" />
            <stop offset="82%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          {/* Outer glow filter */}
          <filter id="nucleusGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={isHovered ? '2.4' : '1.4'} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Behind-Nucleus Electrons (Layer 1 - orbits passing behind the central sphere) */}
        {electrons.map((e, i) => (
          <circle
            key={`back-${e.id}`}
            ref={(el) => {
              backCirclesRef.current[i] = el;
            }}
            cx="25"
            cy="25"
            r={e.baseSize}
            fill={e.color}
            stroke={e.borderColor || 'rgba(255,255,255,0.7)'}
            strokeWidth={0.7}
            style={{
              filter: `drop-shadow(0 0 2.5px ${e.glow})`,
              display: 'none',
            }}
          />
        ))}

        {/* 2. Central glowing blue sphere (nucleus) */}
        <circle
          cx="25"
          cy="25"
          r="8"
          fill="url(#nucleusGradient)"
          filter="url(#nucleusGlow)"
          className="transition-all duration-300"
        />

        {/* Subtle specular reflection glint on nucleus */}
        <circle
          cx="22.4"
          cy="22.4"
          r="2.2"
          fill="#ffffff"
          opacity={isHovered ? 0.75 : 0.55}
        />

        {/* 3. In-Front-of-Nucleus Electrons (Layer 2 - orbits passing in front of the central sphere) */}
        {electrons.map((e, i) => (
          <circle
            key={`front-${e.id}`}
            ref={(el) => {
              frontCirclesRef.current[i] = el;
            }}
            cx="25"
            cy="25"
            r={e.baseSize}
            fill={e.color}
            stroke={e.borderColor || 'rgba(255,255,255,0.85)'}
            strokeWidth={0.7}
            style={{
              filter: `drop-shadow(0 0 3.5px ${e.glow})`,
            }}
          />
        ))}
      </svg>
    </div>
  );
};
