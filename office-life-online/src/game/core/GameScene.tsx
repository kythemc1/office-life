import { SharedLobby } from '../world/SharedLobby';
import { CharacterController } from '../character/CharacterController';
import { InteractionManager } from '../interaction/InteractionManager';
import { InteractionDemo } from '../interaction/InteractionDemo';

export function GameScene() {
  return (
    <>
      {/* Sky */}
      <color attach="background" args={['#87ceeb']} />

      {/* Lighting */}
      <ambientLight intensity={0.8} />

      <directionalLight
        position={[20, 30, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Shared Lobby */}
      <SharedLobby />

      {/* Local Player */}
      <CharacterController />

      {/* Interaction System */}
      <InteractionManager />

      {/* Interaction Test Object */}
      <InteractionDemo />
    </>
  );
}