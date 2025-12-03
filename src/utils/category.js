export const CATEGORY_ALL = "all";
export const CATEGORY_MANGA = "manga"; // Japanese
export const CATEGORY_MANHWA = "manhwa"; // Korean
export const CATEGORY_MANHUA = "manhua"; // Chinese

export const CATEGORY_LIST = [
  CATEGORY_ALL,
  CATEGORY_MANGA,
  CATEGORY_MANHWA,
  CATEGORY_MANHUA,
];

export function getOriginalLanguageForCategory(category) {
  switch ((category || CATEGORY_ALL).toLowerCase()) {
    case CATEGORY_MANGA:
      return "ja";
    case CATEGORY_MANHWA:
      return "ko";
    case CATEGORY_MANHUA:
      // MangaDex uses zh-hans/zh-hant for Chinese; leave undefined to not over-filter,
      // but prefer zh for wider results
      return "zh";
    default:
      return undefined;
  }
}

export function getCategoryLabel(category) {
  const key = (category || CATEGORY_ALL).toLowerCase();
  switch (key) {
    case CATEGORY_MANGA:
      return "มังงะ";
    case CATEGORY_MANHWA:
      return "มังฮวา";
    case CATEGORY_MANHUA:
      return "มังฮัว";
    case CATEGORY_ALL:
    default:
      return "ทั้งหมด";
  }
}
