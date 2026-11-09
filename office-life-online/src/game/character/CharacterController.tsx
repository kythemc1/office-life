import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
  useRapier,
} from '@react-three/rapier';
import { Group, Vector3 } from 'three';

import { KeyboardController } from '../controls/KeyboardController';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import { interactionRuntime } from '../interaction/InteractionRuntime';
import { gameConnection } from '../network/GameConnection';

const MODEL_PATH = new URL(
  '../../assets/characters/player/player.glb',
  import.meta.url,
).href;

interface CharacterControllerProps {
  speed?: number;
  runMultiplier?: number;
  spawnPosition?: [number, number, number];
}

const POSITION_SYNC_INTERVAL = 1 / 15;

export function CharacterController({
  speed = 4,
  runMultiplier = 2,
  spawnPosition = [0, 0, 0],
}: CharacterControllerProps) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const visualRef = useRef<Group>(null);
  const positionSyncElapsed = useRef(0);

  const { scene } = useGLTF(MODEL_PATH);
  const { camera } = useThree();
  const { world } = useRapier();

  const keyboard = useMemo(
    () => new KeyboardController(),
    [],
  );

  const direction = useMemo(() => new Vector3(), []);
  const forward = useMemo(() => new Vector3(), []);
  const right = useMemo(() => new Vector3(), []);
  const up = useMemo(() => new Vector3(0, 1, 0), []);

  const characterControllerRef = useRef<
    ReturnType<typeof world.createCharacterController> | null
  >(null);

  useEffect(() => {
    keyboard.connect();

    const controller = world.createCharacterController(0.01);
    controller.setSlideEnabled(true);

    characterControllerRef.current = controller;

    return () => {
      keyboard.dispose();
      world.removeCharacterController(controller);
      characterControllerRef.current = null;
    };
  }, [keyboard, world]);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    const visual = visualRef.current;
    const controller = characterControllerRef.current;

    if (!body || !visual || !controller) return;

    const collider = body.collider(0);
    if (!collider) return;

    const currentPosition = body.translation();

    interactionRuntime.setPlayerPosition(
      new Vector3(
        currentPosition.x,
        currentPosition.y,
        currentPosition.z,
      ),
    );

    const safeDelta = Math.min(delta, 0.05);

    positionSyncElapsed.current += safeDelta;

    if (positionSyncElapsed.current >= POSITION_SYNC_INTERVAL) {
      positionSyncElapsed.current %= POSITION_SYNC_INTERVAL;

      void gameConnection.updatePosition(
        currentPosition.x,
        currentPosition.y,
        currentPosition.z,
        visual.rotation.y,
      ).catch((error) => {
        console.error('[Multiplayer] Position sync failed:', error);
      });
    }

    const input = keyboard.getInput();

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.crossVectors(forward, up).normalize();

    direction.set(0, 0, 0);

    if (input.forward) direction.add(forward);
    if (input.backward) direction.sub(forward);
    if (input.right) direction.add(right);
    if (input.left) direction.sub(right);

    if (direction.lengthSq() === 0) return;

    direction.normalize();

    const currentSpeed = input.run
      ? speed * runMultiplier
      : speed;

    const movement = direction.clone().multiplyScalar(
      currentSpeed * safeDelta,
    );

    controller.computeColliderMovement(collider, {
      x: movement.x,
      y: 0,
      z: movement.z,
    });

    const correctedMovement = controller.computedMovement();

    body.setNextKinematicTranslation({
      x: currentPosition.x + correctedMovement.x,
      y: currentPosition.y + correctedMovement.y,
      z: currentPosition.z + correctedMovement.z,
    });

    const targetRotation = Math.atan2(
      direction.x,
      direction.z,
    );

    let rotationDiff = targetRotation - visual.rotation.y;

    rotationDiff = Math.atan2(
      Math.sin(rotationDiff),
      Math.cos(rotationDiff),
    );

    visual.rotation.y += rotationDiff * (
      1 - Math.exp(-12 * safeDelta)
    );
  });

  return (
    <>
      <RigidBody
        ref={bodyRef}
        type="kinematicPosition"
        colliders={false}
        position={spawnPosition}
        enabledRotations={[false, false, false]}
      >
        <CapsuleCollider
          args={[0.6, 0.3]}
          position={[0, 0.9, 0]}
        />

        <group ref={visualRef}>
          <primitive object={scene} />
        </group>
      </RigidBody>

      <ThirdPersonCamera target={visualRef} />
    </>
  );
}

useGLTF.preload(MODEL_PATH);