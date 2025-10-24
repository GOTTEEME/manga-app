import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import SearchModal from "./components/SearchModal";
import Home from "./pages/Home";
import MangaDetail from "./pages/MangaDetail";
import ChapterReader from "./pages/ChapterReader";
import NotFound from "./pages/NotFound";

export default function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Navbar */}
        <Navbar openSearch={openSearch} />

        {/* Search Modal */}
        <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manga/:id" element={<MangaDetail />} />
            <Route path="/chapter/:id" element={<ChapterReader />} />
            <Route path="/popular" element={<Home />} />
            <Route path="/new" element={<Home />} />
            <Route path="/completed" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4 text-primary">Toonsoilnex</h3>
                <p className="text-gray-300 text-sm">
                  Your ultimate destination for reading comics online. Discover thousands of comics across various genres.
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
              <p className="mt-2">Made with ❤️ for comic lovers</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
