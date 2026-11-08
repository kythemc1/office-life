import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

import { interactionRuntime } from './InteractionRuntime';
import { InteractionPrompt } from './InteractionPrompt';
import type { ActiveInteraction } from './interaction.types';

const INTERACTION_DISTANCE = 2.5;
const PROMPT_HEIGHT = 1.5;

export function InteractionManager() {
  const [activeInteraction, setActiveInteraction] =
    useState<ActiveInteraction | null>(null);

  const activeInteractionRef =
    useRef<ActiveInteraction | null>(null);

  useFrame(() => {
    const nearest = interactionRuntime.getNearestTarget(
      INTERACTION_DISTANCE,
    );

    const nextInteraction: ActiveInteraction | null = nearest
      ? {
          id: nearest.target.id,
          label: nearest.target.label,
          position: nearest.position,
          distance: nearest.distance,
        }
      : null;

    const current = activeInteractionRef.current;

    const hasChanged =
      current?.id !== nextInteraction?.id ||
      current?.label !== nextInteraction?.label ||
      (
        current !== null &&
        nextInteraction !== null &&
        current.position.distanceToSquared(
          nextInteraction.position,
        ) > 0.0001
      );

    if (!hasChanged) {
      return;
    }

    activeInteractionRef.current = nextInteraction;
    setActiveInteraction(nextInteraction);
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyE' || event.repeat) {
        return;
      }

      const active = activeInteractionRef.current;

      if (!active) {
        return;
      }

      interactionRuntime.interact(
        active.id,
        INTERACTION_DISTANCE,
      );
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!activeInteraction) {
    return null;
  }

  return (
    <InteractionPrompt
      label={activeInteraction.label}
      position={[
        activeInteraction.position.x,
        activeInteraction.position.y + PROMPT_HEIGHT,
        activeInteraction.position.z,
      ]}
    />
  );
}