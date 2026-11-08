import { RigidBody, CuboidCollider } from '@react-three/rapier';

interface PhysicsBoxProps {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}

function PhysicsBox({
  position,
  size,
  color = '#777777',
}: PhysicsBoxProps) {
  const [width, height, depth] = size;

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider
        args={[width / 2, height / 2, depth / 2]}
        position={[0, height / 2, 0]}
      />

      <mesh
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

export function PhysicsObjects() {
  return (
    <>
      {/* Wall in front of player */}
      <PhysicsBox
        position={[-3, 0, -4]}
        size={[6, 2.5, 0.3]}
        color="#9b8b79"
      />

      {/* Obstacle on the right */}
      <PhysicsBox
        position={[3, 0, -2]}
        size={[2, 2, 2]}
        color="#a17c55"
      />

      {/* Small obstacle */}
      <PhysicsBox
        position={[-3, 0, 3]}
        size={[2, 1.5, 2]}
        color="#8c8c8c"
      />
    </>
  );
}