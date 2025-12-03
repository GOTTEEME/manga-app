import axios from "axios";

const API_BASE = import.meta.env.DEV ? "/api" : "https://api.mangadex.org";
const UPLOADS_BASE = import.meta.env.DEV ? "/covers" : "https://uploads.mangadex.org";

// Get manga list with various filters
export async function getMangaList(options = {}) {
  const {
    limit = 20,
    offset = 0,
    order = { createdAt: "desc" },
    includes = ["cover_art", "author", "artist"],
    contentRating = ["safe", "suggestive", "erotica"],
    publicationDemographic = [],
    status = [],
    tags = [],
    originalLanguage,
    includedTags = [], // MangaDex expects UUIDs for tag filters; keep optional
  } = options;

  try {
    const res = await axios.get(`${API_BASE}/manga`, {
      params: {
        limit,
        offset,
        order,
        includes,
        contentRating,
        publicationDemographic,
        status,
        tags,
        originalLanguage,
        // Axios encodes arrays as includedTags[]=<id>
        ...(includedTags && includedTags.length ? { includedTags } : {}),
      },
    });

    return res.data.data.map((manga) => {
      const cover = manga.relationships.find((r) => r.type === "cover_art");
      const author = manga.relationships.find((r) => r.type === "author");
      const artist = manga.relationships.find((r) => r.type === "artist");
      
      // Get the best available title with Thai support
      const title = manga.attributes.title.th ||
                   manga.attributes.title.en ||
                   manga.attributes.title["ja-ro"] ||
                   manga.attributes.title.ja ||
                   Object.values(manga.attributes.title)[0] ||
                   "No Title";
      
      // Get description with Thai support
      const description = manga.attributes.description?.th ||
                         manga.attributes.description?.en ||
                         manga.attributes.description?.["ja-ro"] ||
                         "No description available.";
      
      // Get Thai title if available (for subtitle display)
      const thaiTitle = manga.attributes.title.th || null;
      
      // Get cover URL with proper size
      const coverUrl = cover
        ? `${UPLOADS_BASE}/covers/${manga.id}/${cover.attributes.fileName}.256.jpg`
        : "https://via.placeholder.com/300x450?text=No+Cover";

      // Get publication year
      const year = manga.attributes.year ? manga.attributes.year : "Unknown";

      // Get last chapter
      const lastChapter = manga.attributes.lastChapter || "Ongoing";

      // Get status
      const status = manga.attributes.status || "Unknown";

      return {
        id: manga.id,
        title,
        thaiTitle,
        description,
        coverUrl,
        author: author?.attributes?.name || "Unknown Author",
        artist: artist?.attributes?.name || author?.attributes?.name || "Unknown Artist",
        status,
        year,
        lastChapter,
        contentRating: manga.attributes.contentRating,
        publicationDemographic: manga.attributes.publicationDemographic,
        tags: manga.attributes.tags.map(tag => tag.attributes.name.en),
        createdAt: manga.attributes.createdAt,
        updatedAt: manga.attributes.updatedAt,
        // Keep original data for reference
        raw: manga,
      };
    });
  } catch (error) {
    console.error("Error fetching manga list:", error);
    throw new Error("Failed to fetch manga list");
  }
}

// Convenience: fetch manga filtered by category with pagination
export async function getMangaByCategory(category, options = {}) {
  const { limit = 20, offset = 0, order = { updatedAt: "desc" } } = options;

  // Map category to originalLanguage per MangaDex
  let originalLanguage;
  switch ((category || "all").toLowerCase()) {
    case "manga":
      originalLanguage = ["ja"]; // Japanese
      break;
    case "manhwa":
      originalLanguage = ["ko"]; // Korean
      break;
    case "manhua":
      originalLanguage = ["zh-hans", "zh-hant"]; // Chinese simplified & traditional
      break;
    default:
      originalLanguage = undefined; // All
  }

  return getMangaList({
    limit,
    offset,
    order,
    originalLanguage,
    includes: ["cover_art", "author", "artist"],
    contentRating: ["safe", "suggestive"],
  });
}

// Get adult/18+ manga (doujin) using contentRating filters
export async function getAdultManga(options = {}) {
  const {
    limit = 30,
    offset = 0,
    order = { updatedAt: "desc" },
    originalLanguage,
  } = options;

  return getMangaList({
    limit,
    offset,
    order,
    originalLanguage,
    includes: ["cover_art", "author", "artist"],
    contentRating: ["erotica", "pornographic"],
  });
}

// Get manga by ID with detailed information
export async function getMangaById(id) {
  try {
    const res = await axios.get(`${API_BASE}/manga/${id}`, {
      params: {
        includes: ["cover_art", "author", "artist", "tag"],
      },
    });
    
    const manga = res.data.data;
    const cover = manga.relationships.find((r) => r.type === "cover_art");
    const author = manga.relationships.find((r) => r.type === "author");
    const artist = manga.relationships.find((r) => r.type === "artist");
    
    // Get the best available title with Thai support
    const title = manga.attributes.title.th ||
                 manga.attributes.title.en ||
                 manga.attributes.title["ja-ro"] ||
                 manga.attributes.title.ja ||
                 Object.values(manga.attributes.title)[0] ||
                 "No Title";
    
    // Get description with Thai support
    const description = manga.attributes.description?.th ||
                       manga.attributes.description?.en ||
                       manga.attributes.description?.["ja-ro"] ||
                       "No description available.";
    
    // Get Thai title if available (for subtitle display)
    const thaiTitle = manga.attributes.title.th || null;
    
    // Get cover URL with better size
    const coverUrl = cover
      ? `${UPLOADS_BASE}/covers/${manga.id}/${cover.attributes.fileName}.512.jpg`
      : "https://via.placeholder.com/500x700?text=No+Cover";

    // Get additional details
    const year = manga.attributes.year ? manga.attributes.year : "Unknown";
    const lastChapter = manga.attributes.lastChapter || "Ongoing";
    const status = manga.attributes.status || "Unknown";

    return {
      id: manga.id,
      title,
      thaiTitle,
      description,
      coverUrl,
      author: author?.attributes?.name || "Unknown Author",
      artist: artist?.attributes?.name || author?.attributes?.name || "Unknown Artist",
      status,
      year,
      lastChapter,
      contentRating: manga.attributes.contentRating,
      publicationDemographic: manga.attributes.publicationDemographic,
      tags: manga.attributes.tags.map(tag => tag.attributes.name.en),
      createdAt: manga.attributes.createdAt,
      updatedAt: manga.attributes.updatedAt,
      // Keep original data for reference
      raw: manga,
    };
  } catch (error) {
    console.error(`Error fetching manga ${id}:`, error);
    throw new Error(`Failed to fetch manga details: ${error.message}`);
  }
}

// Get chapters by manga ID
export async function getChaptersByMangaId(id, options = {}) {
  const {
    limit = 100,
    offset = 0,
    order = { chapter: "asc" },
    translatedLanguage = ["en", "th"], // Include Thai by default
    groups = [],
    fetchAll = false, // New option to fetch all chapters
    signal,
  } = options;

  try {
    // If fetchAll is true, we'll implement pagination to get all chapters
    if (fetchAll) {
      let allChapters = [];
      let currentOffset = 0;
      let hasMore = true;
      const PAGE_LIMIT = 100; // MangaDex API max per page for chapters
      
      async function fetchPage(offset) {
        const baseParams = {
          manga: id,
          limit: PAGE_LIMIT,
          offset,
          order,
          groups,
        };

        const params =
          translatedLanguage && translatedLanguage.length
            ? { ...baseParams, translatedLanguage }
            : baseParams;

        try {
          return await axios.get(`${API_BASE}/chapter`, {
            params,
            timeout: 10000,
            signal,
          });
        } catch (err) {
          return await axios.get(`${API_BASE}/chapter`, {
            params,
            timeout: 15000,
            signal,
          });
        }
      }

      while (hasMore) {
        const res = await fetchPage(currentOffset);

        const chapters = res.data.data.map((chapter) => ({
          id: chapter.id,
          title: chapter.attributes.title || `Chapter ${chapter.attributes.chapter}`,
          chapter: chapter.attributes.chapter,
          volume: chapter.attributes.volume,
          translatedLanguage: chapter.attributes.translatedLanguage,
          pages: chapter.attributes.pages,
          createdAt: chapter.attributes.createdAt,
          updatedAt: chapter.attributes.updatedAt,
          publishAt: chapter.attributes.publishAt,
          // Keep original data for reference
          raw: chapter,
        }));

        allChapters = [...allChapters, ...chapters];
        
        // Check if there are more chapters to fetch using API totals
        const total = res.data?.total ?? allChapters.length;
        const pageSize = res.data?.limit ?? PAGE_LIMIT;
        currentOffset += pageSize;
        hasMore = currentOffset < total && chapters.length > 0;
      }
      
      return allChapters;
    } else {
      // Original behavior for non-fetchAll requests
      async function fetchOnce() {
        const baseParams = { manga: id, limit, offset, order, groups };

        const params =
          translatedLanguage && translatedLanguage.length
            ? { ...baseParams, translatedLanguage }
            : baseParams;

        try {
          return await axios.get(`${API_BASE}/chapter`, {
            params,
            timeout: 10000,
            signal,
          });
        } catch (err) {
          return await axios.get(`${API_BASE}/chapter`, {
            params,
            timeout: 15000,
            signal,
          });
        }
      }
      const res = await fetchOnce();

      return res.data.data.map((chapter) => ({
        id: chapter.id,
        title: chapter.attributes.title || `Chapter ${chapter.attributes.chapter}`,
        chapter: chapter.attributes.chapter,
        volume: chapter.attributes.volume,
        translatedLanguage: chapter.attributes.translatedLanguage,
        pages: chapter.attributes.pages,
        createdAt: chapter.attributes.createdAt,
        updatedAt: chapter.attributes.updatedAt,
        publishAt: chapter.attributes.publishAt,
        // Keep original data for reference
        raw: chapter,
      }));
    }
  } catch (error) {
    if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
      throw error;
    }
    console.error(`Error fetching chapters for manga ${id}:`, error);
    throw new Error(`Failed to fetch chapters: ${error.message}`);
  }
}

// Get chapter pages for reading
export async function getChapterPages(chapterId, options = {}) {
  const { signal } = options;
  try {
    // Get the at-home server URL for this chapter
    async function fetchServer() {
      try {
        return await axios.get(`${API_BASE}/at-home/server/${chapterId}`, { timeout: 10000, signal });
      } catch (err) {
        return await axios.get(`${API_BASE}/at-home/server/${chapterId}`, { timeout: 15000, signal });
      }
    }
    const res = await fetchServer();
    
    const { baseUrl, chapter } = res.data;
    const { hash, data, dataSaver } = chapter;
    
    // In development, route through Vite proxy paths to avoid CORS/hotlink blocks.
    const buildUrl = (kind, filename) => {
      if (import.meta.env.DEV) {
        // Use proxied routes configured in vite.config: /data and /data-saver
        return `/${kind}/${hash}/${filename}`;
      }
      return `${baseUrl}/${kind}/${hash}/${filename}`;
    };

    const pagesFull = (data || []).map((f) => buildUrl('data', f));
    const pagesSaver = (dataSaver || []).map((f) => buildUrl('data-saver', f));

    return {
      baseUrl,
      hash,
      pages: pagesFull,
      pagesDataSaver: pagesSaver,
      quality: {
        full: pagesFull,
        dataSaver: pagesSaver,
      },
    };
  } catch (error) {
    if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
      throw error;
    }
    console.error(`Error fetching pages for chapter ${chapterId}:`, error);
    throw new Error(`Failed to fetch chapter pages: ${error.message}`);
  }
}

// Search manga by title or tags
export async function searchManga(query, options = {}) {
  const {
    limit = 20,
    offset = 0,
    order = { relevance: "desc" },
    includes = ["cover_art", "author", "artist"],
    contentRating = ["safe", "suggestive", "erotica"],
    tags = [],
  } = options;

  try {
    const res = await axios.get(`${API_BASE}/manga`, {
      params: {
        title: query,
        limit,
        offset,
        order,
        includes,
        contentRating,
        tags,
      },
    });

    return res.data.data.map((manga) => {
      const cover = manga.relationships.find((r) => r.type === "cover_art");
      const author = manga.relationships.find((r) => r.type === "author");
      const artist = manga.relationships.find((r) => r.type === "artist");
      
      // Get the best available title with Thai support
      const title = manga.attributes.title.th ||
                   manga.attributes.title.en ||
                   manga.attributes.title["ja-ro"] ||
                   manga.attributes.title.ja ||
                   Object.values(manga.attributes.title)[0] ||
                   "No Title";
      
      // Get description with Thai support
      const description = manga.attributes.description?.th ||
                         manga.attributes.description?.en ||
                         manga.attributes.description?.["ja-ro"] ||
                         "No description available.";
      
      // Get Thai title if available (for subtitle display)
      const thaiTitle = manga.attributes.title.th || null;
      
      // Get cover URL
      const coverUrl = cover
        ? `${UPLOADS_BASE}/covers/${manga.id}/${cover.attributes.fileName}`
        : "https://via.placeholder.com/300x450?text=No+Cover";

      return {
        id: manga.id,
        title,
        thaiTitle,
        description,
        coverUrl,
        author: author?.attributes?.name || "Unknown Author",
        artist: artist?.attributes?.name || author?.attributes?.name || "Unknown Artist",
        status: manga.attributes.status || "Unknown",
        year: manga.attributes.year || "Unknown",
        lastChapter: manga.attributes.lastChapter || "Ongoing",
        contentRating: manga.attributes.contentRating,
        publicationDemographic: manga.attributes.publicationDemographic,
        tags: manga.attributes.tags.map(tag => tag.attributes.name.en),
        createdAt: manga.attributes.createdAt,
        updatedAt: manga.attributes.updatedAt,
        // Keep original data for reference
        raw: manga,
      };
    });
  } catch (error) {
    console.error(`Error searching manga with query "${query}":`, error);
    throw new Error(`Failed to search manga: ${error.message}`);
  }
}

// (cleaned) Removed unused helpers: getPopularManga, getRecentlyUpdatedManga, getCompletedManga.
