import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Group, Vector3 } from 'three';

import { interactionRuntime } from './InteractionRuntime';

interface InteractionTargetProps {
  id: string;
  label: string;
  position?: [number, number, number];
  onInteract: () => void;
  children: ReactNode;
}

export function InteractionTarget({
  id,
  label,
  position = [0, 0, 0],
  onInteract,
  children,
}: InteractionTargetProps) {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    interactionRuntime.register({
      id,
      label,
      getPosition: () => {
        const object = groupRef.current;

        if (!object) {
          return new Vector3();
        }

        const worldPosition = new Vector3();

        object.getWorldPosition(worldPosition);

        return worldPosition;
      },
      onInteract,
    });

    return () => {
      interactionRuntime.unregister(id);
    };
  }, [id, label, onInteract]);

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
}