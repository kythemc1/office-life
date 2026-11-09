
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, MathUtils } from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

import { useRemotePlayers } from '../network/MultiplayerStore';

const MODEL_PATH = new URL(
  '../../assets/characters/player/player.glb',
  import.meta.url,
).href;

interface RemotePlayerProps {
  player: ReturnType<typeof useRemotePlayers>[number];
}

function RemotePlayer({ player }: RemotePlayerProps) {
  const groupRef = useRef<Group>(null);

  const { scene } = useGLTF(MODEL_PATH);

  const model = useMemo(
    () => SkeletonUtils.clone(scene),
    [scene],
  );

  useFrame((_, delta) => {
    const group = groupRef.current;

    if (!group) return;

    const safeDelta = Math.min(delta, 0.05);
    const alpha = 1 - Math.exp(-12 * safeDelta);

    group.position.x = MathUtils.lerp(
      group.position.x,
      player.x,
      alpha,
    );

    group.position.y = MathUtils.lerp(
      group.position.y,
      player.y,
      alpha,
    );

    group.position.z = MathUtils.lerp(
      group.position.z,
      player.z,
      alpha,
    );

    let rotationDiff = player.rotationY - group.rotation.y;

    rotationDiff = Math.atan2(
      Math.sin(rotationDiff),
      Math.cos(rotationDiff),
    );

    group.rotation.y += rotationDiff * alpha;
  });

  return (
    <group
      ref={groupRef}
      position={[player.x, player.y, player.z]}
      rotation={[0, player.rotationY, 0]}
    >
      <primitive object={model} />
    </group>
  );
}

export function RemotePlayers() {
  const players = useRemotePlayers();

  return (
    <>
      {players.map((player) => (
        <RemotePlayer
          key={player.connectionId}
          player={player}
        />
      ))}
    </>
  );
}

useGLTF.preload(MODEL_PATH);
