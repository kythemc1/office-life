
import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Html } from '@react-three/drei';

import { InteractionTarget } from './InteractionTarget';
import { playerSession, type PlayerRole } from '../session/PlayerSession';

type ElevatorScreen = 'main' | 'create' | 'join' | 'role' | 'ready';

const ELEVATOR_POSITION: [number, number, number] = [2, 0, 0];

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

export function ElevatorInteraction() {
  const [isOpen, setIsOpen] = useState(false);
  const [screen, setScreen] = useState<ElevatorScreen>('main');
  const [selectedRole, setSelectedRole] = useState<PlayerRole | null>(null);

  const openElevator = useCallback(() => {
    setScreen('main');
    setSelectedRole(null);
    setIsOpen(true);
  }, []);

  const closeElevator = useCallback(() => {
    setIsOpen(false);
    setScreen('main');
    setSelectedRole(null);
  }, []);

  const confirmRole = useCallback(() => {
    if (!selectedRole) return;

    playerSession.setRole(selectedRole);
    setScreen('ready');
  }, [selectedRole]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeElevator();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeElevator]);

  return (
    <>
      <InteractionTarget
        id="shared-lobby-elevator"
        label="Mở thang máy"
        position={ELEVATOR_POSITION}
        onInteract={openElevator}
      >
        {/* Temporary elevator interaction marker */}
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

              {screen === 'main' && (
                <>
                  <p
                    style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      marginBottom: '24px',
                    }}
                  >
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
                      onClick={() => setScreen('create')}
                    >
                      <div>Create Office</div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 400,
                          marginTop: '5px',
                          opacity: 0.8,
                        }}
                      >
                        Tạo một văn phòng mới
                      </div>
                    </button>

                    <button
                      style={secondaryButtonStyle}
                      onClick={() => setScreen('join')}
                    >
                      <div>Join Office</div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 400,
                          marginTop: '5px',
                          opacity: 0.8,
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
                    Bạn đã chọn tạo một Office Room mới.
                    Trước khi vào phòng, hãy chọn Role của bạn.
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
                    Role sẽ được giữ cố định trong suốt phiên chơi.
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
                      const isSelected = selectedRole === role.id;

                      return (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          style={{
                            ...secondaryButtonStyle,
                            border: isSelected
                              ? '2px solid #3b82f6'
                              : '2px solid transparent',
                            background: isSelected
                              ? '#263d60'
                              : '#343a46',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span>{role.title}</span>
                            {isSelected && (
                              <span style={{ color: '#60a5fa' }}>✓</span>
                            )}
                          </div>

                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 400,
                              marginTop: '6px',
                              opacity: 0.8,
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
                      opacity: selectedRole ? 1 : 0.5,
                      cursor: selectedRole ? 'pointer' : 'not-allowed',
                    }}
                    disabled={!selectedRole}
                    onClick={confirmRole}
                  >
                    Xác nhận Role
                  </button>

                  <button
                    style={{
                      ...secondaryButtonStyle,
                      marginTop: '12px',
                    }}
                    onClick={() => setScreen('create')}
                  >
                    Quay lại
                  </button>
                </>
              )}

              {screen === 'join' && (
                <>
                  <h3 style={{ marginTop: 0 }}>Join Office</h3>

                  <div
                    style={{
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: '#343a46',
                      borderRadius: '9px',
                      marginBottom: '18px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#cbd5e1',
                      }}
                    >
                      Danh sách Office hiện chưa khả dụng.
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        marginTop: '8px',
                      }}
                    >
                      Sẽ được triển khai cùng hệ thống Multiplayer.
                    </div>
                  </div>

                  <button
                    style={buttonStyle}
                    onClick={() => setScreen('main')}
                  >
                    Quay lại
                  </button>
                </>
              )}

              {screen === 'ready' && (
                <>
                  <h3 style={{ marginTop: 0 }}>Role Selected</h3>

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
                    Role đã được lưu trong phiên chơi hiện tại.
                    Chức năng tạo Office Room và chuyển cảnh sẽ được
                    kết nối ở bước Multiplayer.
                  </p>

                  <button
                    style={buttonStyle}
                    onClick={closeElevator}
                  >
                    Hoàn tất
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
