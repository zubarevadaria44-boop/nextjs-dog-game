// components/ScoreBoard.tsx
type ScoreBoardProps = { score: number; total: number };

export default function ScoreBoard({ score, total }: ScoreBoardProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        background: "rgba(58,38,22,0.85)",
        color: "#F4E9D8",
        padding: "6px 14px",
        borderRadius: 10,
        fontFamily: "system-ui, sans-serif",
        fontWeight: 600,
        fontSize: 15,
      }}
    >
      🦴 {score} / {total}
    </div>
  );
}
