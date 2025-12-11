import React from "react";

export function loadFavoritesFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("favorites");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
    return [];
  } catch (_) {
    return [];
  }
}

export function saveFavoritesToStorage(favorites) {
  if (typeof window === "undefined") return;
  try {
    const unique = Array.from(new Set((favorites || []).map(String)));
    window.localStorage.setItem("favorites", JSON.stringify(unique));
  } catch (_) {}
}

export function toggleFavoriteId(currentList, mangaId) {
  const idStr = String(mangaId);
  if (!idStr) return currentList || [];
  const list = Array.isArray(currentList) ? currentList.map(String) : [];
  const exists = list.includes(idStr);
  if (exists) {
    return list.filter((id) => id !== idStr);
  }
  return [...list, idStr];
}

export function isFavorite(currentList, mangaId) {
  const idStr = String(mangaId);
  if (!idStr) return false;
  const list = Array.isArray(currentList) ? currentList.map(String) : [];
  return list.includes(idStr);
}

export function useFavorites() {
  const [favorites, setFavorites] = React.useState(() => loadFavoritesFromStorage());

  React.useEffect(() => {
    setFavorites(loadFavoritesFromStorage());
  }, []);

  const toggleFavorite = React.useCallback((mangaId) => {
    setFavorites((prev) => {
      const next = toggleFavoriteId(prev, mangaId);
      saveFavoritesToStorage(next);
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}
