import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CategoryContext = createContext();

export const CATEGORY_KEYS = ["all", "manga", "manhwa", "manhua"];

function deriveCategoryFromPath(pathname) {
  const match = pathname.match(/^\/category\/(manga|manhwa|manhua)/i);
  if (match) return match[1].toLowerCase();
  return "all";
}

export function CategoryProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [category, setCategory] = useState(() => {
    const saved = localStorage.getItem("manga-app-category");
    return CATEGORY_KEYS.includes(saved) ? saved : "all";
  });

  // Sync from URL
  useEffect(() => {
    const urlCat = deriveCategoryFromPath(location.pathname);
    if (urlCat !== category) {
      setCategory(urlCat);
    }
  }, [location.pathname]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("manga-app-category", category);
  }, [category]);

  const updateCategory = (next) => {
    if (!CATEGORY_KEYS.includes(next)) return;
    setCategory(next);
    if (next === "all") {
      navigate("/");
    } else {
      navigate(`/category/${next}`);
    }
  };

  const value = useMemo(
    () => ({ category, setCategory: updateCategory }),
    [category]
  );

  return (
    <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
  );
}

export function useCategory() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategory must be used within CategoryProvider");
  return ctx;
}

export default CategoryContext;
