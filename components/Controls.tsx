"use client";
// components/Controls.tsx
// Кнопки для телефона и мыши. "use client" — потому что реагируют на нажатия.

type ControlsProps = {
  onLeftDown: () => void;
  onLeftUp: () => void;
  onRightDown: () => void;
  onRightUp: () => void;
  onJump: () => void;
};

const btnStyle: React.CSSProperties = {
  padding: "12px 22px",
  fontSize: 20,
  minWidth: 56,
  minHeight: 56,
  borderRadius: 12,
  border: "2px solid #8B5E3C",
  background: "#C9A876",
  color: "#3A2616",
  cursor: "pointer",
  userSelect: "none",
  // Запрещаем браузеру интерпретировать нажатие как жест прокрутки/зума —
  // без этого на телефоне палец мог случайно "утащить" страницу вместо прыжка.
  touchAction: "none",
  WebkitTapHighlightColor: "transparent",
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
        onTouchStart={(e) => {
          e.preventDefault();
          onLeftDown();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onLeftUp();
        }}
        onMouseDown={onLeftDown}
        onMouseUp={onLeftUp}
        onMouseLeave={onLeftUp}
        style={btnStyle}
      >
        ◀
      </button>
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          onJump();
        }}
        onClick={onJump}
        style={btnStyle}
      >
        ⬆ прыжок
      </button>
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          onRightDown();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onRightUp();
        }}
        onMouseDown={onRightDown}
        onMouseUp={onRightUp}
        onMouseLeave={onRightUp}
        style={btnStyle}
      >
        ▶
      </button>
    </div>
  );
}
