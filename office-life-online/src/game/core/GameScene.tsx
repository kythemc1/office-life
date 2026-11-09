
import { SharedLobby } from '../world/SharedLobby';
import { OfficeWorld } from '../world/OfficeWorld';
import { CharacterController } from '../character/CharacterController';
import { RemotePlayers } from '../character/RemotePlayers';
import { InteractionManager } from '../interaction/InteractionManager';
import { ElevatorInteraction } from '../interaction/ElevatorInteraction';
import { useWorld } from '../session/WorldStore';

export function GameScene() {
  const { world } = useWorld();

  return (
    <>
      <color attach="background" args={['#87ceeb']} />
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[20, 30, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {world === 'SharedLobby' ? (
        <>
          <SharedLobby />
          <InteractionManager />
          <ElevatorInteraction />
        </>
      ) : (
        <OfficeWorld />
      )}

      <CharacterController />
      <RemotePlayers />
    </>
  );
}
