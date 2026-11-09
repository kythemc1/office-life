
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';

import type { PlayerRole } from '../session/PlayerSession';
import { multiplayerStore } from './MultiplayerStore';

export interface PlayerInfo {
  connectionId: string;
  displayName: string;
  role: string | null;
  joinedAt: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
}

export interface RoomSnapshot {
  roomId: string;
  name: string;
  type: string | number;
  isPublic: boolean;
  playerCount: number;
  players: PlayerInfo[];
}

interface PlayerPositionUpdate {
  connectionId: string;
  x: number;
  y: number;
  z: number;
  rotationY: number;
}

const HUB_URL =
  import.meta.env.VITE_GAME_HUB_URL ??
  'http://localhost:5012/hubs/game';

function toBackendRole(role: PlayerRole): string {
  return role === 'Team Leader' ? 'TeamLeader' : role;
}

class GameConnection {
  private readonly connection: HubConnection;
  private startPromise: Promise<void> | null = null;

  constructor() {
    this.connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on('PlayerJoined', (player: PlayerInfo) => {
      multiplayerStore.addPlayer(player);
    });

    this.connection.on('PlayerLeft', (connectionId: string) => {
      multiplayerStore.removePlayer(connectionId);
    });

    this.connection.on('PlayerMoved', (position: PlayerPositionUpdate) => {
      multiplayerStore.updatePosition(position);
    });

    this.connection.onreconnected(async () => {
      try {
        const room = await this.joinLobby();
        console.info(
          '[SignalR] Reconnected and joined Shared Lobby:',
          room.roomId,
        );
      } catch (error) {
        console.error('[SignalR] Failed to rejoin Lobby:', error);
      }
    });

    this.connection.onclose((error) => {
      multiplayerStore.clear();

      if (error) {
        console.error('[SignalR] Connection closed:', error);
      }
    });
  }

  getConnectionId(): string | null {
    return this.connection.connectionId ?? null;
  }

  async connect(): Promise<void> {
    if (this.connection.state === HubConnectionState.Connected) {
      return;
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    this.startPromise = this.connection
      .start()
      .then(() => {
        console.info('[SignalR] Connected:', HUB_URL);
      })
      .finally(() => {
        this.startPromise = null;
      });

    return this.startPromise;
  }

  async joinLobby(displayName = 'Player'): Promise<RoomSnapshot> {
    await this.connect();

    const room = await this.connection.invoke<RoomSnapshot>(
      'JoinLobby',
      displayName,
    );

    multiplayerStore.setRoom(room, this.getConnectionId());

    return room;
  }

  async createOffice(
    displayName: string,
    role: PlayerRole,
  ): Promise<RoomSnapshot> {
    await this.ensureConnected();

    const room = await this.connection.invoke<RoomSnapshot>(
      'CreateOffice',
      displayName,
      toBackendRole(role),
    );

    multiplayerStore.setRoom(room, this.getConnectionId());

    return room;
  }

  async getPublicOfficeRooms(): Promise<RoomSnapshot[]> {
    await this.ensureConnected();

    return this.connection.invoke<RoomSnapshot[]>(
      'GetPublicOfficeRooms',
    );
  }

  async joinOffice(
    roomId: string,
    displayName: string,
    role: PlayerRole,
  ): Promise<RoomSnapshot> {
    await this.ensureConnected();

    const room = await this.connection.invoke<RoomSnapshot>(
      'JoinOffice',
      roomId,
      displayName,
      toBackendRole(role),
    );

    multiplayerStore.setRoom(room, this.getConnectionId());

    return room;
  }

  async updatePosition(
    x: number,
    y: number,
    z: number,
    rotationY: number,
  ): Promise<void> {
    if (this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    await this.connection.send(
      'UpdatePosition',
      x,
      y,
      z,
      rotationY,
    );
  }

  async leaveRoom(): Promise<void> {
    if (this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    await this.connection.invoke('LeaveRoom');
    multiplayerStore.clear();
  }

  private async ensureConnected(): Promise<void> {
    if (this.connection.state !== HubConnectionState.Connected) {
      throw new Error('SignalR chưa kết nối. Vui lòng thử lại.');
    }
  }
}

export const gameConnection = new GameConnection();
