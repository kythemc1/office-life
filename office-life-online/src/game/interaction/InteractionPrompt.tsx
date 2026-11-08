import { Html } from '@react-three/drei';

interface InteractionPromptProps {
  label: string;
  position: [number, number, number];
}

export function InteractionPrompt({
  label,
  position,
}: InteractionPromptProps) {
  return (
    <Html
      position={position}
      center
      distanceFactor={10}
      zIndexRange={[100, 0]}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(20, 20, 20, 0.85)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '6px',
          color: '#fff',
          whiteSpace: 'nowrap',
          fontSize: '13px',
          fontFamily: 'Arial, sans-serif',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            background: '#fff',
            color: '#111',
            borderRadius: '4px',
            padding: '3px 7px',
            fontWeight: 700,
          }}
        >
          E
        </span>

        <span>{label}</span>
      </div>
    </Html>
  );
}