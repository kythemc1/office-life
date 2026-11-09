export type QuestScope = "Individual" | "Shared";
export type QuestStatus = "Pending" | "Accepted" | "Rejected" | "Completed" | "Failed";
export type QuestSource = "System" | "TeamLeader" | "Director" | "ReceptionistNpc";

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
    source: QuestSource;
    roomId: string;
    targetConnectionId: string | null;
    assignedAt: string;
    quest: QuestDefinition;
    participants: QuestParticipant[];
}

export interface QuestActionResult {
    success: boolean;
    message: string;
    assignment: QuestAssignment | null;
}

type Listener = () => void;

class QuestStore {
    private assignments = new Map<string, QuestAssignment>();
    private snapshot: QuestAssignment[] = [];
    private listeners = new Set<Listener>();

    subscribe = (listener: Listener) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = () => this.snapshot;

    setAssignments(assignments: QuestAssignment[]) {
        this.assignments.clear();
        assignments.forEach(item => this.assignments.set(item.assignmentId, item));
        this.updateSnapshot();
        this.emit();
    }

    upsert(assignment: QuestAssignment) {
        this.assignments.set(assignment.assignmentId, assignment);
        this.updateSnapshot();
        this.emit();
    }

    remove(assignmentId: string) {
        this.assignments.delete(assignmentId);
        this.updateSnapshot();
        this.emit();
    }

    clear() {
        this.assignments.clear();
        this.updateSnapshot();
        this.emit();
    }

    private updateSnapshot() {
        this.snapshot = Array.from(this.assignments.values());
    }

    private emit() {
        this.listeners.forEach(listener => listener());
    }
}

export const questStore = new QuestStore();