import { SharedLobby } from '../world/SharedLobby';
import { OfficeWorld } from '../world/OfficeWorld';
import { CharacterController } from '../character/CharacterController';
import { RemotePlayers } from '../character/RemotePlayers';
import { InteractionManager } from '../interaction/InteractionManager';
import { ElevatorInteraction } from '../interaction/ElevatorInteraction';
import { OfficeInteractionTargets } from '../interaction/OfficeInteractionTargets';
import { OfficeExit } from '../interaction/OfficeExit';
import { useWorld } from '../session/WorldStore';

// Shared Lobby giữ nguyên vị trí spawn hiện tại.
const SHARED_LOBBY_SPAWN: [number, number, number] = [0, 0, 0];

// Điểm spawn dự kiến tại lối đi Open Workspace.
const OFFICE_SPAWN: [number, number, number] = [0, 0, -2];

export function GameScene() {
  const { world } = useWorld();

  const spawnPosition = world === 'SharedLobby'
    ? SHARED_LOBBY_SPAWN
    : OFFICE_SPAWN;

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
          <ElevatorInteraction />
        </>
      ) : (
        <>
          <OfficeWorld />
          <OfficeInteractionTargets />
          <OfficeExit />
        </>
      )}

      <InteractionManager />

      <CharacterController
        key={world}
        spawnPosition={spawnPosition}
      />

      <RemotePlayers />
    </>
  );
}