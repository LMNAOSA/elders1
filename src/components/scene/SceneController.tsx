import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import ParticleSystem from './ParticleSystem';
import Lighting from './Lighting';
import { useStore } from '../../lib/store';

export default function SceneController() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const { currentScene, nextScene, transitionProgress, isCohesionActive } = useStore();

  const getCameraSettings = (scene: string) => {
    let pos = new THREE.Vector3(0, 5, 25);
    let lookAt = new THREE.Vector3(0, 0, 0);

    switch (scene) {
      case 'LAND':
        pos.set(0, 2, 35);
        break;
      case 'IDENTITY':
        pos.set(0, 0, 18);
        break;
      case 'AIRCRAFT':
        pos.set(0, 8, 20);
        lookAt.set(0, 0, 0);
        break;
      case 'FLIGHT':
        pos.set(0, 12, 15);
        lookAt.set(0, -5, 0);
        break;
      case 'IMPACT':
        pos.set(0, 25, 10);
        lookAt.set(0, 0, 0);
        break;
      case 'HUMAN':
        pos.set(10, 5, 20);
        break;
      default:
        pos.set(0, 5, 25);
    }
    return { pos, lookAt };
  };

  // Derived values for ParticleSystem
  const getParticleConfig = () => {
    let sourceKey: string = currentScene;
    let targetKey: string = nextScene;
    let cohesion = isCohesionActive ? 0.15 : 0.05;
    let t = transitionProgress;

    // Narrative overrides
    if (currentScene === 'AIRCRAFT') {
      targetKey = 'AIRCRAFT';
    }

    if (currentScene === 'FLIGHT') {
      if (transitionProgress < 0.25) {
        sourceKey = 'AIRCRAFT';
        targetKey = 'EQUIPMENT';
        t = transitionProgress / 0.25;
      } else if (transitionProgress < 0.5) {
        sourceKey = 'EQUIPMENT';
        targetKey = 'AIRCRAFT';
        t = (transitionProgress - 0.25) / 0.25;
      } else if (transitionProgress < 0.75) {
        sourceKey = 'AIRCRAFT';
        targetKey = 'IMAGE'; // William Creek
        t = (transitionProgress - 0.5) / 0.25;
      } else {
        sourceKey = 'IMAGE';
        targetKey = 'LAND';
        t = (transitionProgress - 0.75) / 0.25;
      }
    }

    if (currentScene === 'FLIGHT' && nextScene === 'IMPACT') {
      targetKey = 'MAP';
    }

    if (currentScene === 'IMPACT') {
      sourceKey = 'MAP';
      targetKey = 'MAP';
    }

    if (currentScene === 'OWNERSHIP') {
      targetKey = 'AIRCRAFT';
      cohesion = 0.2;
    }

    return { sourceKey, targetKey, transitionProgress: t, cohesion };
  };

  const { sourceKey, targetKey, transitionProgress: t, cohesion } = getParticleConfig();

  useFrame((state) => {
    const source = getCameraSettings(currentScene);
    const target = getCameraSettings(nextScene);

    const targetPos = source.pos.clone().lerp(target.pos, transitionProgress);
    
    // Add subtle drift
    const time = state.clock.getElapsedTime();
    targetPos.x += Math.sin(time * 0.5) * 0.5;
    targetPos.y += Math.cos(time * 0.3) * 0.2;

    cameraRef.current.position.lerp(targetPos, 0.05);
    
    // Smoothly update lookAt
    const targetLookAt = source.lookAt.clone().lerp(target.lookAt, transitionProgress);
    cameraRef.current.lookAt(targetLookAt);
  });

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} position={[0, 5, 25]} fov={60} />
      
      <ParticleSystem 
        sourceKey={sourceKey} 
        targetKey={targetKey} 
        transitionProgress={t} 
        cohesion={cohesion} 
      />
      <Lighting />
      
      <fog attach="fog" args={['#000000', 10, 80]} />
    </>
  );
}
