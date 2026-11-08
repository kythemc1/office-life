import { useCallback } from 'react';

import { InteractionTarget } from './InteractionTarget';

export function InteractionDemo() {
  const handleInteract = useCallback(() => {
    console.log('[Interaction] Test object activated!');
  }, []);

  return (
    <InteractionTarget
      id="test-interaction"
      label="Tương tác với vật thể"
      position={[2, 0, 0]}
      onInteract={handleInteract}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />

        <meshStandardMaterial color="#f59e0b" />
      </mesh>
    </InteractionTarget>
  );
}