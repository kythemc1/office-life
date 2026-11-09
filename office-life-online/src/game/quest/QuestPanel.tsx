import { useSyncExternalStore } from 'react';

import { questStore } from './QuestStore';
import type { QuestAssignment } from './QuestStore';
import { multiplayerStore } from '../network/MultiplayerStore';

interface QuestPanelProps {
  onAccept: (assignmentId: string) => void;
  onReject: (assignmentId: string) => void;
}

function getRemainingSeconds(deadlineAt: string | null) {
  if (!deadlineAt) return null;

  return Math.max(
    0,
    Math.ceil(
      (new Date(deadlineAt).getTime() - Date.now()) / 1000,
    ),
  );
}

function getLocalParticipant(
  assignment: QuestAssignment,
  localConnectionId: string | null,
) {
  if (!localConnectionId) {
    return undefined;
  }

  return assignment.participants.find(
    participant => participant.connectionId === localConnectionId,
  );
}

export function QuestPanel({
  onAccept,
  onReject,
}: QuestPanelProps) {
  const assignments = useSyncExternalStore(
    questStore.subscribe,
    questStore.getSnapshot,
    questStore.getSnapshot,
  );

  const localConnectionId = useSyncExternalStore(
    multiplayerStore.subscribe,
    multiplayerStore.getLocalConnectionId,
    multiplayerStore.getLocalConnectionId,
  );

  if (assignments.length === 0) {
    return (
      <div className="quest-panel">
        <h3>Nhiệm vụ</h3>
        <p>Hiện tại bạn chưa có nhiệm vụ.</p>
      </div>
    );
  }

  return (
    <div className="quest-panel">
      <h3>Nhiệm vụ</h3>

      {assignments.map(assignment => {
        const participant = getLocalParticipant(
          assignment,
          localConnectionId,
        );

        if (!participant) {
          return null;
        }

        const remaining = getRemainingSeconds(
          participant.deadlineAt,
        );

        return (
          <div
            className="quest-item"
            key={assignment.assignmentId}
          >
            <div className="quest-item-header">
              <strong>{assignment.quest.title}</strong>
              <span>{participant.status}</span>
            </div>

            <p>{assignment.quest.description}</p>

            {participant.status === 'Pending' && (
              <div className="quest-actions">
                <button
                  onClick={() => onAccept(assignment.assignmentId)}
                >
                  Nhận nhiệm vụ
                </button>

                <button
                  onClick={() => onReject(assignment.assignmentId)}
                >
                  Từ chối
                </button>
              </div>
            )}

            {participant.status === 'Accepted' && (
              <div className="quest-deadline">
                Thời gian còn lại: {remaining ?? '--'} giây
              </div>
            )}

            {participant.status === 'Completed' && (
              <div className="quest-success">
                Đã hoàn thành
              </div>
            )}

            {participant.status === 'Rejected' && (
              <div className="quest-rejected">
                Đã từ chối
              </div>
            )}

            {participant.status === 'Failed' && (
              <div className="quest-failed">
                Thất bại
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}