import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCategory } from "../contexts/CategoryContext";
import { CATEGORY_LIST, getCategoryLabel } from "../utils/category";
import { getMangaByCategory } from "../api/mangadex";
import LoadingSpinner from "../components/LoadingSpinner";
import MangaGrid from "../components/MangaGrid";
import FeaturedCarousel from "../components/FeaturedCarousel";

export default function CategoryPage() {
  const { category: urlCategory } = useParams();
  const navigate = useNavigate();
  const { category, setCategory } = useCategory();

  const normalized = (urlCategory || "all").toLowerCase();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 30;

  const [featuredItems, setFeaturedItems] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState("");

  // Validate category from URL
  useEffect(() => {
    if (!CATEGORY_LIST.includes(normalized)) {
      navigate("/", { replace: true });
      return;
    }
    // Sync context
    if (category !== normalized) setCategory(normalized);
  }, [normalized]);

  // Fetch initial
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        const data = await getMangaByCategory(normalized, { limit: LIMIT, offset: 0, order: { updatedAt: "desc" } });
        if (!cancelled) {
          setItems(data);
          setOffset(data.length);
          setHasMore(data.length === LIMIT);
        }
      } catch (e) {
        if (!cancelled) setError(isThai ? "โหลดข้อมูลหมวดหมู่ล้มเหลว" : "Failed to load category");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    async function fetchFeatured() {
      try {
        setLoadingFeatured(true);
        setFeaturedError("");
        const data = await getMangaByCategory(normalized, { limit: 5, order: { followedCount: "desc" } });
        if (!cancelled) {
          setFeaturedItems(data);
        }
      } catch (e) {
        if (!cancelled) setFeaturedError("ไม่สามารถโหลดสไลด์แนะนำได้");
      } finally {
        if (!cancelled) setLoadingFeatured(false);
      }
    }
    fetchFeatured();
    return () => {
      cancelled = true;
    };
  }, [normalized]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      const data = await getMangaByCategory(normalized, { limit: LIMIT, offset, order: { updatedAt: "desc" } });
      setItems(prev => [...prev, ...data]);
      setOffset(prev => prev + data.length);
      setHasMore(data.length === LIMIT);
    } catch (e) {
      setError("โหลดข้อมูลเพิ่มเติมล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const title = useMemo(() => getCategoryLabel(normalized), [normalized]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        </div>

        <section className="mb-10">
          {loadingFeatured ? (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <FeaturedCarousel items={featuredItems} />
          )}
        </section>

        {error && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}

        {loading && items.length === 0 ? (
          <div className="w-full flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <MangaGrid items={items} />
        )}

        <div className="mt-8 flex items-center justify-center">
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                loading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {loading ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
