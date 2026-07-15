"use client";
// components/GameCanvas.tsx
// "Умный" компонент: здесь живёт вся логика игры — уровень, позиция собаки,
// прыжки, косточки, жизни, таймер, ловушки, прогресс и звуки.

import { useState, useEffect, useRef, useCallback } from "react";
import Dog from "./Dog";
import Platform from "./Platform";
import Bone, { BONE_COLORS } from "./Bone";
import Spike from "./Spike";
import ScoreBoard from "./ScoreBoard";
import Controls from "./Controls";
import { LEVELS, GRAVITY, JUMP_FORCE, MOVE_SPEED } from "../lib/level";
import {
  loadUnlockedLevel,
  saveUnlockedLevel,
  hasSeenIntro,
  markIntroSeen,
  loadBoneColor,
  saveBoneColor,
} from "../lib/progress";
import {
  playJumpSound,
  playBoneSound,
  playLevelCompleteSound,
  playWinGameSound,
  playLifeLostSound,
  playGameOverSound,
  unlockAudio,
} from "../lib/sound";

const START_X = 40;
const START_Y = 300;
const JUMP_KEYS = [" ", "ArrowUp", "w", "W"];
const START_LIVES = 3;

export default function GameCanvas() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [player, setPlayer] = useState({ x: START_X, y: START_Y, vy: 0, facing: 1 as 1 | -1 });
  // Защита: если в браузере вдруг сохранён индекс уровня, которого больше
  // нет — тихо откатываемся на последний существующий, без падения игры.
  const level = LEVELS[levelIndex] ?? LEVELS[LEVELS.length - 1];
  const [bones, setBones] = useState(level.bones.map((b) => ({ ...b, collected: false })));
  const [levelComplete, setLevelComplete] = useState(false);

  // Время на прохождение уровня растёт вместе со сложностью уровня.
  const timeLimit = 45 + Math.floor(levelIndex / 2) * 8;
  const [lives, setLives] = useState(START_LIVES);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameOver, setGameOver] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true); // по умолчанию считаем телефоном, пока не проверили
  const [boneColor, setBoneColor] = useState("pink");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const keysRef = useRef<Record<string, boolean>>({});
  const onGroundRef = useRef(true);
  const levelCompleteRef = useRef(false);
  const gameOverRef = useRef(false);
  const showIntroRef = useRef(false);
  const hazardHitRef = useRef(false);
  const invulnerableUntilRef = useRef(0);
  const livesRef = useRef(START_LIVES);
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Показываем приветственное окно один раз при первом запуске
  useEffect(() => {
    setShowIntro(!hasSeenIntro());
    setBoneColor(loadBoneColor());
  }, []);

  // Определяем, телефон это или ноутбук/десктоп — на телефоне оставляем
  // нарисованные кнопки управления, на ноутбуке прячем (клавиатура и так понятна)
  useEffect(() => {
    const touch =
      typeof window !== "undefined" &&
      (("ontouchstart" in window) || navigator.maxTouchPoints > 0);
    setIsTouchDevice(touch);
  }, []);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / level.width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("orientationchange", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", update);
    };
  }, [level.width]);

  useEffect(() => {
    levelCompleteRef.current = levelComplete;
  }, [levelComplete]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    showIntroRef.current = showIntro;
  }, [showIntro]);

  // На телефоне звук молчит, пока не "разбужен" прямо во время первого
  // касания экрана.
  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => {
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
    };
  }, []);

  // при первой загрузке — читаем сохранённый прогресс из localStorage
  useEffect(() => {
    const saved = Math.min(Math.max(loadUnlockedLevel(), 0), LEVELS.length - 1);
    setUnlockedLevel(saved);
    setLevelIndex(saved);
  }, []);

  // при смене уровня — сбрасываем позицию собаки, косточки, жизни и таймер
  useEffect(() => {
    const lv = LEVELS[levelIndex] ?? LEVELS[LEVELS.length - 1];
    setPlayer({ x: START_X, y: START_Y, vy: 0, facing: 1 });
    setBones(lv.bones.map((b) => ({ ...b, collected: false })));
    setLevelComplete(false);
    setGameOver(false);
    setLives(START_LIVES);
    livesRef.current = START_LIVES;
    setTimeLeft(45 + Math.floor(levelIndex / 2) * 8);
    onGroundRef.current = true;
    invulnerableUntilRef.current = performance.now() + 500;
  }, [levelIndex]);

  // Теряем жизнь: если это была последняя — конец попытки (окно game over),
  // иначе просто возвращаемся на старт уровня со свежим таймером.
  const loseLife = useCallback(() => {
    // Считаем жизни через обычную переменную (ref), а не через React state —
    // это выполняется мгновенно и синхронно, без риска, что игровой цикл
    // успеет "проскочить" ещё один кадр до того, как состояние обновится
    // (именно это раньше иногда списывало сразу 2 жизни за одно падение).
    const next = livesRef.current - 1;
    livesRef.current = next;
    invulnerableUntilRef.current = performance.now() + 900;
    if (next <= 0) {
      livesRef.current = 0;
      setLives(0);
      setGameOver(true);
      playGameOverSound();
      return;
    }
    playLifeLostSound();
    setPlayer({ x: START_X, y: START_Y, vy: 0, facing: 1 });
    setTimeLeft(timeLimit);
    onGroundRef.current = true;
    setLives(next);
  }, [timeLimit]);

  const jump = useCallback(() => {
    if (
      onGroundRef.current &&
      !levelCompleteRef.current &&
      !gameOverRef.current &&
      !showIntroRef.current
    ) {
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

  // Обратный отсчёт времени на уровень
  useEffect(() => {
    if (levelComplete || gameOver || showIntro) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          loseLife();
          return timeLimit;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [levelComplete, gameOver, showIntro, levelIndex, loseLife, timeLimit]);

  // игровой цикл — движение, физика, столкновения с шипами и падение за экран
  useEffect(() => {
    let raf: number;
    const loop = () => {
      if (!levelCompleteRef.current && !gameOverRef.current && !showIntroRef.current) {
        setPlayer((p) => {
          const keys = keysRef.current;
          const currentLevel = LEVELS[levelIndex] ?? LEVELS[LEVELS.length - 1];
          let { x, y, vy, facing } = p;
          const prevY = y;

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
            const prevBottom = prevY + 34;
            const newBottom = y + 34;
            const withinX = x + 44 > plat.x && x < plat.x + plat.w;
            // "Пролётная" проверка: если собака падает быстро, между кадрами
            // она может проскочить мимо тонкой платформы — проверяем, не
            // пересекла ли она полосу платформы за этот кадр целиком,
            // а не только текущую (снэпшот) позицию.
            if (withinX && vy >= 0 && prevBottom <= plat.y + 16 && newBottom >= plat.y) {
              y = plat.y - 34;
              vy = 0;
              landed = true;
            }
          }
          onGroundRef.current = landed;

          x = Math.max(0, Math.min(x, currentLevel.width - 44));

          // падение за нижний край или касание шипов — теряем жизнь
          // (пропускаем проверку, пока действует короткая неуязвимость после
          // предыдущего сброса позиции — иначе одно падение могло списать
          // сразу несколько жизней подряд)
          let hazard = false;
          if (performance.now() >= invulnerableUntilRef.current) {
            hazard = y > currentLevel.height + 100;
            if (!hazard && currentLevel.spikes) {
              for (const sp of currentLevel.spikes) {
                const dogBottom = y + 34;
                if (x + 44 > sp.x && x < sp.x + sp.w && dogBottom > sp.y && y < sp.y + sp.h) {
                  hazard = true;
                  break;
                }
              }
            }
          }
          if (hazard) {
            hazardHitRef.current = true;
            return p; // не двигаем в этот кадр — позицию сбросит loseLife()
          }

          return { x, y, vy, facing };
        });

        if (hazardHitRef.current) {
          hazardHitRef.current = false;
          loseLife();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [levelIndex, loseLife]);

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
    setGameOver(false);
    setLives(START_LIVES);
    livesRef.current = START_LIVES;
    setTimeLeft(timeLimit);
    onGroundRef.current = true;
    invulnerableUntilRef.current = performance.now() + 500;
  };
  const restartGame = () => setLevelIndex(0);
  const resetProgress = () => {
    saveUnlockedLevel(0);
    setUnlockedLevel(0);
    setLevelIndex(0);
  };
  const dismissIntro = () => {
    markIntroSeen();
    setShowIntro(false);
  };
  const selectBoneColor = (key: string) => {
    setBoneColor(key);
    saveBoneColor(key);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
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

      {/* Жизни и таймер */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontFamily: "system-ui, sans-serif",
          fontSize: 18,
        }}
      >
        <div>
          {Array.from({ length: START_LIVES }).map((_, i) => (
            <span key={i}>{i < lives ? "❤️" : "🖤"}</span>
          ))}
        </div>
        <div style={{ color: timeLeft <= 10 ? "#B0413E" : "#5A3A22", fontWeight: 700 }}>
          ⏱ {timeLeft}с
        </div>
      </div>

      {/* Выбор уровня — открыты только пройденные + следующий */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 560 }}>
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
                fontSize: 12,
                fontWeight: 600,
                cursor: isUnlocked ? "pointer" : "not-allowed",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {isUnlocked ? i + 1 : "🔒"}
            </button>
          );
        })}
      </div>

      <div
        ref={outerRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1300,
          aspectRatio: `${level.width} / ${level.height}`,
          margin: "0 auto",
          borderRadius: 16,
          overflow: "hidden",
          border: "3px solid #8B5E3C",
          background: "linear-gradient(180deg, #F4E9D8 0%, #E8D3B0 100%)",
          touchAction: "none",
        }}
      >
        <div
          tabIndex={0}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: level.width,
            height: level.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            outline: "none",
          }}
        >
          <ScoreBoard score={score} total={bones.length} />
          {level.platforms.map((p, i) => (
            <Platform key={i} {...p} />
          ))}
          {(level.spikes ?? []).map((s, i) => (
            <Spike key={i} {...s} />
          ))}
          {bones.map((b, i) => (
            <Bone key={i} {...b} colorKey={boneColor} />
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
                  <div style={{ fontSize: 15 }}>Собака собрала все косточки на всех {LEVELS.length} уровнях</div>
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

          {gameOver && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(58,38,22,0.9)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                color: "#F4E9D8",
                fontFamily: "system-ui, sans-serif",
                textAlign: "center",
                padding: 16,
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 700 }}>😢 Жизни закончились</div>
              <div style={{ fontSize: 15, maxWidth: 360 }}>
                Уровень {levelIndex + 1} пока не пройден — но можно попробовать ещё раз со свежими
                тремя жизнями!
              </div>
              <button onClick={restartLevel} style={btnStyle}>
                Попробовать снова
              </button>
            </div>
          )}
        </div>
      </div>

      {isTouchDevice && (
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
      )}
      {!isTouchDevice && (
        <button onClick={restartLevel} style={{ ...btnStyle, padding: "10px 16px", fontSize: 14 }}>
          ↺ Начать уровень заново
        </button>
      )}

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

      <button
        onClick={() => setShowColorPicker((v) => !v)}
        style={{
          background: "none",
          border: "none",
          color: "#A8824F",
          fontSize: 12,
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        🎨 Сменить цвет косточек
      </button>

      {showColorPicker && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {BONE_COLORS.map((c) => (
            <button
              key={c.key}
              onClick={() => selectBoneColor(c.key)}
              title={c.label}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: c.fill,
                border: boneColor === c.key ? "3px solid #3A2616" : `2px solid ${c.border}`,
                cursor: "pointer",
                touchAction: "manipulation",
              }}
            />
          ))}
        </div>
      )}

      <p style={{ color: "#8B5E3C", fontSize: 13, textAlign: "center", maxWidth: 500 }}>
        {isTouchDevice
          ? "Стрелки / A,D — движение, пробел или ↑ — прыжок."
          : "Управление: стрелки или A/D — движение, пробел или ↑ — прыжок."}{" "}
        Собери все косточки, избегай шипов и уложись в таймер! Прогресс сохраняется автоматически.
      </p>

      {showIntro && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(58,38,22,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#F4E9D8",
              borderRadius: 16,
              padding: 28,
              maxWidth: 420,
              textAlign: "center",
              color: "#3A2616",
              fontFamily: "system-ui, sans-serif",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700 }}>🐕 Платформер с собакой</div>
            <div style={{ fontSize: 15, lineHeight: 1.5 }}>
              У тебя есть <b>3 жизни ❤️❤️❤️</b> на каждую попытку прохождения уровня.
              <br />
              На уровень даётся ограниченное <b>время ⏱</b> — успей собрать все косточки!
              <br />
              Берегись <b>шипов</b> — их касание стоит жизни.
              <br />
              {isTouchDevice
                ? "Управляй кнопками внизу экрана."
                : "Управляй стрелками (или A/D) и пробелом для прыжка."}
            </div>
            <div>
              <div style={{ fontSize: 14, marginBottom: 8, fontWeight: 600 }}>
                🎨 Выбери цвет косточек:
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {BONE_COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => selectBoneColor(c.key)}
                    title={c.label}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: c.fill,
                      border: boneColor === c.key ? "3px solid #3A2616" : `2px solid ${c.border}`,
                      cursor: "pointer",
                      touchAction: "manipulation",
                    }}
                  />
                ))}
              </div>
            </div>
            <button onClick={dismissIntro} style={{ ...btnStyle, alignSelf: "center" }}>
              Начать игру!
            </button>
          </div>
        </div>
      )}
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
  touchAction: "manipulation",
  WebkitTapHighlightColor: "transparent",
};
