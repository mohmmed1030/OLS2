import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { THEME_PALETTES } from '../data/themePalettes';

export const AnimatedBackground: React.FC = () => {
  const { backgroundPattern, animationEnabled, mode, palette } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!animationEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initPattern();
    };

    window.addEventListener('resize', handleResize);

    const isDark = mode === 'dark';
    const currentPaletteDef = THEME_PALETTES[palette] || THEME_PALETTES.indigo;
    const paletteColors = currentPaletteDef.previewColors[mode];

    // Dynamic color sampling based on user selected palette
    const primaryHex = paletteColors[2] || '#6366f1';
    const secondaryHex = paletteColors[1] || '#1e293b';
    const bgHex = paletteColors[0] || '#0f172a';

    const hexToRgba = (hex: string, alpha: number) => {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map((x) => x + x).join('');
      const num = parseInt(c, 16);
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // ------------------------------------------------------------------------
    // 1. Sunset Ocean Waves ('waves')
    // ------------------------------------------------------------------------
    let wavePhase = 0;
    const renderSunsetOceanWaves = () => {
      ctx.clearRect(0, 0, width, height);
      const horizonY = height * 0.52;

      // Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, bgHex);
      skyGrad.addColorStop(0.6, hexToRgba(secondaryHex, isDark ? 0.8 : 0.4));
      skyGrad.addColorStop(1, hexToRgba(primaryHex, isDark ? 0.6 : 0.3));
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Sun Disc
      const sunX = width * 0.5;
      const sunRadius = Math.min(width, height) * 0.08;
      const sunGrad = ctx.createRadialGradient(sunX, horizonY, 0, sunX, horizonY, sunRadius * 2.5);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.3, hexToRgba(primaryHex, 0.9));
      sunGrad.addColorStop(0.7, hexToRgba(primaryHex, 0.4));
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.beginPath();
      ctx.arc(sunX, horizonY, sunRadius * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(sunX, horizonY, sunRadius * 0.7, Math.PI, Math.PI * 2);
      ctx.fillStyle = isDark ? '#ffffff' : hexToRgba(primaryHex, 0.9);
      ctx.fill();
      ctx.restore();

      // Sun Water Reflection
      const reflGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      reflGrad.addColorStop(0, hexToRgba(primaryHex, 0.5));
      reflGrad.addColorStop(0.4, hexToRgba(primaryHex, 0.2));
      reflGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(sunX - sunRadius * 1.8, horizonY);
      ctx.lineTo(sunX + sunRadius * 1.8, horizonY);
      ctx.lineTo(sunX + sunRadius * 4, height);
      ctx.lineTo(sunX - sunRadius * 4, height);
      ctx.closePath();
      ctx.fillStyle = reflGrad;
      ctx.fill();
      ctx.restore();

      // Waves
      wavePhase += 0.015;
      const waveLayers = 8;
      for (let i = 0; i < waveLayers; i++) {
        const depth = Math.pow((i + 1) / waveLayers, 1.8);
        const yPos = horizonY + (height - horizonY) * depth;
        const offsetPhase = wavePhase * 1.5 - i * 0.45;
        const amplitude = (12 + i * 5) * (1 - depth * 0.3);
        const frequency = 0.008 - i * 0.0004;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 15) {
          const yWave = yPos + Math.sin(x * frequency + offsetPhase) * amplitude;
          if (x === 0) ctx.lineTo(x, yWave);
          else ctx.lineTo(x, yWave);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const alpha = isDark ? 0.15 + depth * 0.35 : 0.1 + depth * 0.25;
        const waveGrad = ctx.createLinearGradient(0, yPos - amplitude, 0, height);
        waveGrad.addColorStop(0, hexToRgba(primaryHex, alpha));
        waveGrad.addColorStop(0.5, hexToRgba(secondaryHex, alpha * 0.8));
        waveGrad.addColorStop(1, hexToRgba(bgHex, alpha * 0.9));

        ctx.fillStyle = waveGrad;
        ctx.fill();

        ctx.strokeStyle = hexToRgba(isDark ? '#ffffff' : primaryHex, 0.2 + depth * 0.3);
        ctx.lineWidth = 1 + depth * 1.5;
        ctx.stroke();

        ctx.restore();
      }
    };

    // ------------------------------------------------------------------------
    // 2. Constellation Network: Small dots connected via faint lines ('constellation')
    // ------------------------------------------------------------------------
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }

    let nodes: Node[] = [];

    const initConstellation = () => {
      nodes = [];
      const count = Math.max(50, Math.floor((width * height) / 14000));
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: 1.5 + Math.random() * 2.5,
        });
      }
    };

    const renderConstellation = () => {
      ctx.clearRect(0, 0, width, height);

      // Move nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      const maxDist = 130;

      // Draw faint connecting lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isDark ? 0.35 : 0.25);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = hexToRgba(primaryHex, alpha);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(primaryHex, isDark ? 0.85 : 0.65);
        ctx.shadowBlur = 8;
        ctx.shadowColor = primaryHex;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    // ------------------------------------------------------------------------
    // 3. Space Glowing Stars ('stars')
    // ------------------------------------------------------------------------
    interface Star {
      x: number;
      y: number;
      baseRadius: number;
      twinkleSpeed: number;
      phase: number;
    }

    let stars: Star[] = [];

    const initStars = () => {
      stars = [];
      const count = Math.max(90, Math.floor((width * height) / 8000));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseRadius: 1.0 + Math.random() * 2.2,
          twinkleSpeed: 0.02 + Math.random() * 0.04,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const renderStars = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((s) => {
        s.phase += s.twinkleSpeed;
        const brightness = 0.35 + 0.65 * Math.abs(Math.sin(s.phase));
        const r = s.baseRadius * (0.8 + 0.35 * brightness);

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(primaryHex, brightness);
        ctx.shadowBlur = r * 4;
        ctx.shadowColor = primaryHex;
        ctx.fill();
        ctx.restore();
      });
    };

    // ------------------------------------------------------------------------
    // 4. Mathematical & Chemical Equations ('math_chem')
    // ------------------------------------------------------------------------
    interface FloatingEquation {
      x: number;
      y: number;
      speed: number;
      text: string;
      size: number;
      opacity: number;
      phase: number;
    }

    const FORMULA_POOL = [
      'E = mc²',
      'H₂O ⇌ H⁺ + OH⁻',
      '∫ e⁻ˣ² dx = √π / 2',
      'ΔG° = -RT ln K',
      'eⁱᵖ + 1 = 0',
      'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
      '∇ · B = 0',
      'iℏ ∂Ψ/∂t = ĤΨ',
      'pH = -log₁₀[H⁺]',
      'PV = nRT',
      'λ = h / p',
      'a² + b² = c²',
      'F = G (m₁m₂ / r²)',
      'S = k_B ln Ω',
      'CO₂ + H₂O ⇌ H₂CO₃',
      'ATP → ADP + P_i + Energy',
      'σ = E · ε',
      '∇ × E = -∂B/∂t'
    ];

    let equations: FloatingEquation[] = [];

    const initMathChem = () => {
      equations = [];
      const count = 28;
      for (let i = 0; i < count; i++) {
        equations.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 0.2 + Math.random() * 0.4,
          text: FORMULA_POOL[i % FORMULA_POOL.length],
          size: 11 + Math.random() * 7,
          opacity: 0.15 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const renderMathChem = () => {
      ctx.clearRect(0, 0, width, height);

      equations.forEach((eq) => {
        eq.y -= eq.speed;
        eq.phase += 0.01;

        if (eq.y < -30) {
          eq.y = height + 30;
          eq.x = Math.random() * width;
        }

        const alpha = eq.opacity * (0.6 + 0.4 * Math.sin(eq.phase));

        ctx.save();
        ctx.font = `500 ${eq.size}px monospace`;
        ctx.fillStyle = hexToRgba(primaryHex, alpha);
        ctx.shadowBlur = 6;
        ctx.shadowColor = primaryHex;
        ctx.fillText(eq.text, eq.x, eq.y);
        ctx.restore();
      });
    };

    // ------------------------------------------------------------------------
    // 5. Light Rain ('light_rain')
    // ------------------------------------------------------------------------
    interface Drop {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
    }

    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }

    let rainDrops: Drop[] = [];
    let ripples: Ripple[] = [];

    const initLightRain = () => {
      rainDrops = [];
      ripples = [];
      const count = Math.max(60, Math.floor(width / 15));

      for (let i = 0; i < count; i++) {
        rainDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 4 + Math.random() * 6,
          length: 12 + Math.random() * 18,
          opacity: 0.15 + Math.random() * 0.35,
        });
      }
    };

    const renderLightRain = () => {
      ctx.clearRect(0, 0, width, height);

      // Rain Streaks
      rainDrops.forEach((d) => {
        d.y += d.speed;
        d.x -= d.speed * 0.15; // Slanted fall

        if (d.y > height - 40) {
          // Trigger ripple at bottom
          if (Math.random() < 0.3) {
            ripples.push({
              x: d.x,
              y: height - 10 - Math.random() * 30,
              radius: 1,
              maxRadius: 10 + Math.random() * 12,
              opacity: 0.5,
            });
          }
          d.y = -20;
          d.x = Math.random() * (width + 200);
        }

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.length * 0.15, d.y + d.length);
        ctx.strokeStyle = hexToRgba(primaryHex, d.opacity);
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      });

      // Water Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 0.5;
        r.opacity -= 0.015;

        if (r.opacity <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(primaryHex, r.opacity);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    };

    // ------------------------------------------------------------------------
    // 6. Medical 1: DNA Double Helix & Synapses ('dna_synapse')
    // ------------------------------------------------------------------------
    let dnaPhase = 0;
    interface SynapsePulse {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }

    let synapsePulses: SynapsePulse[] = [];

    const renderDnaSynapse = () => {
      ctx.clearRect(0, 0, width, height);

      dnaPhase += 0.015;
      const strandCount = Math.max(1, Math.floor(width / 380));

      for (let s = 0; s < strandCount; s++) {
        const centerX = (width / (strandCount + 1)) * (s + 1);
        const points = 45;
        const spacing = (height + 100) / points;

        for (let i = 0; i < points; i++) {
          const y = -50 + i * spacing;
          const angle = dnaPhase + i * 0.22 + s * 1.5;

          const widthAmp = 65;
          const x1 = centerX + Math.sin(angle) * widthAmp;
          const x2 = centerX - Math.sin(angle) * widthAmp;

          const depth1 = (Math.cos(angle) + 1) / 2; // 0 to 1
          const depth2 = (Math.cos(angle + Math.PI) + 1) / 2;

          // Connecting Base Pair Rung
          if (i % 2 === 0) {
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.strokeStyle = hexToRgba(secondaryHex, isDark ? 0.3 : 0.2);
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          // Strand 1 Node
          ctx.beginPath();
          ctx.arc(x1, y, 3 + depth1 * 3, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(primaryHex, 0.3 + depth1 * 0.6);
          ctx.shadowBlur = depth1 * 10;
          ctx.shadowColor = primaryHex;
          ctx.fill();

          // Strand 2 Node
          ctx.beginPath();
          ctx.arc(x2, y, 3 + depth2 * 3, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(primaryHex, 0.3 + depth2 * 0.6);
          ctx.shadowBlur = depth2 * 10;
          ctx.shadowColor = primaryHex;
          ctx.fill();
        }
      }

      // Synapse Electrical Sparks
      if (Math.random() < 0.05) {
        synapsePulses.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 2,
          maxRadius: 25 + Math.random() * 20,
          opacity: 0.8,
        });
      }

      for (let i = synapsePulses.length - 1; i >= 0; i--) {
        const p = synapsePulses[i];
        p.radius += 0.8;
        p.opacity -= 0.02;

        if (p.opacity <= 0) {
          synapsePulses.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(primaryHex, p.opacity);
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = primaryHex;
        ctx.stroke();
        ctx.restore();
      }
    };

    // ------------------------------------------------------------------------
    // 7. Medical 2: Cardio ECG Pulse & Blood Cells ('cardio_cells')
    // ------------------------------------------------------------------------
    interface Cell {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      rotation: number;
    }

    let cells: Cell[] = [];
    let ecgX = 0;

    const initCardioCells = () => {
      cells = [];
      ecgX = 0;
      const count = Math.max(25, Math.floor((width * height) / 25000));
      for (let i = 0; i < count; i++) {
        cells.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 12 + Math.random() * 16,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          rotation: Math.random() * Math.PI,
        });
      }
    };

    const renderCardioCells = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw floating biconcave cell discs
      cells.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;

        if (c.x < -30) c.x = width + 30;
        if (c.x > width + 30) c.x = -30;
        if (c.y < -30) c.y = height + 30;
        if (c.y > height + 30) c.y = -30;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);

        // Biconcave Cell Disc Silhouette
        ctx.beginPath();
        ctx.ellipse(0, 0, c.radius, c.radius * 0.6, 0, 0, Math.PI * 2);
        const cellGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, c.radius);
        cellGrad.addColorStop(0, hexToRgba(primaryHex, 0.15));
        cellGrad.addColorStop(0.7, hexToRgba(primaryHex, 0.35));
        cellGrad.addColorStop(1, hexToRgba(primaryHex, 0.55));
        ctx.fillStyle = cellGrad;
        ctx.strokeStyle = hexToRgba(primaryHex, 0.4);
        ctx.lineWidth = 1.2;
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      // 2. Continuous ECG Line Trace across screen
      ecgX += 2.5;
      if (ecgX > width) ecgX = 0;

      const ecgY = height * 0.5;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, ecgY);

      for (let x = 0; x <= ecgX; x += 3) {
        // Calculate ECG waveform (P-wave, QRS-complex spike, T-wave)
        const cycleX = (x % 350) / 350;
        let yOffset = 0;

        if (cycleX > 0.3 && cycleX < 0.36) {
          yOffset = -15 * Math.sin(((cycleX - 0.3) / 0.06) * Math.PI); // P-wave
        } else if (cycleX >= 0.42 && cycleX < 0.44) {
          yOffset = 12; // Q-dip
        } else if (cycleX >= 0.44 && cycleX < 0.48) {
          yOffset = -75 * Math.sin(((cycleX - 0.44) / 0.04) * Math.PI); // R-spike
        } else if (cycleX >= 0.48 && cycleX < 0.50) {
          yOffset = 20; // S-dip
        } else if (cycleX >= 0.60 && cycleX < 0.68) {
          yOffset = -22 * Math.sin(((cycleX - 0.60) / 0.08) * Math.PI); // T-wave
        }

        ctx.lineTo(x, ecgY + yOffset);
      }

      ctx.strokeStyle = hexToRgba(primaryHex, isDark ? 0.75 : 0.55);
      ctx.lineWidth = 2.2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = primaryHex;
      ctx.stroke();

      // Lead Glow Point at leading edge
      let leadY = ecgY;
      const cycleLead = (ecgX % 350) / 350;
      if (cycleLead > 0.3 && cycleLead < 0.36) leadY -= 15 * Math.sin(((cycleLead - 0.3) / 0.06) * Math.PI);
      else if (cycleLead >= 0.42 && cycleLead < 0.44) leadY += 12;
      else if (cycleLead >= 0.44 && cycleLead < 0.48) leadY -= 75 * Math.sin(((cycleLead - 0.44) / 0.04) * Math.PI);
      else if (cycleLead >= 0.48 && cycleLead < 0.50) leadY += 20;
      else if (cycleLead >= 0.60 && cycleLead < 0.68) leadY -= 22 * Math.sin(((cycleLead - 0.60) / 0.08) * Math.PI);

      ctx.beginPath();
      ctx.arc(ecgX, leadY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = primaryHex;
      ctx.fill();

      ctx.restore();
    };

    // Initialize Active Pattern Data
    const initPattern = () => {
      if (backgroundPattern === 'constellation') initConstellation();
      else if (backgroundPattern === 'stars') initStars();
      else if (backgroundPattern === 'math_chem') initMathChem();
      else if (backgroundPattern === 'light_rain') initLightRain();
      else if (backgroundPattern === 'cardio_cells') initCardioCells();
    };

    initPattern();

    const loop = () => {
      if (backgroundPattern === 'waves') renderSunsetOceanWaves();
      else if (backgroundPattern === 'constellation') renderConstellation();
      else if (backgroundPattern === 'stars') renderStars();
      else if (backgroundPattern === 'math_chem') renderMathChem();
      else if (backgroundPattern === 'light_rain') renderLightRain();
      else if (backgroundPattern === 'dna_synapse') renderDnaSynapse();
      else if (backgroundPattern === 'cardio_cells') renderCardioCells();
      else renderSunsetOceanWaves();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [backgroundPattern, animationEnabled, mode, palette]);

  if (!animationEnabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
      style={{
        opacity: mode === 'dark' ? 0.95 : 0.85,
      }}
    />
  );
};
