// components/Bone.tsx
type BoneProps = { x: number; y: number; collected: boolean };

export default function Bone({ x, y, collected }: BoneProps) {
  if (collected) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, fontSize: 22 }}>
      🦴
    </div>
  );
}
