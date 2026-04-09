import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useStore } from '../../lib/store';

const PARTICLE_COUNT = 25000;
const MOUSE_RADIUS_SQ = 100;
const RFDS_BLUE = new THREE.Color('#008dc7');

interface ParticleSystemProps {
  sourceKey: string;
  targetKey: string;
  transitionProgress: number;
  cohesion: number;
}

export default function ParticleSystem({ sourceKey, targetKey, transitionProgress, cohesion }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const { mousePosition } = useStore();
  const [imageReady, setImageReady] = useState(false);

  // Buffers
  const buffers = useMemo(() => {
    const lPos = new Float32Array(PARTICLE_COUNT * 3);
    const iPos = new Float32Array(PARTICLE_COUNT * 3);
    const aPos = new Float32Array(PARTICLE_COUNT * 3);
    const ePos = new Float32Array(PARTICLE_COUNT * 3);
    const mPos = new Float32Array(PARTICLE_COUNT * 3);
    const imgPos = new Float32Array(PARTICLE_COUNT * 3);
    const imgCol = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // LAND
      lPos[i3] = (Math.random() - 0.5) * 100;
      lPos[i3 + 1] = -15 + (Math.random() - 0.5) * 5;
      lPos[i3 + 2] = (Math.random() - 0.5) * 100;

      // IDENTITY
      const dist = 10 + Math.random() * 15;
      const angle = Math.random() * Math.PI * 2;
      iPos[i3] = dist * Math.cos(angle);
      iPos[i3 + 1] = (Math.random() - 0.5) * 6;
      iPos[i3 + 2] = dist * Math.sin(angle);

      // AIRCRAFT (PC-12 Silhouette)
      const section = Math.random();
      if (section < 0.35) { // Fuselage
        aPos[i3] = (Math.random() - 0.5) * 1.5;
        aPos[i3 + 1] = (Math.random() - 0.5) * 1.5;
        aPos[i3 + 2] = (Math.random() - 0.5) * 25;
      } else if (section < 0.75) { // Wings
        const wingSide = Math.random() > 0.5 ? 1 : -1;
        const wingPos = Math.random();
        aPos[i3] = wingSide * (2 + wingPos * 18);
        aPos[i3 + 1] = (Math.random() - 0.5) * 0.4;
        aPos[i3 + 2] = (Math.random() - 0.5) * 3 - wingPos * 2; // Slight sweep
      } else if (section < 0.9) { // Tail Horizontal
        aPos[i3] = (Math.random() - 0.5) * 8;
        aPos[i3 + 1] = 4 + (Math.random() - 0.5) * 0.5;
        aPos[i3 + 2] = -11 + (Math.random() - 0.5) * 2;
      } else { // Tail Vertical
        aPos[i3] = (Math.random() - 0.5) * 0.4;
        aPos[i3 + 1] = Math.random() * 6;
        aPos[i3 + 2] = -11 + (Math.random() - 0.5) * 1;
      }

      // EQUIPMENT
      const eqType = Math.random();
      if (eqType < 0.5) { // Defibrillator
        const bx = (Math.random() - 0.5) * 8 - 10;
        const by = (Math.random() - 0.5) * 6 + 5;
        const bz = (Math.random() - 0.5) * 4;
        ePos[i3] = bx; ePos[i3 + 1] = by; ePos[i3 + 2] = bz;
      } else { // Ventilator
        const bx = (Math.random() - 0.5) * 5 + 10;
        const by = (Math.random() - 0.5) * 10 + 5;
        const bz = (Math.random() - 0.5) * 5;
        ePos[i3] = bx; ePos[i3 + 1] = by; ePos[i3 + 2] = bz;
      }

      // MAP (SA/NT Abstraction)
      const mx = (Math.random() - 0.5) * 60;
      const mz = (Math.random() - 0.5) * 80;
      // Simple geographic mask
      const inSA = mx > -15 && mx < 15 && mz > -10 && mz < 20;
      const inNT = mx > -10 && mx < 10 && mz > 20 && mz < 50;
      mPos[i3] = mx;
      mPos[i3 + 1] = (inSA || inNT) ? 0 : -40;
      mPos[i3 + 2] = mz;
    }

    return { 
      LAND: lPos, 
      IDENTITY: iPos, 
      AIRCRAFT: aPos, 
      EQUIPMENT: ePos, 
      MAP: mPos,
      IMAGE: imgPos,
      IMAGE_COL: imgCol
    };
  }, []);

  // Image Sampling
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/story/william-creek.jpg";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = Math.floor(Math.sqrt(PARTICLE_COUNT));
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const i4 = i * 4;
        if (i >= size * size) {
          buffers.IMAGE[i3] = 0; buffers.IMAGE[i3+1] = -100; buffers.IMAGE[i3+2] = 0;
          continue;
        }
        
        const x = (i % size) - size / 2;
        const y = Math.floor(i / size) - size / 2;
        
        buffers.IMAGE[i3] = x * 0.4;
        buffers.IMAGE[i3 + 1] = -y * 0.4;
        buffers.IMAGE[i3 + 2] = 0;

        buffers.IMAGE_COL[i3] = data[i4] / 255;
        buffers.IMAGE_COL[i3 + 1] = data[i4 + 1] / 255;
        buffers.IMAGE_COL[i3 + 2] = data[i4 + 2] / 255;
      }
      setImageReady(true);
    };
    // Fallback if image fails
    img.onerror = () => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        buffers.IMAGE[i3] = (Math.random() - 0.5) * 40;
        buffers.IMAGE[i3 + 1] = (Math.random() - 0.5) * 30;
        buffers.IMAGE[i3 + 2] = 0;
        buffers.IMAGE_COL[i3] = 0.5; buffers.IMAGE_COL[i3+1] = 0.5; buffers.IMAGE_COL[i3+2] = 0.5;
      }
      setImageReady(true);
    };
  }, [buffers]);

  const initialColors = useMemo(() => {
    const c = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      c[i3] = 0.2; c[i3 + 1] = 0.1; c[i3 + 2] = 0.05;
    }
    return c;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(initialColors, 3));
    return geo;
  }, [initialColors]);

  useFrame((state, delta) => {
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;
    const time = state.clock.getElapsedTime();

    const sourceBuffer = (buffers as any)[sourceKey] || buffers.LAND;
    const targetBuffer = (buffers as any)[targetKey] || buffers.LAND;

    const lerpSpeed = sourceKey === 'IMAGE' || targetKey === 'IMAGE' ? 0.15 : cohesion;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // 1. Morphing
      let tx = sourceBuffer[i3] + (targetBuffer[i3] - sourceBuffer[i3]) * transitionProgress;
      let ty = sourceBuffer[i3 + 1] + (targetBuffer[i3 + 1] - sourceBuffer[i3 + 1]) * transitionProgress;
      let tz = sourceBuffer[i3 + 2] + (targetBuffer[i3 + 2] - sourceBuffer[i3 + 2]) * transitionProgress;

      // 2. Map Route Animation (Subset of particles)
      if (targetKey === 'MAP' && i < 2000) {
        const routeIdx = i % 5;
        const t = (time * 0.2 + i * 0.001) % 1;
        const startX = -10 + routeIdx * 5;
        const startZ = -5;
        const endX = 5 - routeIdx * 3;
        const endZ = 30;
        
        // Simple quadratic curve
        const curveX = THREE.MathUtils.lerp(startX, endX, t);
        const curveZ = THREE.MathUtils.lerp(startZ, endZ, t);
        const curveY = Math.sin(t * Math.PI) * 5;

        tx = THREE.MathUtils.lerp(tx, curveX, transitionProgress);
        ty = THREE.MathUtils.lerp(ty, curveY, transitionProgress);
        tz = THREE.MathUtils.lerp(tz, curveZ, transitionProgress);
      }

      // 3. Cursor Interaction
      const dx = positions[i3] - mousePosition.x * 20;
      const dy = positions[i3 + 1] - mousePosition.y * 20;
      const distSq = dx * dx + dy * dy;

      let force = 0;
      if (distSq < MOUSE_RADIUS_SQ) {
        force = (1 - distSq / MOUSE_RADIUS_SQ) * 0.25;
      }

      // 4. Apply movement
      positions[i3] += (tx - positions[i3] - dx * force) * lerpSpeed;
      positions[i3 + 1] += (ty - positions[i3 + 1] - dy * force) * lerpSpeed;
      positions[i3 + 2] += (tz - positions[i3 + 2]) * lerpSpeed;

      // 5. Color
      let targetR = 0.2, targetG = 0.1, targetB = 0.05;

      if (targetKey === 'IMAGE' && imageReady) {
        targetR = buffers.IMAGE_COL[i3];
        targetG = buffers.IMAGE_COL[i3 + 1];
        targetB = buffers.IMAGE_COL[i3 + 2];
      } else if (targetKey === 'MAP' && i < 2000) {
        targetR = RFDS_BLUE.r; targetG = RFDS_BLUE.g; targetB = RFDS_BLUE.b;
      } else if (targetKey === 'AIRCRAFT') {
        const isBlue = i % 10 === 0;
        targetR = isBlue ? RFDS_BLUE.r : 0.9;
        targetG = isBlue ? RFDS_BLUE.g : 0.9;
        targetB = isBlue ? RFDS_BLUE.b : 0.9;
      } else if (['EQUIPMENT', 'MAP'].includes(targetKey)) {
        targetR = 0.1; targetG = 0.6; targetB = 0.9;
      }

      colors[i3] += (targetR - colors[i3]) * 0.15;
colors[i3 + 1] += (targetG - colors[i3 + 1]) * 0.15;
colors[i3 + 2] += (targetB - colors[i3 + 2]) * 0.15;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
