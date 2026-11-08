
export type PlayerRole = 'Employee' | 'Team Leader' | 'Director';

interface PlayerSessionState {
  role: PlayerRole | null;
}

class PlayerSession {
  private state: PlayerSessionState = {
    role: null,
  };

  setRole(role: PlayerRole): void {
    this.state.role = role;
  }

  getRole(): PlayerRole | null {
    return this.state.role;
  }

  clear(): void {
    this.state.role = null;
  }
}

export const playerSession = new PlayerSession();
