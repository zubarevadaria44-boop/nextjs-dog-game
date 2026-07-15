// components/Bone.tsx
// Косточка — нарисована из div-ов, поэтому цвет можно менять.
// BONE_COLORS — доступная палитра, используется и здесь, и в GameCanvas
// (для отображения кнопок выбора цвета).

export const BONE_COLORS = [
  { key: "pink", label: "Розовый", fill: "#FF6FA0", border: "#E14E82" },
  { key: "blue", label: "Голубой", fill: "#6FC3FF", border: "#3A8FCC" },
  { key: "yellow", label: "Жёлтый", fill: "#FFD966", border: "#D9A62E" },
  { key: "green", label: "Зелёный", fill: "#7ED957", border: "#4C9A2A" },
  { key: "purple", label: "Фиолетовый", fill: "#B67FEB", border: "#8347C2" },
  { key: "orange", label: "Оранжевый", fill: "#FF9F5A", border: "#D9722E" },
] as const;

export type BoneColorKey = (typeof BONE_COLORS)[number]["key"];

export function getBoneColor(key: string) {
  return BONE_COLORS.find((c) => c.key === key) ?? BONE_COLORS[0];
}

type BoneProps = { x: number; y: number; collected: boolean; colorKey?: string };

export default function Bone({ x, y, collected, colorKey = "pink" }: BoneProps) {
  if (collected) return null;
  const { fill, border } = getBoneColor(colorKey);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 26,
        height: 16,
        transform: "rotate(-20deg)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 4,
          top: 5,
          width: 18,
          height: 6,
          background: fill,
          border: `1.5px solid ${border}`,
          borderRadius: 3,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 8,
          height: 8,
          background: fill,
          border: `1.5px solid ${border}`,
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          width: 8,
          height: 8,
          background: fill,
          border: `1.5px solid ${border}`,
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 0,
          width: 8,
          height: 8,
          background: fill,
          border: `1.5px solid ${border}`,
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 8,
          width: 8,
          height: 8,
          background: fill,
          border: `1.5px solid ${border}`,
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
