// components/Bone.tsx
// Розовая косточка — нарисована из div-ов (а не эмодзи), поэтому можно
// покрасить в любой цвет.

type BoneProps = { x: number; y: number; collected: boolean };

const PINK = "#FF6FA0";
const PINK_DARK = "#E14E82";

export default function Bone({ x, y, collected }: BoneProps) {
  if (collected) return null;
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
      {/* центральная перекладина */}
      <div
        style={{
          position: "absolute",
          left: 4,
          top: 5,
          width: 18,
          height: 6,
          background: PINK,
          border: `1.5px solid ${PINK_DARK}`,
          borderRadius: 3,
        }}
      />
      {/* левый набалдашник (две шишечки) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 8,
          height: 8,
          background: PINK,
          border: `1.5px solid ${PINK_DARK}`,
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
          background: PINK,
          border: `1.5px solid ${PINK_DARK}`,
          borderRadius: "50%",
        }}
      />
      {/* правый набалдашник (две шишечки) */}
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 0,
          width: 8,
          height: 8,
          background: PINK,
          border: `1.5px solid ${PINK_DARK}`,
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
          background: PINK,
          border: `1.5px solid ${PINK_DARK}`,
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
