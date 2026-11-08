import { Ground } from '../world/Ground';
import { WorldGrid } from '../world/WorldGrid';
import { CharacterController } from '../character/CharacterController';
import { PhysicsObjects } from '../physics/PhysicsObjects';

export function GameScene() {
  return (
    <>
      <color attach="background" args={['#87ceeb']} />

      <ambientLight intensity={0.7} />

      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
      />

      <Ground />
      <WorldGrid />

      <PhysicsObjects />

      <CharacterController />
    </>
  );
}