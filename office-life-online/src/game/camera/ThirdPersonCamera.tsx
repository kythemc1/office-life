import { useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';

interface ThirdPersonCameraProps {
  target: RefObject<Group | null>;
  distance?: number;
  height?: number;
  smoothness?: number;
}

export function ThirdPersonCamera({
  target,
  distance = 9,
  height = 7,
  smoothness = 8,
}: ThirdPersonCameraProps) {
  const desiredPosition = useRef(new Vector3());
  const lookAtPosition = useRef(new Vector3());
  const targetPosition = useRef(new Vector3());
  const initialized = useRef(false);

  useFrame(({ camera }, delta) => {
    const player = target.current;
    if (!player) return;

    player.getWorldPosition(targetPosition.current);

    const position = targetPosition.current;

    // Fixed camera position behind and above player
    desiredPosition.current.set(
      position.x,
      position.y + height,
      position.z + distance,
    );

    // Smooth camera follow
    const alpha = 1 - Math.exp(-smoothness * delta);

    if (!initialized.current) {
      camera.position.copy(desiredPosition.current);
      initialized.current = true;
    } else {
      camera.position.lerp(
        desiredPosition.current,
        alpha,
      );
    }

    // Look down toward player
    lookAtPosition.current.set(
      position.x,
      position.y + 1,
      position.z,
    );

    camera.lookAt(lookAtPosition.current);
  });

  return null;
}