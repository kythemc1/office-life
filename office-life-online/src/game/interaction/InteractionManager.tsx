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

  const activeInteractionRef = useRef<ActiveInteraction | null>(null);

  useFrame(() => {
    const previous = activeInteractionRef.current;

    const nearest = interactionRuntime.getNearestTarget(
      INTERACTION_DISTANCE,
    );

    const next: ActiveInteraction | null = nearest
      ? {
          id: nearest.target.id,
          label: nearest.target.label,
          position: nearest.position,
          distance: nearest.distance,
        }
      : null;

    if (
      previous?.id !== next?.id ||
      previous?.label !== next?.label
    ) {
      setActiveInteraction(next);
    }

    activeInteractionRef.current = next;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.code !== 'KeyE' ||
        event.repeat ||
        interactionRuntime.isTaskOverlayActive()
      ) {
        return;
      }

      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (
          target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
        )
      ) {
        return;
      }

      const active = activeInteractionRef.current;
      if (!active) return;

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

  if (!activeInteraction) return null;

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