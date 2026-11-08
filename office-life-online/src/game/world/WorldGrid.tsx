import { Grid } from '@react-three/drei';

export function WorldGrid() {
  return (
    <Grid
      args={[100, 100]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#829b75"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#536b4b"
      fadeDistance={60}
      fadeStrength={1}
      infiniteGrid
    />
  );
}