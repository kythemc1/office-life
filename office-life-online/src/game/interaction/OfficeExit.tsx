
import { useState } from 'react';
import { Html } from '@react-three/drei';

import { gameConnection } from '../network/GameConnection';
import { worldStore } from '../session/WorldStore';

export function OfficeExit() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leaveOffice = async () => {
    if (isLeaving) return;

    setIsLeaving(true);
    setError(null);

    try {
      await gameConnection.leaveRoom();

      worldStore.enterLobby();
    } catch (err) {
      console.error('[Game] Cannot leave Office:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Không thể rời Office Room.',
      );
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <Html fullscreen>
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          pointerEvents: 'auto',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <button
          onClick={() => void leaveOffice()}
          disabled={isLeaving}
          style={{
            padding: '12px 18px',
            border: 'none',
            borderRadius: 8,
            background: '#20242d',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 600,
            cursor: isLeaving ? 'wait' : 'pointer',
            opacity: isLeaving ? 0.6 : 1,
          }}
        >
          {isLeaving ? 'Đang rời Office...' : '← Leave Office'}
        </button>

        {error && (
          <div
            style={{
              marginTop: 8,
              padding: 10,
              borderRadius: 6,
              background: '#7f1d1d',
              color: '#fecaca',
              fontSize: 12,
              maxWidth: 260,
            }}
          >
            {error}
          </div>
        )}
      </div>
    </Html>
  );
}
