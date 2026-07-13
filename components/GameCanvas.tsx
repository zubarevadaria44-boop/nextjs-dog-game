"use client";
// components/GameCanvas.tsx
// "Умный" компонент: здесь живёт состояние игры — какой уровень,
// позиция собаки, прыжки, косточки, сохранённый прогресс и звуки.

import { useState, useEffect, useRef, useCallback } from "react";
import Dog from "./Dog";
import Platform from "./Platform";
import Bone from "./Bone";
import ScoreBoard from "./ScoreBoard";
import Controls from "./Controls";
import { LEVELS, GRAVITY, JUMP_FORCE, MOVE_SPEED } from "../lib/level";
import { loadUnlockedLevel, saveUnlockedLevel } from "../lib/progress";
import { playJumpSound, playBoneSound, playLevelCompleteSound, playWinGameSound } from "../lib/sound";

const START_X = 40;
const START_Y = 300;
const JUMP_KEYS = [" ", "ArrowUp", "w", "W"];

export default function GameCanvas() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [player, setPlayer] = useState({ x: START_X, y: START_Y, vy: 0, facing: 1 as 1 | -1 });
  const level = LEVELS[levelIndex];
  const [bones, setBones] = useState(level.bones.map((b) => ({ ...b, collected: false })));
  const [levelComplete, setLevelComplete] = useState(false);
  const keysRef = useRef<Record<string, boolean>>({});
  const onGroundRef = useRef(true);
  const levelCompleteRef = useRef(false);

  // при первой загрузке — читаем сохранённый прогресс из localStorage
  useEffect(() => {
    const saved = loadUnlockedLevel();
    setUnlockedLevel(saved);
    setLevelIndex(saved);
  }, []);

  useEffect(() => {
    levelCompleteRef.current = levelComplete;
  }, [levelComplete]);

  // при смене уровня — сбрасываем позицию собаки и косточки
  useEffect(() => {
    setPlayer({ x: START_X, y: START_Y, vy: 0, facing: 1 });
    setBones(LEVELS[levelIndex].bones.map((b) => ({ ...b, collected: false })));
    setLevelComplete(false);
    onGroundRef.current = true;
  }, [levelIndex]);

  const jump = useCallback(() => {
    if (onGroundRef.current && !levelCompleteRef.current) {
      onGroundRef.current = false;
      setPlayer((p) => ({ ...p, vy: JUMP_FORCE }));
      playJumpSound();
    }
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (JUMP_KEYS.includes(e.key)) {
        e.preventDefault();
        if (!e.repeat) jump();
      }
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [jump]);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      if (!levelCompleteRef.current) {
        setPlayer((p) => {
          const keys = keysRef.current;
          const currentLevel = LEVELS[levelIndex];
          let { x, y, vy, facing } = p;

          if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
            x -= MOVE_SPEED;
            facing = -1;
          }
          if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
            x += MOVE_SPEED;
            facing = 1;
          }

          vy += GRAVITY;
          y += vy;

          let landed = false;
          for (const plat of currentLevel.platforms) {
            const dogBottom = y + 34;
            const withinX = x + 44 > plat.x && x < plat.x + plat.w;
            if (withinX && dogBottom >= plat.y && dogBottom <= plat.y + 16 && vy >= 0) {
              y = plat.y - 34;
              vy = 0;
              landed = true;
            }
          }
          onGroundRef.current = landed;

          x = Math.max(0, Math.min(x, currentLevel.width - 44));
          if (y > currentLevel.height + 100) {
            x = START_X;
            y = START_Y;
            vy = 0;
          }

          return { x, y, vy, facing };
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [levelIndex]);

  // сбор косточек + звук + завершение уровня + сохранение прогресса
  useEffect(() => {
    setBones((prev) => {
      let justCollected = false;
      const updated = prev.map((b) => {
        if (b.collected) return b;
        const dx = Math.abs(player.x + 22 - (b.x + 11));
        const dy = Math.abs(player.y + 17 - (b.y + 11));
        if (dx < 26 && dy < 26) {
          justCollected = true;
          return { ...b, collected: true };
        }
        return b;
      });

      if (justCollected) playBoneSound();

      if (updated.every((b) => b.collected) && !levelCompleteRef.current) {
        setLevelComplete(true);
        const isLast = levelIndex === LEVELS.length - 1;
        if (isLast) {
          playWinGameSound();
        } else {
          playLevelCompleteSound();
        }
        setUnlockedLevel((prevUnlocked) => {
          const next = Math.min(levelIndex + 1, LEVELS.length - 1);
          const updatedUnlocked = Math.max(prevUnlocked, next);
          saveUnlockedLevel(updatedUnlocked);
          return updatedUnlocked;
        });
      }
      return updated;
    });
  }, [player.x, player.y, levelIndex]);

  const score = bones.filter((b) => b.collected).length;
  const setKey = (key: string, value: boolean) => (keysRef.current[key] = value);
  const isLastLevel = levelIndex === LEVELS.length - 1;

  const goNextLevel = () => {
    if (!isLastLevel) setLevelIndex((i) => i + 1);
  };
  const restartLevel = () => {
    setPlayer({ x: START_X, y: START_Y, vy: 0, facing: 1 });
    setBones(level.bones.map((b) => ({ ...b, collected: false })));
    setLevelComplete(false);
    onGroundRef.current = true;
  };
  const restartGame = () => setLevelIndex(0);
  const resetProgress = () => {
    saveUnlockedLevel(0);
    setUnlockedLevel(0);
    setLevelIndex(0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#8B5E3C",
          color: "#F4E9D8",
          padding: "6px 16px",
          borderRadius: 10,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
        }}
      >
        Уровень {levelIndex + 1} / {LEVELS.length}
      </div>

      {/* Выбор уровня — открыты только пройденные + следующий */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 500 }}>
        {LEVELS.map((_, i) => {
          const isUnlocked = i <= unlockedLevel;
          const isCurrent = i === levelIndex;
          return (
            <button
              key={i}
              disabled={!isUnlocked}
              onClick={() => setLevelIndex(i)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: isCurrent ? "2px solid #5A3A22" : "1px solid #C9A876",
                background: isUnlocked ? (isCurrent ? "#8B5E3C" : "#E8D3B0") : "#DDD3C4",
                color: isUnlocked ? (isCurrent ? "#F4E9D8" : "#5A3A22") : "#A8A196",
                fontSize: 13,
                fontWeight: 600,
                cursor: isUnlocked ? "pointer" : "not-allowed",
              }}
            >
              {isUnlocked ? i + 1 : "🔒"}
            </button>
          );
        })}
      </div>

      <div
        tabIndex={0}
        style={{
          position: "relative",
          width: level.width,
          height: level.height,
          maxWidth: "100%",
          background: "linear-gradient(180deg, #F4E9D8 0%, #E8D3B0 100%)",
          borderRadius: 16,
          overflow: "hidden",
          border: "3px solid #8B5E3C",
          outline: "none",
        }}
      >
        <ScoreBoard score={score} total={bones.length} />
        {level.platforms.map((p, i) => (
          <Platform key={i} {...p} />
        ))}
        {bones.map((b, i) => (
          <Bone key={i} {...b} />
        ))}
        <Dog x={player.x} y={player.y} facing={player.facing} isJumping={!onGroundRef.current} />

        {levelComplete && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(58,38,22,0.85)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              color: "#F4E9D8",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {isLastLevel ? (
              <>
                <div style={{ fontSize: 28, fontWeight: 700 }}>🏆 Игра пройдена!</div>
                <div style={{ fontSize: 15 }}>Собака собрала все косточки на всех 10 уровнях</div>
                <button onClick={restartGame} style={btnStyle}>
                  Начать заново
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 24, fontWeight: 700 }}>
                  🦴 Уровень {levelIndex + 1} пройден!
                </div>
                <button onClick={goNextLevel} style={btnStyle}>
                  Следующий уровень →
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Controls
          onLeftDown={() => setKey("ArrowLeft", true)}
          onLeftUp={() => setKey("ArrowLeft", false)}
          onRightDown={() => setKey("ArrowRight", true)}
          onRightUp={() => setKey("ArrowRight", false)}
          onJump={jump}
        />
        <button onClick={restartLevel} style={{ ...btnStyle, padding: "10px 16px", fontSize: 14 }}>
          ↺ Заново
        </button>
      </div>

      <button
        onClick={resetProgress}
        style={{
          background: "none",
          border: "none",
          color: "#A8824F",
          fontSize: 12,
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        Сбросить весь прогресс
      </button>

      <p style={{ color: "#8B5E3C", fontSize: 13, textAlign: "center", maxWidth: 500 }}>
        Стрелки / A,D — движение, пробел или ↑ — прыжок. Собери все косточки, чтобы открыть
        следующий уровень! Прогресс сохраняется автоматически.
      </p>
    </div>
  );
}

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
