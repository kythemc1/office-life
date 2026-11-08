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

const MODEL_PATH = new URL(
  '../../assets/characters/player/player.glb',
  import.meta.url,
).href;

interface CharacterControllerProps {
  speed?: number;
  runMultiplier?: number;
}

export function CharacterController({
  speed = 4,
  runMultiplier = 2,
}: CharacterControllerProps) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const visualRef = useRef<Group>(null);

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

    // Update player position for interaction system every frame.
    interactionRuntime.setPlayerPosition(
      new Vector3(
        currentPosition.x,
        currentPosition.y,
        currentPosition.z,
      ),
    );

    const input = keyboard.getInput();

    // Camera-relative movement
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

    const safeDelta = Math.min(delta, 0.05);

    const movement = direction.clone().multiplyScalar(
      currentSpeed * safeDelta,
    );

    // Calculate collision-aware movement
    controller.computeColliderMovement(collider, {
      x: movement.x,
      y: 0,
      z: movement.z,
    });

    const correctedMovement = controller.computedMovement();

    // Apply corrected movement
    body.setNextKinematicTranslation({
      x: currentPosition.x + correctedMovement.x,
      y: currentPosition.y + correctedMovement.y,
      z: currentPosition.z + correctedMovement.z,
    });

    // Rotate visual character
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
        position={[0, 0, 0]}
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