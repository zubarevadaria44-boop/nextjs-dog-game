// lib/progress.ts
// Сохраняем прогресс в localStorage браузера — так уровень
// не сбрасывается при обновлении страницы.

const STORAGE_KEY = "dog-platformer-progress";

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
