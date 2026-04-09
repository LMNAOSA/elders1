/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import SceneController from './components/scene/SceneController';
import Overlay from './components/ui/Overlay';

export default function App() {
  return (
    <main className="relative w-full bg-black">
      {/* 3D Canvas Layer */}
      <div className="fixed inset-0 w-full h-full bg-black">
        <Canvas
          shadows
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#000000']} />
          <Suspense fallback={null}>
            <SceneController />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay Layer */}
      <Overlay />

      {/* Scroll Spacer - 10 states, each with some scroll room */}
      <div className="relative h-[1000vh] pointer-events-none" />
    </main>
  );
}
