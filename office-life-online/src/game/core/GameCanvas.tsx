import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';

import { QuestPanel } from '../quest/QuestPanel';
import { QuestResultOverlay } from '../quest/QuestResultOverlay';
import { gameConnection } from '../network/GameConnection';
import { OfficeTaskOverlay } from '../interaction/OfficeTaskOverlay';
import { GameScene } from './GameScene';

export function GameCanvas() {
  const [questMessage, setQuestMessage] = useState<string | null>(null);

  const handleAcceptQuest = async (assignmentId: string) => {
    try {
      const result = await gameConnection.acceptQuest(assignmentId);
      setQuestMessage(result.message);
    } catch (error) {
      console.error('[Quest] Accept failed:', error);
      setQuestMessage('Không thể nhận nhiệm vụ.');
    }
  };

  const handleRejectQuest = async (assignmentId: string) => {
    try {
      const result = await gameConnection.rejectQuest(assignmentId);
      setQuestMessage(result.message);
    } catch (error) {
      console.error('[Quest] Reject failed:', error);
      setQuestMessage('Không thể từ chối nhiệm vụ.');
    }
  };

  return (
    <div className="game-container">
      <Canvas
        className="game-canvas"
        shadows
        camera={{
          position: [0, 3, 6],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true }}
      >
        <Physics gravity={[0, -9.81, 0]}>
          <GameScene />
        </Physics>
      </Canvas>

      <div className="game-ui">
        <QuestPanel
          onAccept={handleAcceptQuest}
          onReject={handleRejectQuest}
        />

        <QuestResultOverlay
          message={questMessage}
          onClose={() => setQuestMessage(null)}
        />
      </div>

      <OfficeTaskOverlay />
    </div>
  );
}