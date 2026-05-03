import { Link } from "react-router-dom";
import { useState } from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function MangaCard({ manga }) {
  const [imageError, setImageError] = useState(false);
  const { getTitle } = useLanguage();

  const id = manga.id || manga._id;
  const title = getTitle(manga) || "No Title";
  const originalTitle = manga.title || "No Title";
  const author = manga.author || "Unknown Author";
  const status = manga.status || "Unknown";
  const coverUrl = manga.coverUrl || "https://via.placeholder.com/200x300?text=No+Cover";

  const formatDate = (dateString) => {
    if (!dateString) return "เร็วๆ นี้";
    const diff = Math.ceil(Math.abs(Date.now() - new Date(dateString)) / 86400000);
    if (diff === 1) return "เมื่อวาน";
    if (diff < 7) return `${diff} วันที่แล้ว`;
    if (diff < 30) return `${Math.floor(diff / 7)} สัปดาห์`;
    if (diff < 365) return `${Math.floor(diff / 30)} เดือน`;
    return `${Math.floor(diff / 365)} ปีที่แล้ว`;
  };

  const statusMap = {
    completed: { label: "จบแล้ว", color: "bg-emerald-500" },
    ongoing: { label: "กำลังดำเนิน", color: "bg-blue-500" },
    hiatus: { label: "หยุดพัก", color: "bg-amber-500" },
    cancelled: { label: "ยกเลิก", color: "bg-red-500" },
  };
  const statusInfo = statusMap[status?.toLowerCase()] ?? { label: status, color: "bg-gray-500" };

  return (
    <Link to={`/manga/${id}`} className="block h-full">
      <div className="card group h-full flex flex-col cursor-pointer border border-transparent dark:bg-gray-900 transform transition duration-300 ease-out hover:scale-[1.03] hover:shadow-xl hover:border-primary/60 dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        {/* Cover Image */}
        <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-800 aspect-[3/4]">
          <img
            src={imageError ? "https://via.placeholder.com/300x400?text=No+Cover" : coverUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            loading="lazy"
            onError={() => setImageError(true)}
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Status Badge */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold text-white ${statusInfo.color} rounded-full shadow`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-3 bg-white dark:bg-gray-800 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 min-h-[2.75rem] text-sm">
            {title}
          </h3>

          {manga.thaiTitle && title !== originalTitle && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mb-1">
              {originalTitle}
            </p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
            {author}
          </p>

          <div className="mt-auto flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{formatDate(manga.updatedAt)}</span>
          </div>

          {manga.tags && manga.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {manga.tags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded-full"
                >
                  {tag}
                </span>
              ))}
              {manga.tags.length > 2 && (
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] rounded-full">
                  +{manga.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
