import { RigidBody, CuboidCollider } from '@react-three/rapier';

export function Ground() {
  return (
    <>
      {/* Ground visual */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#6b9b54" />
      </mesh>

      {/* Ground collider */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[50, 0.1, 50]}
          position={[0, -0.1, 0]}
        />
      </RigidBody>
    </>
  );
}