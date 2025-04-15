/**
 * Helper function to get country flag emoji
 */
export function getCountryFlag(countryName: string): string {
  const countries: Record<string, string> = {
    "United States": "🇺🇸",
    Netherlands: "🇳🇱",
    Chile: "🇨🇱",
    China: "🇨🇳",
    Mexico: "🇲🇽",
    Italy: "🇮🇹",
    UK: "🇬🇧",
    Canada: "🇨🇦",
    Germany: "🇩🇪",
    France: "🇫🇷",
    Japan: "🇯🇵",
    Brazil: "🇧🇷",
    India: "🇮🇳",
    Australia: "🇦🇺",
    Russia: "🇷🇺",
    Spain: "🇪🇸",
  };

  return countries[countryName] || "🌐";
}

/**
 * Helper function to get language flag emoji
 */
export function getLanguageFlag(languageCode: string): string {
  // Extract country code from language code (e.g., en-US -> US)
  const parts = languageCode.split("-");
  if (parts.length > 1) {
    const countryCode = parts[1].toUpperCase();
    // Convert country code to flag emoji (using regional indicator symbols)
    return countryCode
      .split("")
      .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
      .join("");
  }

  // Fallbacks for common languages without country code
  const languageFlags: Record<string, string> = {
    en: "🇬🇧",
    es: "🇪🇸",
    fr: "🇫🇷",
    de: "🇩🇪",
    it: "🇮🇹",
    pt: "🇵🇹",
    ru: "🇷🇺",
    zh: "🇨🇳",
    ja: "🇯🇵",
    ko: "🇰🇷",
    ar: "🇸🇦",
    hi: "🇮🇳",
  };

  return languageFlags[parts[0].toLowerCase()] || "🌐";
}

/**
 * Format language code to a readable name
 */
export function formatLanguageName(languageCode: string): string {
  // Language names mapping
  const languageNames: Record<string, string> = {
    en: "English",
    "en-US": "English (US)",
    "en-GB": "English (UK)",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
    ar: "Arabic",
    hi: "Hindi",
  };

  return languageNames[languageCode] || languageCode;
}
