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
          <footer className={isDarkMode ? "bg-gray-900 text-gray-200 py-8 mt-12" : "bg-gray-800 text-white py-8 mt-12"}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4 text-primary">Toonsoilnex</h3>
                <p className="text-gray-300 text-sm">
                  สวัสดีนี้โปรเจคแลปของเรา เราทำการทดลองและทดสอบเครื่องในแอปนี้ขอบคุณที่เข้ามาเทสนะ 
                </p>
              </div>
              <div>
                <h4 className="text-md font-semibold mb-4">Browse</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="/" className="hover:text-primary transition-colors">Popular Comics</a></li>
                  <li><a href="/" className="hover:text-primary transition-colors">New Updates</a></li>
                  <li><a href="/" className="hover:text-primary transition-colors">Completed Series</a></li>
                  <li><a href="/" className="hover:text-primary transition-colors">Random Comic</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-md font-semibold mb-4">Genres</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="/" className="hover:text-primary transition-colors">Action</a></li>
                  <li><a href="/" className="hover:text-primary transition-colors">Romance</a></li>
                  <li><a href="/" className="hover:text-primary transition-colors">Comedy</a></li>
                  <li><a href="/" className="hover:text-primary transition-colors">Drama</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-md font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="/" className="hover:text-primary transition-colors">About Us</a></li>
                  <li><a href="/" className="hover:text-primary transition-colors">Contact</a></li>
                  <li><a href="/" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                  <li><a href="/" className="hover:text-primary transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} Toonsoilnex. All rights reserved.</p>
              <p className="mt-2">Solilnex X TeeMo</p>
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
    } catch (_) {}
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
      } catch (_) {}
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
          <Route path="/popular" element={<Home />} />
          <Route path="/new" element={<Home />} />
          <Route path="/completed" element={<CompletedPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
