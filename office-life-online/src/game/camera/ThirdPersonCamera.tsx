import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Vector3 } from 'three';

interface ThirdPersonCameraProps {
  target: RefObject<Group | null>;
  distance?: number;
  height?: number;
  sensitivity?: number;
  smoothness?: number;
}

export function ThirdPersonCamera({
  target,
  distance = 6,
  height = 2,
  sensitivity = 0.0025,
  smoothness = 10,
}: ThirdPersonCameraProps) {
  const { camera, gl } = useThree();

  const yaw = useRef(0);
  const pitch = useRef(0.15);

  const desiredPosition = useRef(new Vector3());
  const lookAtPosition = useRef(new Vector3());
  const targetPosition = useRef(new Vector3());

  useEffect(() => {
    const canvas = gl.domElement;

    const handleClick = () => {
      if (document.pointerLockElement !== canvas) {
        void canvas.requestPointerLock();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;

      yaw.current += event.movementX * sensitivity;
      pitch.current -= event.movementY * sensitivity;

      pitch.current = Math.max(
        -0.35,
        Math.min(0.8, pitch.current),
      );
    };

    canvas.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl, sensitivity]);

  useFrame((_, delta) => {
    const player = target.current;
    if (!player) return;

    player.getWorldPosition(targetPosition.current);

    const position = targetPosition.current;

    const horizontalDistance = distance * Math.cos(pitch.current);

    desiredPosition.current.set(
      position.x + Math.sin(yaw.current) * horizontalDistance,
      position.y + height + Math.sin(pitch.current) * distance,
      position.z + Math.cos(yaw.current) * horizontalDistance,
    );

    const alpha = 1 - Math.exp(-smoothness * delta);

    camera.position.lerp(desiredPosition.current, alpha);

    lookAtPosition.current.set(
      position.x,
      position.y + 1.2,
      position.z,
    );

    camera.lookAt(lookAtPosition.current);
  });

  return null;
}