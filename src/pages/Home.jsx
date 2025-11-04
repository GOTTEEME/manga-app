import { useEffect, useState } from "react";
import {
  getMangaList,
  getPopularManga,
  getRecentlyUpdatedManga,
  getCompletedManga
} from "../api/mangadex";
import MangaCard from "../components/MangaCard";
import FeaturedCarousel from "../components/FeaturedCarousel";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

// Section component for manga lists
function MangaSection({ title, mangaList, viewAllLink, loading }) {
  const { isThai } = useLanguage();
  
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title">{title}</h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-primary hover:text-primary-dark font-medium text-sm transition-colors flex items-center"
          >
            {isThai ? "ดูทั้งหมด" : "View All"}
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </Link>
        )}
      </div>
      
      {loading ? (
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48">
              <div className="h-72 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="horizontal-scroll">
          {mangaList.map((manga) => (
            <div key={manga.id} className="flex-shrink-0 w-48 sm:w-56">
              <MangaCard manga={manga} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [featuredManga, setFeaturedManga] = useState([]);
  const [popularManga, setPopularManga] = useState([]);
  const [newUpdatesManga, setNewUpdatesManga] = useState([]);
  const [completedManga, setCompletedManga] = useState([]);
  const [loading, setLoading] = useState({
    featured: true,
    popular: true,
    new: true,
    completed: true,
  });
  const [error, setError] = useState(null);
  const { isThai } = useLanguage();

  // Fetch featured manga
  useEffect(() => {
    async function fetchFeaturedManga() {
      try {
        setLoading(prev => ({ ...prev, featured: true }));
        const data = await getPopularManga({ limit: 5 });
        setFeaturedManga(data);
      } catch (err) {
        console.error("Error fetching featured manga:", err);
        setError("Failed to load featured manga");
      } finally {
        setLoading(prev => ({ ...prev, featured: false }));
      }
    }

    fetchFeaturedManga();
  }, []);

  // Fetch popular manga
  useEffect(() => {
    async function fetchPopularManga() {
      try {
        setLoading(prev => ({ ...prev, popular: true }));
        const data = await getPopularManga({ limit: 10 });
        setPopularManga(data);
      } catch (err) {
        console.error("Error fetching popular manga:", err);
        setError("Failed to load popular manga");
      } finally {
        setLoading(prev => ({ ...prev, popular: false }));
      }
    }

    fetchPopularManga();
  }, []);

  // Fetch recently updated manga
  useEffect(() => {
    async function fetchNewUpdatesManga() {
      try {
        setLoading(prev => ({ ...prev, new: true }));
        const data = await getRecentlyUpdatedManga({ limit: 10 });
        setNewUpdatesManga(data);
      } catch (err) {
        console.error("Error fetching new updates:", err);
        setError("Failed to load new updates");
      } finally {
        setLoading(prev => ({ ...prev, new: false }));
      }
    }

    fetchNewUpdatesManga();
  }, []);

  // Fetch completed manga
  useEffect(() => {
    async function fetchCompletedManga() {
      try {
        setLoading(prev => ({ ...prev, completed: true }));
        const data = await getCompletedManga({ limit: 10 });
        setCompletedManga(data);
      } catch (err) {
        console.error("Error fetching completed manga:", err);
        setError("Failed to load completed manga");
      } finally {
        setLoading(prev => ({ ...prev, completed: false }));
      }
    }

    fetchCompletedManga();
  }, []);

  // Check if all sections are still loading
  const allLoading = Object.values(loading).every(Boolean);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Featured Carousel */}
      <section className="mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              {isThai ? (
                <>
                ยินดีต้อนรับเข้าสู่{" "}
                <span className="text-[#FF6B35] font-extrabold">Toonsoilnex</span>
              </>
              ) : (
                <>
                  Discover Amazing <span className="text-blue-600">Comics</span>
                </>
              )}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {isThai
                ? "นี่คือโปรเจกต์แลปของเรา เพื่อทดสอบฝีมือและเครื่องมือในการพัฒนาเว็บแอป"
                : "Explore thousands of comics across various genres"}
            </p>
          </div>

          
          {loading.featured ? (
            <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
              <LoadingSpinner size="lg" text={isThai ? "กำลังโหลดการ์ตูนแนะนำ..." : "Loading featured comics..."} />
            </div>
          ) : featuredManga.length > 0 ? (
            <FeaturedCarousel items={featuredManga} />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {isThai ? "ไม่มีการ์ตูนแนะนำ" : "No featured comics available"}
                </h3>
                <p className="text-gray-500">
                  {isThai ? "กรุณาลองใหม่ภายหลัง" : "Please try again later"}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Popular Section */}
        <MangaSection
          title={isThai ? "การ์ตูนยอดนิยม" : "Popular Comics"}
          mangaList={popularManga}
          viewAllLink="/popular"
          loading={loading.popular}
        />

        {/* New Updates Section */}
        <MangaSection
          title={isThai ? "อัปเดตล่าสุด" : "New Updates"}
          mangaList={newUpdatesManga}
          viewAllLink="/new"
          loading={loading.new}
        />

        {/* Completed Section */}
        <MangaSection
          title={isThai ? "การ์ตูนจบแล้ว" : "Completed Series"}
          mangaList={completedManga}
          viewAllLink="/completed"
          loading={loading.completed}
        />
      </main>
    </div>
  );
}
