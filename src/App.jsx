import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SearchModal from "./components/SearchModal";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import MangaDetail from "./pages/MangaDetail";
import ChapterReader from "./pages/ChapterReader";
import DoujinPage from "./pages/DoujinPage";
import CompletedPage from "./pages/CompletedPage";
import NotFound from "./pages/NotFound";
import FavoritesPage from "./pages/FavoritesPage";
import { CategoryProvider } from "./contexts/CategoryContext";

function AppLayout({ children, openSearch, closeSearch, isSearchOpen, isDarkMode, toggleDarkMode }) {
  const location = useLocation();
  const isChapterRoute = location.pathname.startsWith("/chapter/");

  return (
    <CategoryProvider>
      <div className={
        isChapterRoute
          ? "min-h-screen bg-black text-white"
          : `min-h-screen ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`
      }>
        {!isChapterRoute && (
          <>
            {/* Navbar */}
            <Navbar openSearch={openSearch} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

            {/* Search Modal */}
            <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
          </>
        )}

        {/* Main Content */}
        <main>{children}</main>

        {!isChapterRoute && (
          /* Footer */
          <footer
            className={
              isDarkMode
                ? "bg-gray-950 text-gray-200 mt-12 border-t border-gray-800"
                : "bg-gray-900 text-gray-100 mt-12 border-t border-gray-800"
            }
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-md">
                  <h3 className="text-2xl font-extrabold tracking-tight text-primary">Toonsoilnex</h3>
                  <p className="mt-4 text-sm leading-relaxed text-gray-400">
                    เว็บไซต์นี้เป็นโปรเจกต์แลปสำหรับทดลองและทดสอบระบบเท่านั้น
                    ขอบคุณที่เข้ามาช่วยทดสอบครับ
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12 text-sm">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-4">
                      Browse
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li><a href="/" className="hover:text-primary transition-colors">หน้าแรก</a></li>
                      <li><a href="/favorites" className="hover:text-primary transition-colors">คลังของฉัน</a></li>
                      <li><a href="/completed" className="hover:text-primary transition-colors">การ์ตูนจบแล้ว</a></li>
                      <li><a href="/doujin" className="hover:text-primary transition-colors">โดจิน</a></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-4">
                      หมวดหมู่
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li><a href="/category/manga" className="hover:text-primary transition-colors">มังงะ</a></li>
                      <li><a href="/category/manhwa" className="hover:text-primary transition-colors">มังฮวา</a></li>
                      <li><a href="/category/manhua" className="hover:text-primary transition-colors">มังฮัว</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                <p className="text-xs text-gray-500">
                  &copy; {new Date().getFullYear()} Toonsoilnex. All rights reserved.
                </p>
                <p className="text-xs text-gray-400">Solilnex X TeeMo</p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </CategoryProvider>
  );
}

export default function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = window.localStorage.getItem("theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return true;
      }
    } catch (_) { }
    return false;
  });

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      } catch (_) { }
    }
  }, [isDarkMode]);

  return (
    <Router>
      <AppLayout
        openSearch={openSearch}
        closeSearch={closeSearch}
        isSearchOpen={isSearchOpen}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/manga/:id" element={<MangaDetail />} />
          <Route path="/chapter/:id" element={<ChapterReader />} />
          <Route path="/doujin" element={<DoujinPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/popular" element={<Home />} />
          <Route path="/new" element={<Home />} />
          <Route path="/completed" element={<CompletedPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
