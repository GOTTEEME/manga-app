import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Pause, BookOpen, Heart } from "lucide-react";

function getHeroCoverUrl(coverUrl) {
  if (!coverUrl) return coverUrl;
  if (coverUrl.includes(".256.")) return coverUrl.replace(".256.", ".512.");
  return coverUrl;
}

export default function FeaturedCarousel({ items = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
  };

  if (items.length === 0) {
    return (
      <div className="relative w-full h-[420px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg opacity-60">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const heroCoverUrl = getHeroCoverUrl(currentItem.coverUrl);

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-2xl group">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroCoverUrl}
          alt={currentItem.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/800x420?text=No+Image";
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-12 px-6 sm:px-10">
        <div className="max-w-xl">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-primary rounded-full mb-3">
            แนะนำ
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight line-clamp-2">
            {currentItem.title}
          </h2>
          <p className="text-sm text-white/75 mb-5 line-clamp-2 leading-relaxed">
            {currentItem.description || "การ์ตูนที่น่าติดตาม ห้ามพลาด!"}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/manga/${currentItem.id}`}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              อ่านเลย
            </Link>
            <Link
              to={`/manga/${currentItem.id}`}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white hover:bg-white/25 font-semibold py-2.5 px-5 rounded-xl transition-all duration-200"
            >
              <Heart className="w-4 h-4" />
              เพิ่มในคลัง
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/50 focus:outline-none"
        aria-label="สไลด์ก่อนหน้า"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/50 focus:outline-none"
        aria-label="สไลด์ถัดไป"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Autoplay Toggle */}
      <button
        onClick={() => setIsAutoPlaying((p) => !p)}
        className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/50 focus:outline-none"
        aria-label={isAutoPlaying ? "หยุด" : "เล่น"}
      >
        {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`ไปสไลด์ ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
