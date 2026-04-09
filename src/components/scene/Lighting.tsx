import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../../lib/store';

export default function Lighting() {
  const { currentScene, nextScene, transitionProgress } = useStore();
  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const directionalRef = useRef<THREE.DirectionalLight>(null!);

  const getLightSettings = (scene: string) => {
    let ambientIntensity = 0.2;
    let directionalIntensity = 0.5;
    let lightColor = new THREE.Color('#ffffff');

    switch (scene) {
      case 'LAND':
        ambientIntensity = 0.3;
        directionalIntensity = 0.8;
        lightColor.set('#ff9966'); // Warm sunrise/sunset
        break;
      case 'IDENTITY':
        ambientIntensity = 0.5;
        directionalIntensity = 1.2;
        lightColor.set('#ffccaa');
        break;
      case 'AIRCRAFT':
      case 'FLIGHT':
        ambientIntensity = 0.8;
        directionalIntensity = 1.5;
        lightColor.set('#ffffff');
        break;
      case 'IMPACT':
        ambientIntensity = 0.4;
        directionalIntensity = 0.6;
        lightColor.set('#99ccff'); // Cool map light
        break;
      default:
        ambientIntensity = 0.5;
        directionalIntensity = 1.0;
        lightColor.set('#ffffff');
    }
    return { ambientIntensity, directionalIntensity, lightColor };
  };

  useFrame(() => {
    const source = getLightSettings(currentScene);
    const target = getLightSettings(nextScene);

    const ambientIntensity = THREE.MathUtils.lerp(source.ambientIntensity, target.ambientIntensity, transitionProgress);
    const directionalIntensity = THREE.MathUtils.lerp(source.directionalIntensity, target.directionalIntensity, transitionProgress);
    const lightColor = source.lightColor.clone().lerp(target.lightColor, transitionProgress);

    ambientRef.current.intensity += (ambientIntensity - ambientRef.current.intensity) * 0.05;
    directionalRef.current.intensity += (directionalIntensity - directionalRef.current.intensity) * 0.05;
    directionalRef.current.color.lerp(lightColor, 0.05);
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.2} />
      <directionalLight
        ref={directionalRef}
        position={[10, 10, 5]}
        intensity={0.5}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.2} color="#4444ff" />
    </>
  );
}
