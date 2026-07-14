// components/Spike.tsx
// Полоса шипов — ловушка. Если собака её коснётся, теряется жизнь.
// Рисуется как повторяющийся зубчатый узор.

type SpikeProps = { x: number; y: number; w: number; h: number };

export default function Spike({ x, y, w, h }: SpikeProps) {
  const toothWidth = 18;
  const teeth = Math.max(1, Math.floor(w / toothWidth));

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        display: "flex",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: teeth }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 0,
            height: 0,
            borderLeft: `${toothWidth / 2}px solid transparent`,
            borderRight: `${toothWidth / 2}px solid transparent`,
            borderBottom: `${h}px solid #B0413E`,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}
