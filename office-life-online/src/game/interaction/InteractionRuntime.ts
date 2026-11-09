import { Vector3 } from 'three';
import type {
  InteractionCandidate,
  InteractionRegistration,
} from './interaction.types';

class InteractionRuntime {
  private readonly playerPosition = new Vector3();
  private readonly targets = new Map<string, InteractionRegistration>();
  private taskOverlayOpen = false;

  setPlayerPosition(position: Vector3): void {
    this.playerPosition.copy(position);
  }

  setTaskOverlayOpen(isOpen: boolean): void {
    this.taskOverlayOpen = isOpen;
  }

  isTaskOverlayActive(): boolean {
    return this.taskOverlayOpen;
  }

  register(target: InteractionRegistration): void {
    this.targets.set(target.id, target);
  }

  unregister(id: string): void {
    this.targets.delete(id);
  }

  getNearestTarget(maxDistance: number): InteractionCandidate | null {
    if (this.taskOverlayOpen) return null;

    let nearest: InteractionCandidate | null = null;

    for (const target of this.targets.values()) {
      const position = target.getPosition();
      const distance = this.playerPosition.distanceTo(position);

      if (distance > maxDistance) continue;

      if (!nearest || distance < nearest.distance) {
        nearest = {
          target,
          position: position.clone(),
          distance,
        };
      }
    }

    return nearest;
  }

  interact(id: string, maxDistance: number): boolean {
    if (this.taskOverlayOpen) return false;

    const target = this.targets.get(id);
    if (!target) return false;

    const targetPosition = target.getPosition();
    const distance = this.playerPosition.distanceTo(targetPosition);

    if (distance > maxDistance) return false;

    target.onInteract();
    return true;
  }
}

export const interactionRuntime = new InteractionRuntime();