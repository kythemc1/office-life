import * as signalR from '@microsoft/signalr';

import type { PlayerRole } from '../session/PlayerSession';
import { multiplayerStore } from './MultiplayerStore';
import {
  type QuestActionResult,
  type QuestAssignment,
  questStore,
} from '../quest/QuestStore';

const HUB_URL =
  import.meta.env.VITE_GAME_HUB_URL ?? 'http://localhost:5012/hubs/game';

class GameConnection {
  private connection: signalR.HubConnection;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    this.registerEvents();

    this.connection.onreconnected(async () => {
      await this.joinLobby();
    });
  }

  private registerEvents() {
    this.connection.on(
      'MyQuestsUpdated',
      (assignments: QuestAssignment[]) => {
        questStore.setAssignments(assignments);
      },
    );

    this.connection.on(
      'QuestAssignmentUpdated',
      (assignment: QuestAssignment) => {
        questStore.upsert(assignment);
      },
    );

    this.connection.on('PlayerJoined', (player) => {
      multiplayerStore.addPlayer(player);
    });

    this.connection.on('PlayerLeft', (connectionId: string) => {
      multiplayerStore.removePlayer(connectionId);
    });

    this.connection.on('PlayerMoved', (position) => {
      multiplayerStore.updatePlayerPosition(position);
    });

    this.connection.on('RoomJoined', (room) => {
      multiplayerStore.setRoom(
        room,
        this.connection.connectionId ?? null,
      );
    });

    this.connection.on('OfficeRoomClosed', (roomId: string) => {
      multiplayerStore.removeRoom(roomId);
    });
  }

  async connect() {
    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      await this.connection.start();
    }
  }

  private normalizeRole(role: PlayerRole): string {
    return String(role).replace(/\s+/g, '');
  }

  async joinLobby(displayName?: string) {
    await this.connect();

    const room = await this.connection.invoke(
      'JoinLobby',
      displayName,
    );

    multiplayerStore.setRoom(
      room,
      this.connection.connectionId ?? null,
    );
    questStore.clear();

    return room;
  }

  async createOffice(displayName: string, role: PlayerRole) {
    await this.connect();

    const room = await this.connection.invoke(
      'CreateOffice',
      displayName,
      this.normalizeRole(role),
    );

    multiplayerStore.setRoom(
      room,
      this.connection.connectionId ?? null,
    );

    await this.getMyQuests();

    return room;
  }

  async getPublicOfficeRooms() {
    await this.connect();

    return this.connection.invoke('GetPublicOfficeRooms');
  }

  async joinOffice(
    roomId: string,
    displayName: string,
    role: PlayerRole,
  ) {
    await this.connect();

    const room = await this.connection.invoke(
      'JoinOffice',
      roomId,
      displayName,
      this.normalizeRole(role),
    );

    multiplayerStore.setRoom(
      room,
      this.connection.connectionId ?? null,
    );

    await this.getMyQuests();

    return room;
  }

  async updatePosition(
    x: number,
    y: number,
    z: number,
    rotationY: number,
  ) {
    if (
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      return;
    }

    await this.connection.invoke(
      'UpdatePosition',
      x,
      y,
      z,
      rotationY,
    );
  }

  async leaveRoom() {
    if (
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      return;
    }

    await this.connection.invoke('LeaveRoom');

    multiplayerStore.clear();
    questStore.clear();
  }

  async getMyQuests(): Promise<QuestAssignment[]> {
    await this.connect();

    const assignments = await this.connection.invoke<QuestAssignment[]>(
      'GetMyQuests',
    );

    questStore.setAssignments(assignments);

    return assignments;
  }

  async acceptQuest(
    assignmentId: string,
  ): Promise<QuestActionResult> {
    const result = await this.connection.invoke<QuestActionResult>(
      'AcceptQuest',
      assignmentId,
    );

    if (result.assignment) {
      questStore.upsert(result.assignment);
    }

    return result;
  }

  async rejectQuest(
    assignmentId: string,
  ): Promise<QuestActionResult> {
    const result = await this.connection.invoke<QuestActionResult>(
      'RejectQuest',
      assignmentId,
    );

    if (result.assignment) {
      questStore.upsert(result.assignment);
    }

    return result;
  }

  async completeQuest(
    targetId: string,
  ): Promise<QuestActionResult> {
    const result = await this.connection.invoke<QuestActionResult>(
      'CompleteQuest',
      targetId,
    );

    if (result.assignment) {
      questStore.upsert(result.assignment);
    }

    return result;
  }
}

export const gameConnection = new GameConnection();