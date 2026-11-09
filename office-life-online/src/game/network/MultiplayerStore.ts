import { useSyncExternalStore } from 'react';

export interface PlayerInfo {
  connectionId: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  [key: string]: any;
}

export interface RoomSnapshot {
  roomId: string;
  players: PlayerInfo[];
  [key: string]: any;
}

export interface RemotePlayerPosition {
  connectionId: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
}

interface MultiplayerState {
  players: PlayerInfo[];
  roomId: string | null;
  localConnectionId: string | null;
}

class MultiplayerStore {
  private state: MultiplayerState = {
    players: [],
    roomId: null,
    localConnectionId: null,
  };

  private listeners = new Set<() => void>();

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): MultiplayerState => this.state;

  getLocalConnectionId = (): string | null =>
    this.state.localConnectionId;

  setRoom(
    room: RoomSnapshot,
    localConnectionId: string | null = null,
  ): void {
    this.state = {
      roomId: room.roomId,
      localConnectionId,
      players: room.players.filter(
        player => player.connectionId !== localConnectionId,
      ),
    };

    this.notify();
  }

  addPlayer(player: PlayerInfo): void {
    if (player.connectionId === this.state.localConnectionId) {
      return;
    }

    const players = this.state.players.filter(
      item => item.connectionId !== player.connectionId,
    );

    this.state = {
      ...this.state,
      players: [...players, player],
    };

    this.notify();
  }

  removePlayer(connectionId: string): void {
    const players = this.state.players.filter(
      player => player.connectionId !== connectionId,
    );

    if (players.length === this.state.players.length) {
      return;
    }

    this.state = {
      ...this.state,
      players,
    };

    this.notify();
  }

  updatePlayerPosition(position: RemotePlayerPosition): void {
    this.updatePosition(position);
  }

  updatePosition(position: RemotePlayerPosition): void {
    if (position.connectionId === this.state.localConnectionId) {
      return;
    }

    const playerExists = this.state.players.some(
      player => player.connectionId === position.connectionId,
    );

    if (!playerExists) {
      return;
    }

    this.state = {
      ...this.state,
      players: this.state.players.map(player =>
        player.connectionId === position.connectionId
          ? {
              ...player,
              x: position.x,
              y: position.y,
              z: position.z,
              rotationY: position.rotationY,
            }
          : player,
      ),
    };

    this.notify();
  }

  removeRoom(roomId: string): void {
    if (this.state.roomId !== roomId) {
      return;
    }

    this.clear();
  }

  clear(): void {
    this.state = {
      players: [],
      roomId: null,
      localConnectionId: null,
    };

    this.notify();
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const multiplayerStore = new MultiplayerStore();

export function useRemotePlayers(): PlayerInfo[] {
  return useSyncExternalStore(
    multiplayerStore.subscribe,
    () => multiplayerStore.getSnapshot().players,
    () => [],
  );
}