import axios from "axios";

const API_BASE = "https://api.mangadex.org";

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
        ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}`
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
      ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}`
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
  } = options;

  try {
    // If fetchAll is true, we'll implement pagination to get all chapters
    if (fetchAll) {
      let allChapters = [];
      let currentOffset = 0;
      let hasMore = true;
      
      while (hasMore) {
        const res = await axios.get(`${API_BASE}/chapter`, {
          params: {
            manga: id,
            limit: 500, // Use max limit per request
            offset: currentOffset,
            order,
            translatedLanguage,
            groups,
          },
        });

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
        
        // Check if there are more chapters to fetch
        if (chapters.length < 500) {
          hasMore = false;
        } else {
          currentOffset += 500;
        }
      }
      
      return allChapters;
    } else {
      // Original behavior for non-fetchAll requests
      const res = await axios.get(`${API_BASE}/chapter`, {
        params: {
          manga: id,
          limit,
          offset,
          order,
          translatedLanguage,
          groups,
        },
      });

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
    console.error(`Error fetching chapters for manga ${id}:`, error);
    throw new Error(`Failed to fetch chapters: ${error.message}`);
  }
}

// Get chapter pages for reading
export async function getChapterPages(chapterId) {
  try {
    // Get the at-home server URL for this chapter
    const res = await axios.get(`${API_BASE}/at-home/server/${chapterId}`);
    
    const { baseUrl, chapter } = res.data;
    const { hash, data, dataSaver } = chapter;
    
    // Return both full quality and data-saver quality URLs
    return {
      baseUrl,
      hash,
      pages: data.map((filename) => `${baseUrl}/data/${hash}/${filename}`),
      pagesDataSaver: dataSaver.map((filename) => `${baseUrl}/data-saver/${hash}/${filename}`),
      quality: {
        full: data.map((filename) => `${baseUrl}/data/${hash}/${filename}`),
        dataSaver: dataSaver.map((filename) => `${baseUrl}/data-saver/${hash}/${filename}`),
      },
    };
  } catch (error) {
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
        ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}`
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

// Get popular manga (by rating or follows)
export async function getPopularManga(options = {}) {
  const {
    limit = 20,
    offset = 0,
    order = { followedCount: "desc" }, // or rating: "desc"
    includes = ["cover_art", "author", "artist"],
    contentRating = ["safe", "suggestive"],
  } = options;

  return getMangaList({
    limit,
    offset,
    order,
    includes,
    contentRating,
  });
}

// Get recently updated manga
export async function getRecentlyUpdatedManga(options = {}) {
  const {
    limit = 20,
    offset = 0,
    order = { updatedAt: "desc" },
    includes = ["cover_art", "author", "artist"],
    contentRating = ["safe", "suggestive"],
  } = options;

  return getMangaList({
    limit,
    offset,
    order,
    includes,
    contentRating,
  });
}

// Get completed manga
export async function getCompletedManga(options = {}) {
  const {
    limit = 20,
    offset = 0,
    order = { followedCount: "desc" },
    includes = ["cover_art", "author", "artist"],
    contentRating = ["safe", "suggestive"],
    status = ["completed"],
  } = options;

  return getMangaList({
    limit,
    offset,
    order,
    includes,
    contentRating,
    status,
  });
}
