import { RigidBody, CuboidCollider } from '@react-three/rapier';

export function SharedLobbyColliders() {
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* Main horizontal road */}
      <CuboidCollider
        args={[50, 0.1, 6.7]}
        position={[0, -0.1, 0]}
      />

      {/* Road going north */}
      <CuboidCollider
        args={[6.7, 0.1, 20]}
        position={[0, -0.1, 10]}
      />

      {/* Office building - northwest */}
      <CuboidCollider
        args={[3.9, 9.4, 8]}
        position={[-11.5, 9.3, 34.4]}
      />

      {/* Office building - north east */}
      <CuboidCollider
        args={[3.9, 7.8, 5.4]}
        position={[10.7, 7.7, 37.2]}
      />

      {/* Building - west */}
      <CuboidCollider
        args={[4.5, 5.4, 2.9]}
        position={[-12.1, 5.4, 20.2]}
      />

      {/* Building - south */}
      <CuboidCollider
        args={[4, 4.7, 4.3]}
        position={[12.9, 4.7, -10.8]}
      />

      {/* Building - east */}
      <CuboidCollider
        args={[4.1, 5.8, 4.9]}
        position={[29.8, 5.7, 14.3]}
      />
    </RigidBody>
  );
}