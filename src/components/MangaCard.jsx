import { Link } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function MangaCard({ manga }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { getTitle, getDescription, isThai } = useLanguage();

  // Handle different data formats
  const id = manga.id || manga._id;
  const title = getTitle(manga) || "No Title";
  const originalTitle = manga.title || "No Title";
  const author = manga.author || "Unknown Author";
  const description = getDescription(manga) || "No description available.";
  const status = manga.status || "Unknown";
  const coverUrl = manga.coverUrl || "https://via.placeholder.com/200x300?text=No+Cover";
  
  // Format the last update date
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Generate a random rating for demo purposes
  // In a real app, this would come from the API
  const rating = manga.rating || (Math.random() * 2 + 3).toFixed(1);
  
  // Generate random views for demo purposes
  // In a real app, this would come from the API
  const views = manga.views || Math.floor(Math.random() * 10000 + 1000).toLocaleString();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500";
      case "ongoing":
      case "hiatus":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating);
    if (numRating >= 4.5) return "text-green-600";
    if (numRating >= 3.5) return "text-blue-600";
    if (numRating >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link to={`/manga/${id}`} className="block h-full">
      <div
        className="card h-full flex flex-col cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative group overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Cover Image Container - Fixed aspect ratio */}
        <div className="relative overflow-hidden bg-gray-200 aspect-[3/4]">
          <img
            src={imageError ? "https://via.placeholder.com/300x400?text=No+Cover" : coverUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={handleImageError}
          />

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 flex flex-col justify-end ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="p-4 text-white">
              <p className="text-sm line-clamp-3 mb-3">
                {description}
              </p>
              <button className="w-full py-2.5 bg-primary text-white rounded-md font-medium hover:bg-primary-dark transition-all duration-200 transform hover:scale-105">
                {isThai ? "อ่านเลย" : "Read Now"}
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`inline-block px-2.5 py-1 text-xs font-bold text-white ${getStatusColor(status)} rounded-full shadow-md`}>
              {status}
            </span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-sm rounded-md px-2.5 py-1.5 flex items-center space-x-1.5 shadow-lg">
            <svg
              className="w-4 h-4 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className={`text-sm font-bold ${getRatingColor(rating)}`}>{rating}</span>
          </div>
        </div>

        {/* Card Content - Fixed height section */}
        <div className="p-4 bg-white flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] text-sm sm:text-base">
            {title}
            {isThai && manga.thaiTitle && title !== originalTitle && (
              <div className="text-xs text-gray-500 mt-1 truncate">
                {originalTitle}
              </div>
            )}
          </h3>

          {/* Author */}
          <p className="text-sm text-gray-600 mb-3 truncate">by {author}</p>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {formatDate(manga.updatedAt)}
            </span>
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                ></path>
              </svg>
              {views}
            </span>
          </div>

          {/* Tags (if available) */}
          {manga.tags && manga.tags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1">
              {manga.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
              {manga.tags.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
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
