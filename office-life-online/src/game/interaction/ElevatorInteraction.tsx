
import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Html } from '@react-three/drei';

import { InteractionTarget } from './InteractionTarget';
import {
  playerSession,
  type PlayerRole,
} from '../session/PlayerSession';
import {
  gameConnection,
  type RoomSnapshot,
} from '../network/GameConnection';
import { worldStore } from '../session/WorldStore';

type ElevatorScreen = 'main' | 'create' | 'join' | 'role' | 'ready';
type EntryMode = 'create' | 'join';

const ELEVATOR_POSITION: [number, number, number] = [2, 0, 0];
const DISPLAY_NAME = 'Player';

const ROLES: {
  id: PlayerRole;
  title: string;
  description: string;
}[] = [
  {
    id: 'Employee',
    title: 'Employee',
    description: 'Thực hiện công việc và hoàn thành nhiệm vụ được giao.',
  },
  {
    id: 'Team Leader',
    title: 'Team Leader',
    description: 'Quản lý nhóm và giao nhiệm vụ cho Employee.',
  },
  {
    id: 'Director',
    title: 'Director',
    description: 'Điều hành văn phòng và tạo nhiệm vụ cho mọi người.',
  },
];

const overlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.55)',
  fontFamily: 'Arial, sans-serif',
  pointerEvents: 'auto',
};

const panelStyle: CSSProperties = {
  width: 'min(460px, calc(100vw - 32px))',
  maxHeight: '85vh',
  overflowY: 'auto',
  padding: '28px',
  borderRadius: '16px',
  background: '#20242d',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
};

const buttonStyle: CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  border: 'none',
  borderRadius: '9px',
  background: '#3b82f6',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'left',
};

const secondaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: '#343a46',
};

function toPlayerRoom(room: RoomSnapshot) {
  return {
    roomId: room.roomId,
    name: room.name,
    type:
      room.type === 'Office'
        ? 'Office' as const
        : 'SharedLobby' as const,
    playerCount: room.playerCount,
  };
}

export function ElevatorInteraction() {
  const [isOpen, setIsOpen] = useState(false);
  const [screen, setScreen] = useState<ElevatorScreen>('main');
  const [entryMode, setEntryMode] = useState<EntryMode>('create');
  const [selectedRole, setSelectedRole] = useState<PlayerRole | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [officeRooms, setOfficeRooms] = useState<RoomSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Đang kết nối...');
  const [error, setError] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<RoomSnapshot | null>(null);

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      try {
        const room = await gameConnection.joinLobby(DISPLAY_NAME);

        if (!mounted) return;

        setCurrentRoom(room);
        playerSession.setRoom(toPlayerRoom(room));
        setConnectionStatus('Đã kết nối Shared Lobby');
      } catch (err) {
        console.error('[Game] Cannot connect to Lobby:', err);

        if (mounted) {
          setConnectionStatus('Chưa kết nối được Backend');
          setError(
            err instanceof Error
              ? err.message
              : 'Không thể kết nối Backend.',
          );
        }
      }
    };

    void connect();

    return () => {
      mounted = false;
    };
  }, []);

  const openElevator = useCallback(() => {
    setScreen('main');
    setSelectedRole(null);
    setSelectedRoomId(null);
    setError(null);
    setIsOpen(true);
  }, []);

  const closeElevator = useCallback(() => {
    setIsOpen(false);
    setScreen('main');
    setSelectedRole(null);
    setSelectedRoomId(null);
    setError(null);
  }, []);

  const openCreate = useCallback(() => {
    setEntryMode('create');
    setSelectedRole(null);
    setError(null);
    setScreen('create');
  }, []);

  const openJoin = useCallback(async () => {
    setEntryMode('join');
    setSelectedRole(null);
    setSelectedRoomId(null);
    setError(null);
    setIsLoading(true);
    setScreen('join');

    try {
      const rooms = await gameConnection.getPublicOfficeRooms();
      setOfficeRooms(rooms);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải danh sách Office.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmRole = useCallback(async () => {
    if (!selectedRole || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      let room: RoomSnapshot;

      if (entryMode === 'create') {
        room = await gameConnection.createOffice(
          DISPLAY_NAME,
          selectedRole,
        );
      } else {
        if (!selectedRoomId) {
          setError('Vui lòng chọn một Office Room.');
          return;
        }

        room = await gameConnection.joinOffice(
          selectedRoomId,
          DISPLAY_NAME,
          selectedRole,
        );
      }

      playerSession.setRole(selectedRole);
      playerSession.setRoom(toPlayerRoom(room));

      setCurrentRoom(room);
      setScreen('ready');
    } catch (err) {
      console.error('[Game] Office operation failed:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Không thể vào Office Room.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [entryMode, selectedRole, selectedRoomId, isLoading]);

  const enterOffice = useCallback(() => {
    if (!currentRoom) {
      setError('Không tìm thấy thông tin Office Room.');
      return;
    }

    worldStore.enterOffice(currentRoom.roomId);
    closeElevator();
  }, [currentRoom, closeElevator]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        closeElevator();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, closeElevator]);

  return (
    <>
      <InteractionTarget
        id="shared-lobby-elevator"
        label="Mở thang máy"
        position={ELEVATOR_POSITION}
        onInteract={openElevator}
      >
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[0.5, 2, 0.2]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>

        <mesh position={[0, 1.3, 0.12]}>
          <boxGeometry args={[0.18, 0.18, 0.04]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.5}
          />
        </mesh>
      </InteractionTarget>

      {isOpen && (
        <Html fullscreen>
          <div style={overlayStyle}>
            <div style={panelStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      letterSpacing: '2px',
                      marginBottom: '6px',
                    }}
                  >
                    OFFICE LIFE ONLINE
                  </div>

                  <h2 style={{ margin: 0, fontSize: '25px' }}>
                    Elevator
                  </h2>
                </div>

                <button
                  onClick={closeElevator}
                  disabled={isLoading}
                  aria-label="Close elevator"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '26px',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '16px',
                }}
              >
                {connectionStatus}
              </div>

              {error && (
                <div
                  style={{
                    padding: '12px',
                    marginBottom: '16px',
                    borderRadius: '8px',
                    background: '#7f1d1d',
                    color: '#fecaca',
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </div>
              )}

              {screen === 'main' && (
                <>
                  <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
                    Bạn muốn làm gì?
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <button
                      style={buttonStyle}
                      onClick={openCreate}
                    >
                      <div>Create Office</div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 400,
                          marginTop: '5px',
                        }}
                      >
                        Tạo một văn phòng mới
                      </div>
                    </button>

                    <button
                      style={secondaryButtonStyle}
                      onClick={() => void openJoin()}
                    >
                      <div>Join Office</div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 400,
                          marginTop: '5px',
                        }}
                      >
                        Tham gia văn phòng đang hoạt động
                      </div>
                    </button>
                  </div>
                </>
              )}

              {screen === 'create' && (
                <>
                  <h3 style={{ marginTop: 0 }}>Create Office</h3>

                  <p
                    style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }}
                  >
                    Tạo một Office Room mới. Trước khi vào phòng,
                    hãy chọn Role của bạn.
                  </p>

                  <button
                    style={buttonStyle}
                    onClick={() => setScreen('role')}
                  >
                    Tiếp tục chọn Role
                  </button>

                  <button
                    style={{
                      ...secondaryButtonStyle,
                      marginTop: '12px',
                    }}
                    onClick={() => setScreen('main')}
                  >
                    Quay lại
                  </button>
                </>
              )}

              {screen === 'join' && (
                <>
                  <h3 style={{ marginTop: 0 }}>Join Office</h3>

                  {isLoading ? (
                    <p style={{ color: '#cbd5e1' }}>
                      Đang tải danh sách Office...
                    </p>
                  ) : officeRooms.length === 0 ? (
                    <p
                      style={{
                        color: '#cbd5e1',
                        fontSize: '14px',
                      }}
                    >
                      Hiện chưa có Office Room nào đang hoạt động.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        marginBottom: '18px',
                      }}
                    >
                      {officeRooms.map((room) => {
                        const selected =
                          selectedRoomId === room.roomId;

                        return (
                          <button
                            key={room.roomId}
                            onClick={() =>
                              setSelectedRoomId(room.roomId)
                            }
                            style={{
                              ...secondaryButtonStyle,
                              border: selected
                                ? '2px solid #3b82f6'
                                : '2px solid transparent',
                              background: selected
                                ? '#263d60'
                                : '#343a46',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span>{room.name}</span>
                              <span>{selected ? '✓' : ''}</span>
                            </div>

                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: 400,
                                marginTop: '6px',
                              }}
                            >
                              {room.playerCount} người chơi
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    style={{
                      ...buttonStyle,
                      opacity: selectedRoomId ? 1 : 0.5,
                    }}
                    disabled={!selectedRoomId || isLoading}
                    onClick={() => {
                      setEntryMode('join');
                      setSelectedRole(null);
                      setScreen('role');
                    }}
                  >
                    Tiếp tục chọn Role
                  </button>

                  <button
                    style={{
                      ...secondaryButtonStyle,
                      marginTop: '12px',
                    }}
                    onClick={() => setScreen('main')}
                  >
                    Quay lại
                  </button>
                </>
              )}

              {screen === 'role' && (
                <>
                  <h3 style={{ marginTop: 0 }}>Choose Your Role</h3>

                  <p
                    style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      lineHeight: 1.5,
                    }}
                  >
                    Chọn vai trò của bạn trong Office Room.
                    Role được giữ cố định trong phiên chơi.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      marginBottom: '20px',
                    }}
                  >
                    {ROLES.map((role) => {
                      const selected = selectedRole === role.id;

                      return (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          style={{
                            ...secondaryButtonStyle,
                            border: selected
                              ? '2px solid #3b82f6'
                              : '2px solid transparent',
                            background: selected
                              ? '#263d60'
                              : '#343a46',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{role.title}</span>
                            {selected && (
                              <span style={{ color: '#60a5fa' }}>
                                ✓
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 400,
                              marginTop: '6px',
                              lineHeight: 1.5,
                            }}
                          >
                            {role.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    style={{
                      ...buttonStyle,
                      opacity: selectedRole && !isLoading ? 1 : 0.5,
                    }}
                    disabled={!selectedRole || isLoading}
                    onClick={() => void confirmRole()}
                  >
                    {isLoading
                      ? 'Đang xử lý...'
                      : 'Xác nhận và vào Office'}
                  </button>

                  <button
                    style={{
                      ...secondaryButtonStyle,
                      marginTop: '12px',
                    }}
                    disabled={isLoading}
                    onClick={() =>
                      setScreen(
                        entryMode === 'create' ? 'create' : 'join',
                      )
                    }
                  >
                    Quay lại
                  </button>
                </>
              )}

              {screen === 'ready' && (
                <>
                  <h3 style={{ marginTop: 0 }}>Office Joined</h3>

                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '9px',
                      background: '#263d60',
                      marginBottom: '18px',
                    }}
                  >
                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '12px',
                        marginBottom: '8px',
                      }}
                    >
                      OFFICE ROOM
                    </div>

                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      {currentRoom?.name}
                    </div>

                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '12px',
                        marginTop: '16px',
                      }}
                    >
                      YOUR ROLE
                    </div>

                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 700,
                      }}
                    >
                      {selectedRole}
                    </div>
                  </div>

                  <p
                    style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }}
                  >
                    Bạn đã tham gia Office Room thành công.
                    Nhấn nút bên dưới để vào văn phòng.
                  </p>

                  <button
                    style={buttonStyle}
                    onClick={enterOffice}
                  >
                    Vào Office
                  </button>
                </>
              )}

              <div
                style={{
                  marginTop: '20px',
                  fontSize: '11px',
                  color: '#64748b',
                  textAlign: 'center',
                }}
              >
                Nhấn ESC để đóng
              </div>
            </div>
          </div>
        </Html>
      )}
    </>
  );
}
