// components/Dog.tsx
// "Глупый" компонент: получает x, y, facing и просто рисует собаку.
// Ничего не решает сам — этим занимается GameCanvas.

type DogProps = {
  x: number;
  y: number;
  facing: 1 | -1;
  isJumping: boolean;
};

export default function Dog({ x, y, facing, isJumping }: DogProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 44,
        height: 34,
        transform: `scaleX(${facing})`,
        transition: "transform 0.1s",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: 44,
          height: 24,
          background: "#8B5E3C",
          borderRadius: "14px 14px 8px 8px",
          boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: isJumping ? -6 : -2,
          left: 26,
          width: 22,
          height: 20,
          background: "#8B5E3C",
          borderRadius: "60% 60% 50% 50%",
          transition: "top 0.15s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -6,
            left: 2,
            width: 8,
            height: 12,
            background: "#6B4426",
            borderRadius: "50% 50% 0 50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 7,
            left: 15,
            width: 4,
            height: 4,
            background: "#2B1B12",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 9,
            left: 20,
            width: 5,
            height: 4,
            background: "#2B1B12",
            borderRadius: "50%",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: -8,
          width: 12,
          height: 6,
          background: "#6B4426",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
