import { useSyncExternalStore } from 'react';

export type QuestStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Completed'
  | 'Failed';

export type QuestScope = 'Individual' | 'Shared';

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  targetId: string;
  durationSeconds: number;
  rewardXp: number;
  penaltyXp: number;
}

export interface QuestParticipant {
  connectionId: string;
  status: QuestStatus;
  acceptedAt: string | null;
  deadlineAt: string | null;
  completedAt: string | null;
}

export interface QuestAssignment {
  assignmentId: string;
  questId: string;
  scope: QuestScope;
  source: string;
  roomId: string;
  targetConnectionId: string | null;
  assignedAt: string;
  quest: QuestDefinition;
  participants: QuestParticipant[];
}

interface QuestState {
  assignments: QuestAssignment[];
}

class QuestStore {
  private state: QuestState = { assignments: [] };
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;

  setAssignments(assignments: QuestAssignment[]) {
    this.state = { assignments };
    this.notify();
  }

  upsert(assignment: QuestAssignment) {
    const assignments = this.state.assignments.filter(
      item => item.assignmentId !== assignment.assignmentId,
    );

    this.state = { assignments: [...assignments, assignment] };
    this.notify();
  }

  clear() {
    this.state = { assignments: [] };
    this.notify();
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }
}

export const questStore = new QuestStore();

export function useQuests() {
  return useSyncExternalStore(
    questStore.subscribe,
    questStore.getSnapshot,
    questStore.getSnapshot,
  );
}