import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Mesh } from 'three';

const MAP_PATH = new URL(
  '../../assets/environments/shared-lobby.glb',
  import.meta.url,
).href;

export function SharedLobby() {
  const { scene } = useGLTF(MAP_PATH);

  const map = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    map.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [map]);

  return (
    <primitive
      object={map}
      dispose={null}
    />
  );
}

useGLTF.preload(MAP_PATH);