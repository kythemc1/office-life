import { useSyncExternalStore } from 'react';
import { questStore } from './QuestStore';
import type { QuestAssignment } from './QuestStore';

interface QuestPanelProps {
  onAccept: (assignmentId: string) => void;
  onReject: (assignmentId: string) => void;
}

function getParticipant(assignment: QuestAssignment) {
  return assignment.participants[0];
}

function getRemainingSeconds(deadlineAt: string | null) {
  if (!deadlineAt) return null;
  return Math.max(0, Math.ceil((new Date(deadlineAt).getTime() - Date.now()) / 1000));
}

export function QuestPanel({ onAccept, onReject }: QuestPanelProps) {
  const assignments = useSyncExternalStore(
    questStore.subscribe,
    questStore.getSnapshot,
    questStore.getSnapshot,
  );

  if (assignments.length === 0) {
    return <div className="quest-panel"><h3>Nhiệm vụ</h3><p>Hiện tại bạn chưa có nhiệm vụ.</p></div>;
  }

  return (
    <div className="quest-panel">
      <h3>Nhiệm vụ</h3>
      {assignments.map(assignment => {
        const participant = getParticipant(assignment);
        if (!participant) return null;
        const remaining = getRemainingSeconds(participant.deadlineAt);

        return (
          <div className="quest-item" key={assignment.assignmentId}>
            <div className="quest-item-header">
              <strong>{assignment.quest.title}</strong>
              <span>{participant.status}</span>
            </div>
            <p>{assignment.quest.description}</p>
            {assignment.scope === 'Shared' && (
              <div className="quest-shared-progress">
                Tiến độ chung: {assignment.sharedCompletedCount ?? 0}/{assignment.sharedParticipantCount ?? 0}
              </div>
            )}
            {participant.status === 'Pending' && (
              <div className="quest-actions">
                <button onClick={() => onAccept(assignment.assignmentId)}>Nhận nhiệm vụ</button>
                <button onClick={() => onReject(assignment.assignmentId)}>Từ chối</button>
              </div>
            )}
            {participant.status === 'Accepted' && (
              <div className="quest-deadline">Thời gian còn lại: {remaining ?? '--'} giây</div>
            )}
            {participant.status === 'Completed' && <div className="quest-success">Đã hoàn thành</div>}
            {participant.status === 'Rejected' && <div className="quest-rejected">Đã từ chối</div>}
            {participant.status === 'Failed' && <div className="quest-failed">Thất bại</div>}
          </div>
        );
      })}
    </div>
  );
}
