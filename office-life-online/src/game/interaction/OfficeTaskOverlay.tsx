import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  MouseEvent as ReactMouseEvent,
} from 'react';
import { interactionRuntime } from './InteractionRuntime';

interface OfficeTask {
  id: string;
  title: string;
  description: string;
}

interface OfficeTaskEvent extends CustomEvent<OfficeTask> {}

const TASK_DURATION = 5000;
const OPEN_TASK_EVENT = 'office-task-open';

export function OfficeTaskOverlay() {
  const [task, setTask] = useState<OfficeTask | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'ready' | 'running' | 'completed'>('ready');

  const startedAtRef = useRef(0);

  const closeTask = useCallback(() => {
    interactionRuntime.setTaskOverlayOpen(false);
    setTask(null);
    setProgress(0);
    setStatus('ready');
  }, []);

  useEffect(() => {
    const handleOpenTask = (event: Event) => {
      const customEvent = event as OfficeTaskEvent;

      interactionRuntime.setTaskOverlayOpen(true);
      setTask(customEvent.detail);
      setProgress(0);
      setStatus('ready');
    };

    window.addEventListener(OPEN_TASK_EVENT, handleOpenTask);

    return () => {
      window.removeEventListener(OPEN_TASK_EVENT, handleOpenTask);
      interactionRuntime.setTaskOverlayOpen(false);
    };
  }, []);

  useEffect(() => {
    if (!task) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        event.preventDefault();
        closeTask();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [task, closeTask]);

  useEffect(() => {
    if (status !== 'running') return;

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      const nextProgress = Math.min((elapsed / TASK_DURATION) * 100, 100);

      setProgress(nextProgress);

      if (nextProgress >= 100) {
        window.clearInterval(intervalId);
        setStatus('completed');
      }
    }, 50);

    return () => window.clearInterval(intervalId);
  }, [status]);

  const startTask = () => {
    if (status !== 'ready') return;

    startedAtRef.current = Date.now();
    setProgress(0);
    setStatus('running');
  };

  const stopPointerPropagation = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
  };

  const stopClickPropagation = (
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
  };

  if (!task) return null;

  const remainingSeconds = Math.max(
    0,
    Math.ceil((TASK_DURATION * (100 - progress)) / 1000),
  );

  const buttonStyle = (background: string): CSSProperties => ({
    width: '100%',
    marginTop: 24,
    padding: 12,
    border: 0,
    borderRadius: 8,
    background,
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    pointerEvents: 'auto',
    position: 'relative',
    zIndex: 1,
  });

  return createPortal(
    <div
      onPointerDownCapture={stopPointerPropagation}
      onClick={stopClickPropagation}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        pointerEvents: 'auto',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box',
        isolation: 'isolate',
      }}
    >
      <div
        onPointerDownCapture={stopPointerPropagation}
        onClick={stopClickPropagation}
        style={{
          position: 'relative',
          width: 360,
          maxWidth: 'calc(100vw - 32px)',
          padding: 24,
          borderRadius: 14,
          background: '#1f2937',
          color: '#fff',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 21 }}>
            {task.title}
          </h2>

          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              closeTask();
            }}
            style={{
              border: 0,
              background: 'transparent',
              color: '#9ca3af',
              fontSize: 24,
              cursor: 'pointer',
              pointerEvents: 'auto',
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        <p style={{ color: '#d1d5db', fontSize: 14 }}>
          {status === 'completed'
            ? 'Hoàn thành nhiệm vụ!'
            : task.description}
        </p>

        <div
          style={{
            height: 12,
            marginTop: 24,
            overflow: 'hidden',
            borderRadius: 8,
            background: '#374151',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 8,
              background: status === 'completed' ? '#22c55e' : '#3b82f6',
              transition: 'width 50ms linear',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
            color: '#9ca3af',
            fontSize: 13,
            pointerEvents: 'none',
          }}
        >
          <span>{Math.floor(progress)}%</span>

          <span>
            {status === 'completed'
              ? 'Đã hoàn thành'
              : status === 'running'
                ? `Còn ${remainingSeconds}s`
                : 'Thời gian: 5 giây'}
          </span>
        </div>

        {status === 'ready' && (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              startTask();
            }}
            style={buttonStyle('#2563eb')}
          >
            Bắt đầu
          </button>
        )}

        {status === 'running' && (
          <button
            type="button"
            disabled
            style={{
              ...buttonStyle('#4b5563'),
              cursor: 'not-allowed',
            }}
          >
            Đang thực hiện...
          </button>
        )}

        {status === 'completed' && (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              closeTask();
            }}
            style={buttonStyle('#16a34a')}
          >
            Đóng
          </button>
        )}

        <p
          style={{
            margin: '16px 0 0',
            color: '#6b7280',
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          Nhấn ESC để đóng
        </p>
      </div>
    </div>,
    document.body,
  );
}