// lib/progress.ts
// Сохраняем прогресс в localStorage браузера — так уровень
// не сбрасывается при обновлении страницы.

const STORAGE_KEY = "dog-platformer-progress";
const INTRO_KEY = "dog-platformer-intro-seen";

export function loadUnlockedLevel(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return typeof parsed.unlockedLevel === "number" ? parsed.unlockedLevel : 0;
  } catch {
    return 0;
  }
}

export function saveUnlockedLevel(unlockedLevel: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlockedLevel }));
  } catch {
    // localStorage может быть недоступен (приватный режим и т.д.) — просто игнорируем
  }
}

// Показываем приветственное окно с объяснением жизней/таймера только один раз —
// при самом первом запуске игры в этом браузере.
export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return true;
  }
}

export function markIntroSeen() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTRO_KEY, "1");
  } catch {
    // игнорируем
  }
}
