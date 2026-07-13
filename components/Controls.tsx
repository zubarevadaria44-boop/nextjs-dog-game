"use client";
// components/Controls.tsx
// Кнопки для телефона. "use client" — потому что реагируют на нажатия.

type ControlsProps = {
  onLeftDown: () => void;
  onLeftUp: () => void;
  onRightDown: () => void;
  onRightUp: () => void;
  onJump: () => void;
};

const btnStyle: React.CSSProperties = {
  padding: "10px 20px",
  fontSize: 18,
  borderRadius: 10,
  border: "2px solid #8B5E3C",
  background: "#C9A876",
  color: "#3A2616",
  cursor: "pointer",
  userSelect: "none",
};

export default function Controls({
  onLeftDown,
  onLeftUp,
  onRightDown,
  onRightUp,
  onJump,
}: ControlsProps) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button
        onTouchStart={onLeftDown}
        onTouchEnd={onLeftUp}
        onMouseDown={onLeftDown}
        onMouseUp={onLeftUp}
        style={btnStyle}
      >
        ◀
      </button>
      <button onClick={onJump} style={btnStyle}>
        ⬆ прыжок
      </button>
      <button
        onTouchStart={onRightDown}
        onTouchEnd={onRightUp}
        onMouseDown={onRightDown}
        onMouseUp={onRightUp}
        style={btnStyle}
      >
        ▶
      </button>
    </div>
  );
}
