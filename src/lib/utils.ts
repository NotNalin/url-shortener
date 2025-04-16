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
