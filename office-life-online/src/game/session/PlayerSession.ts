
export type PlayerRole = 'Employee' | 'Team Leader' | 'Director';

export type PlayerRoomType = 'SharedLobby' | 'Office';

export interface PlayerRoom {
  roomId: string;
  name: string;
  type: PlayerRoomType;
  playerCount: number;
}

interface PlayerSessionState {
  role: PlayerRole | null;
  room: PlayerRoom | null;
}

class PlayerSession {
  private state: PlayerSessionState = {
    role: null,
    room: null,
  };

  setRole(role: PlayerRole): void {
    this.state.role = role;
  }

  getRole(): PlayerRole | null {
    return this.state.role;
  }

  setRoom(room: PlayerRoom): void {
    this.state.room = room;
  }

  getRoom(): PlayerRoom | null {
    return this.state.room;
  }

  clear(): void {
    this.state.role = null;
    this.state.room = null;
  }
}

export const playerSession = new PlayerSession();
