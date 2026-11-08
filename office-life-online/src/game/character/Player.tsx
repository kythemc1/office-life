import { useGLTF } from '@react-three/drei';

const MODEL_PATH = new URL(
  '../../assets/characters/player/player.glb',
  import.meta.url
).href;

export function Player() {
  const { scene } = useGLTF(MODEL_PATH);

  return (
    <primitive
      object={scene}
      position={[0, 0, 0]}
      scale={1}
    />
  );
}

useGLTF.preload(MODEL_PATH);