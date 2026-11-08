import type { Vector3 } from 'three';

export interface InteractionRegistration {
  id: string;
  label: string;
  getPosition: () => Vector3;
  onInteract: () => void;
}

export interface ActiveInteraction {
  id: string;
  label: string;
  position: Vector3;
  distance: number;
}

export interface InteractionCandidate {
  target: InteractionRegistration;
  position: Vector3;
  distance: number;
}