
import { useSyncExternalStore } from 'react';

export type WorldType = 'SharedLobby' | 'Office';

export interface WorldState {
  world: WorldType;
  officeId: string | null;
}

type Listener = () => void;

class WorldStore {
  private state: WorldState = {
    world: 'SharedLobby',
    officeId: null,
  };

  private listeners = new Set<Listener>();

  getSnapshot = (): WorldState => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  enterOffice(officeId: string): void {
    this.state = {
      world: 'Office',
      officeId,
    };

    this.notify();
  }

  enterLobby(): void {
    this.state = {
      world: 'SharedLobby',
      officeId: null,
    };

    this.notify();
  }
}

export const worldStore = new WorldStore();

export function useWorld(): WorldState {
  return useSyncExternalStore(
    worldStore.subscribe,
    worldStore.getSnapshot,
    worldStore.getSnapshot,
  );
}
