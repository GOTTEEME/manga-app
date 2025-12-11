import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMangaById } from "../api/mangadex";
import MangaCard from "../components/MangaCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useFavorites } from "../utils/favorites";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFavorites() {
      if (!favorites || favorites.length === 0) {
        setMangaList([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const results = await Promise.all(
          favorites.map(async (id) => {
            try {
              return await getMangaById(id);
            } catch (_) {
              return null;
            }
          })
        );
        setMangaList(results.filter(Boolean));
      } catch (e) {
        setError(e.message || "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [favorites]);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">คลังการ์ตูนของฉัน</h1>
          <p className="text-white/80 text-sm sm:text-base">
            รายการการ์ตูนทั้งหมดที่คุณบันทึกไว้ในคลัง
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 flex justify-center dark:bg-gray-900 dark:text-gray-100">
            <LoadingSpinner size="md" text="กำลังโหลดคลังการ์ตูนของคุณ..." />
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-red-500 text-sm dark:bg-gray-900 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center dark:bg-gray-900 dark:text-gray-100">
            <p className="text-lg mb-4">ยังไม่มีการ์ตูนในคลังของคุณ</p>
            <Link
              to="/"
              className="btn bg-primary text-white hover:bg-primary/90 font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              ไปเลือกการ์ตูนเพิ่ม
            </Link>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && mangaList.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center dark:bg-gray-900 dark:text-gray-100">
            <p className="text-lg mb-2">ไม่สามารถโหลดข้อมูลการ์ตูนที่บันทึกไว้ได้</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              กรุณาลองใหม่อีกครั้งในภายหลัง
            </p>
          </div>
        )}

        {!loading && !error && mangaList.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-900">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {mangaList.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
