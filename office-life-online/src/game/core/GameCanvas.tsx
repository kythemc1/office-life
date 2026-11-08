import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GameScene } from './GameScene';

export function GameCanvas() {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 3, 6],
        fov: 60,
        near: 0.1,
        far: 1000,
      }}
      gl={{
        antialias: true,
      }}
    >
      <Physics gravity={[0, -9.81, 0]}>
        <GameScene />
      </Physics>
    </Canvas>
  );
}