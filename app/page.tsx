// app/page.tsx
// Это страница site.com/ — главная. Сама по себе она "серверный"
// компонент (без "use client"), но внутри спокойно используем
// клиентский GameCanvas — так тоже можно.

import GameCanvas from "../components/GameCanvas";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F4E9D8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        gap: 16,
      }}
    >
      <h1 style={{ color: "#5A3A22", fontSize: 20, margin: 0 }}>
        🐕 Платформер с собакой
      </h1>
      <GameCanvas />
    </main>
  );
}
