"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from "react-leaflet";
import type { MapContainerProps, TileLayerProps } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Feature, Geometry, GeoJsonObject } from "geojson";
import type { Layer, StyleFunction } from "leaflet";
import { logger } from "@/lib/db";
import { useTheme } from "next-themes";

// Types
interface MapData extends GeoJsonObject {
  features: Array<Feature<Geometry>>;
  type: "FeatureCollection";
}

interface CountryData {
  name: string;
  count: number;
  percentage: number;
}

interface CountryProperties {
  ADMIN?: string;
  name?: string;
  ISO_A2?: string;
  ISO_A3?: string;
}

interface CountryFeature extends Feature<Geometry> {
  properties: CountryProperties;
}

// Theme-aware color schemes
const COLOR_SCHEMES = {
  light: {
    noVisits: "#e2e8f0", // Light gray
    veryLow: "#c3dafe", // Light blue
    low: "#a3bffa", // Medium light blue
    medium: "#7f9cf5", // Medium blue
    high: "#5a67d8", // Darker blue
    border: "#cbd5e0", // Light gray border
    hoverBorder: "#4a5568", // Consistent hover border color for light mode
    background: "#f7fafc", // Very light background
    text: "#2d3748", // Dark text
    tooltip: {
      bg: "rgba(255, 255, 255, 0.95)",
      border: "#e2e8f0",
      text: "#2d3748",
    },
  },
  dark: {
    noVisits: "#2d3748", // Dark gray
    veryLow: "#7f9cf5", // Light purple
    low: "#667eea", // Medium purple
    medium: "#5a67d8", // Darker purple
    high: "#434190", // Deep purple
    border: "#1a202c", // Dark border
    hoverBorder: "#f7fafc", // Light hover border for dark mode
    background: "#1f2937", // Dark background
    text: "#f7fafc", // Light text
    tooltip: {
      bg: "rgba(26, 32, 44, 0.95)",
      border: "#4a5568",
      text: "#f7fafc",
    },
  },
};

// Theme-aware map tiles
const MAP_TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

// Country name normalization map
const COUNTRY_NAME_MAP: Record<string, string> = {
  "united states of america": "united states",
  "united states": "united states",
  "united kingdom": "uk",
  "great britain": "uk",
  "russian federation": "russia",
  "korea, republic of": "south korea",
  "viet nam": "vietnam",
  "democratic republic of the congo": "congo",
  "republic of the congo": "congo",
  "republic of ireland": "ireland",
  "people's republic of china": "china",
  "islamic republic of iran": "iran",
  "united republic of tanzania": "tanzania",
  "democratic people's republic of korea": "north korea",
  "kingdom of saudi arabia": "saudi arabia",
  "united arab emirates": "uae",
  türkiye: "turkey",
  "myanmar (burma)": "myanmar",
  "czech republic": "czechia",
  "republic of north macedonia": "north macedonia",
  "bosnia and herzegovina": "bosnia",
  "dominican republic": "dominican rep.",
};

// Geo data URL
const GEO_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

/**
 * Client-side world map visualization component using react-leaflet
 * Shows countries with color intensities based on visit data
 * Supports light and dark themes
 */
export default function ClientWorldMap({
  countries,
  height = "400px",
}: {
  countries: CountryData[];
  height?: string;
}) {
  const { theme = "light", resolvedTheme } = useTheme();
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [geoData, setGeoData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Store map instance to refresh it when theme changes
  const [map, setMap] = useState<L.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Determine current theme
  const currentTheme = (resolvedTheme || theme) as "light" | "dark";
  const colorScheme = COLOR_SCHEMES[currentTheme];
  const mapTileUrl = MAP_TILES[currentTheme];

  // When theme changes, refresh the map
  useEffect(() => {
    if (map) {
      map.invalidateSize();
    }
  }, [currentTheme, map]);

  // Normalize country names for more accurate matching
  const normalizedCountries = useMemo(() => {
    return countries.map((country) => ({
      ...country,
      normalizedName: country.name.toLowerCase().trim(),
    }));
  }, [countries]);

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mapRef.current) {
        setMousePosition({
          x: e.clientX,
          y: e.clientY,
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Position tooltip - keeps tooltip within viewport
  const getTooltipPosition = () => {
    if (!tooltipRef.current) {
      return {
        left: `${mousePosition.x + 15}px`,
        top: `${mousePosition.y - 15}px`,
      };
    }

    const tooltipWidth = tooltipRef.current.offsetWidth;
    const tooltipHeight = tooltipRef.current.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = mousePosition.x + 15;
    let top = mousePosition.y - 15;

    // Keep tooltip within viewport bounds
    if (left + tooltipWidth > viewportWidth - 10) {
      left = mousePosition.x - tooltipWidth - 10;
    }
    if (top + tooltipHeight > viewportHeight - 10) {
      top = viewportHeight - tooltipHeight - 10;
    }
    if (top < 10) {
      top = 10;
    }

    return { left: `${left}px`, top: `${top}px` };
  };

  // Fetch GeoJSON data with improved error handling
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    setIsLoading(true);

    fetch(GEO_URL, { signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: MapData) => {
        if (!data.type) {
          data.type = "FeatureCollection";
        }
        setGeoData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          logger.error("Error loading GeoJSON data:", error);
          setError("Failed to load map data. Please try again later.");
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  // Get visit count for a country with improved matching
  const getCountryVisits = useMemo(
    () =>
      (feature: CountryFeature): number => {
        const countryName =
          feature.properties.ADMIN || feature.properties.name || "";
        const countryCode =
          feature.properties.ISO_A2 || feature.properties.ISO_A3 || "";

        if (!countryName) return 0;

        const normalizedCountryName = countryName.toLowerCase().trim();
        const mappedName =
          COUNTRY_NAME_MAP[normalizedCountryName] || normalizedCountryName;

        // Try multiple matching strategies
        const country = normalizedCountries.find(
          (c) =>
            c.normalizedName === mappedName ||
            mappedName.includes(c.normalizedName) ||
            c.normalizedName.includes(mappedName) ||
            (countryCode && countryCode.toLowerCase() === c.normalizedName),
        );

        return country?.count || 0;
      },
    [normalizedCountries],
  );

  // Get color based on visit count
  const getCountryColor = useMemo(
    () =>
      (visits: number): string => {
        if (visits === 0) return colorScheme.noVisits;
        if (visits < 10) return colorScheme.veryLow;
        if (visits < 50) return colorScheme.low;
        if (visits < 100) return colorScheme.medium;
        return colorScheme.high;
      },
    [colorScheme],
  );

  // Style function for GeoJSON features
  const countryStyle = useMemo<StyleFunction<CountryFeature>>(
    () => (feature) => {
      const visits = getCountryVisits(feature as CountryFeature);
      return {
        fillColor: getCountryColor(visits),
        weight: 1,
        opacity: 0.8,
        color: colorScheme.border,
        fillOpacity: 0.8,
      };
    },
    [colorScheme, getCountryVisits, getCountryColor],
  );

  // Event handlers for GeoJSON features - Fixed hover border color
  const onEachCountry = useMemo(
    () => (feature: Feature<Geometry>, layer: Layer) => {
      const countryFeature = feature as CountryFeature;
      const countryName =
        countryFeature.properties.ADMIN || countryFeature.properties.name || "";
      const visits = getCountryVisits(countryFeature);

      layer.on({
        mouseover: (e: LeafletMouseEvent) => {
          const target = e.target;
          target.setStyle({
            fillOpacity: 1,
            weight: 2,
            // Use consistent hover border color from color scheme
            color: colorScheme.hoverBorder,
          });
          target.bringToFront();
          setTooltipContent(`${countryName}: ${visits} visits`);
        },
        mouseout: (e: LeafletMouseEvent) => {
          const target = e.target;
          target.setStyle({
            fillOpacity: 0.8,
            weight: 1,
            color: colorScheme.border,
          });
          setTooltipContent("");
        },
      });
    },
    [getCountryVisits, colorScheme, setTooltipContent],
  );

  const mapContainerProps: MapContainerProps = {
    center: [20, 0],
    zoom: 2,
    style: {
      height: "100%",
      width: "100%",
      background: colorScheme.background,
    },
    attributionControl: false,
    zoomControl: false,
    scrollWheelZoom: true,
    dragging: true,
    doubleClickZoom: true,
    touchZoom: true,
    minZoom: 1,
    maxZoom: 8,
    maxBounds: [
      [-90, -180],
      [90, 180],
    ],
    whenReady: () => setMap(map),
  };

  const tileLayerProps: TileLayerProps = {
    url: mapTileUrl,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  };

  // Calculate tooltip position
  const tooltipStyle = getTooltipPosition();

  // Classes for the UI elements based on theme
  const loadingTextClass =
    currentTheme === "dark" ? "text-gray-400" : "text-gray-600";
  const buttonClass =
    currentTheme === "dark"
      ? "mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      : "mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors";

  return (
    <div
      ref={mapRef}
      className={`relative w-full rounded-lg overflow-hidden ${
        currentTheme === "dark" ? "shadow-lg" : "shadow-md"
      }`}
      style={{ height }}
      aria-label="World map showing visitor counts by country"
      role="region"
    >
      {error && (
        <div
          className={`flex items-center justify-center h-full ${
            currentTheme === "dark" ? "bg-gray-900" : "bg-gray-100"
          }`}
        >
          <div className="text-center p-4">
            <svg
              className="w-8 h-8 text-red-500 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className={`mt-2 text-sm ${loadingTextClass}`}>{error}</p>
            <button
              className={buttonClass}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {isLoading && !error && (
        <div
          className={`flex items-center justify-center h-full ${
            currentTheme === "dark" ? "bg-gray-900" : "bg-gray-100"
          }`}
        >
          <div className="text-center">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                currentTheme === "dark" ? "border-blue-500" : "border-blue-600"
              } mx-auto`}
            ></div>
            <p className={`mt-4 text-sm ${loadingTextClass}`}>
              Loading map data...
            </p>
          </div>
        </div>
      )}

      {!isLoading && !error && geoData && (
        <MapContainer {...mapContainerProps}>
          <TileLayer {...tileLayerProps} />
          <ZoomControl position="bottomright" />
          <GeoJSON
            data={geoData}
            style={countryStyle}
            onEachFeature={onEachCountry}
          />
        </MapContainer>
      )}

      {tooltipContent && (
        <div
          ref={tooltipRef}
          style={{
            ...tooltipStyle,
            backgroundColor: colorScheme.tooltip.bg,
            borderColor: colorScheme.tooltip.border,
            color: colorScheme.tooltip.text,
          }}
          className={`fixed border px-3 py-2 rounded-md text-sm font-medium shadow-xl z-[1000] ${
            currentTheme === "dark" ? "backdrop-blur-lg" : "backdrop-blur-sm"
          }`}
          role="tooltip"
        >
          {tooltipContent}
        </div>
      )}

      {/* Color legend with theme-aware styling */}
      <div
        className={`absolute bottom-4 left-4 flex flex-col gap-1 p-3 rounded-md border shadow-lg z-[1000] ${
          currentTheme === "dark"
            ? "bg-gray-800/95 border-gray-700 backdrop-blur-sm"
            : "bg-white/95 border-gray-200 backdrop-blur-sm"
        }`}
        aria-label="Map legend"
      >
        <p
          className={`text-xs font-semibold mb-1 ${
            currentTheme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Visit Count
        </p>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: colorScheme.noVisits }}
            aria-hidden="true"
          ></div>
          <span
            className={
              currentTheme === "dark" ? "text-gray-300" : "text-gray-700"
            }
          >
            No visits
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: colorScheme.veryLow }}
            aria-hidden="true"
          ></div>
          <span
            className={
              currentTheme === "dark" ? "text-gray-300" : "text-gray-700"
            }
          >
            1-9 visits
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: colorScheme.low }}
            aria-hidden="true"
          ></div>
          <span
            className={
              currentTheme === "dark" ? "text-gray-300" : "text-gray-700"
            }
          >
            10-49 visits
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: colorScheme.medium }}
            aria-hidden="true"
          ></div>
          <span
            className={
              currentTheme === "dark" ? "text-gray-300" : "text-gray-700"
            }
          >
            50-99 visits
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: colorScheme.high }}
            aria-hidden="true"
          ></div>
          <span
            className={
              currentTheme === "dark" ? "text-gray-300" : "text-gray-700"
            }
          >
            100+ visits
          </span>
        </div>
      </div>
    </div>
  );
}
