"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { MapContainerProps, TileLayerProps } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Feature, Geometry, GeoJsonObject } from "geojson";
import type { Layer, StyleFunction } from "leaflet";
import { logger } from "@/lib/db";

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
}

interface CountryFeature extends Feature<Geometry> {
  properties: CountryProperties;
}

// World map topology from Natural Earth Data (simplified)
// Using a more detailed GeoJSON source
const geoUrl =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

/**
 * Client-side world map visualization component using react-leaflet
 * Shows countries with color intensities based on visit data
 */
export default function ClientWorldMap({
  countries,
}: {
  countries: CountryData[];
}) {
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [geoData, setGeoData] = useState<MapData | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const mapRef = useRef<HTMLDivElement>(null);

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const mapElement = mapRef.current;
    if (mapElement) {
      mapElement.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (mapElement) {
        mapElement.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  // Fetch GeoJSON data
  useEffect(() => {
    fetch(geoUrl)
      .then((response) => response.json())
      .then((data: MapData) => {
        // Ensure the data has the correct type
        if (!data.type) {
          data.type = "FeatureCollection";
        }
        setGeoData(data);
      })
      .catch((error) => {
        logger.error("Error loading GeoJSON data:", error);
      });
  }, []);

  // Get visit count for a country
  const getCountryVisits = (countryName: string): number => {
    // Enhanced country name mapping
    const normalizedCountryName = countryName.toLowerCase().trim();

    // Common name mappings
    const nameMap: Record<string, string> = {
      "united states of america": "united states",
      "united kingdom": "uk",
      "united states": "united states",
      "russian federation": "russia",
      "korea, republic of": "south korea",
      "viet nam": "vietnam",
    };

    const searchName = nameMap[normalizedCountryName] || normalizedCountryName;

    const country = countries.find(
      (c) =>
        c.name.toLowerCase() === searchName ||
        normalizedCountryName.includes(c.name.toLowerCase()),
    );

    return country?.count || 0;
  };

  // Get color based on visit count - using better color scheme
  const getCountryColor = (countryName: string): string => {
    const visits = getCountryVisits(countryName);
    if (visits === 0) return "#2d3748"; // Dark gray background that fits theme
    if (visits < 10) return "#7f9cf5"; // Light purple
    if (visits < 50) return "#667eea"; // Medium purple
    if (visits < 100) return "#5a67d8"; // Darker purple
    return "#434190"; // Deep purple
  };

  // Style function for GeoJSON features
  const countryStyle: StyleFunction<Feature<Geometry>> = (feature) => {
    const countryFeature = feature as CountryFeature;
    const countryName =
      countryFeature.properties.ADMIN || countryFeature.properties.name || "";
    return {
      fillColor: getCountryColor(countryName),
      weight: 1,
      opacity: 0.8,
      color: "#1a202c", // Dark border that fits with the theme
      fillOpacity: 0.8,
    };
  };

  // Event handlers for GeoJSON features
  const onEachCountry = (feature: Feature<Geometry>, layer: Layer) => {
    const countryFeature = feature as CountryFeature;
    const countryName =
      countryFeature.properties.ADMIN || countryFeature.properties.name || "";
    const visits = getCountryVisits(countryName);

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        const target = e.target;
        target.setStyle({
          fillOpacity: 1,
          weight: 2,
          color: "#fff", // Highlighted border
        });
        target.bringToFront();
        setTooltipContent(`${countryName}: ${visits} visits`);
      },
      mouseout: (e: LeafletMouseEvent) => {
        const target = e.target;
        target.setStyle({
          fillOpacity: 0.8,
          weight: 1,
          color: "#1a202c",
        });
        setTooltipContent("");
      },
    });
  };

  const mapContainerProps: MapContainerProps = {
    center: [10, 0],
    zoom: 1.5,
    style: { height: "100%", width: "100%", background: "#1f2937" },
    attributionControl: false,
    zoomControl: true,
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
  };

  const tileLayerProps: TileLayerProps = {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  };

  return (
    <div
      ref={mapRef}
      className="relative w-full h-[400px] rounded-lg overflow-hidden"
    >
      {geoData ? (
        <MapContainer {...mapContainerProps}>
          {/* Using a dark themed tile layer that fits the UI better */}
          <TileLayer {...tileLayerProps} />
          <GeoJSON
            data={geoData}
            style={countryStyle}
            onEachFeature={onEachCountry}
          />
        </MapContainer>
      ) : (
        <div className="flex items-center justify-center h-full bg-background">
          <div className="animate-pulse">
            <svg
              className="w-8 h-8 text-primary/50"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-400">Loading map data...</p>
          </div>
        </div>
      )}

      {tooltipContent && (
        <div
          className="fixed bg-gray-800/95 border border-gray-700 px-3 py-2 rounded-md text-sm font-medium text-white shadow-xl z-[1000]"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y - 40}px`,
            pointerEvents: "none",
            backdropFilter: "blur(4px)",
          }}
        >
          {tooltipContent}
        </div>
      )}

      {/* Color legend with improved styling */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 bg-gray-800/90 p-3 rounded-md border border-gray-700 text-xs shadow-lg z-[1000]">
        <p className="text-xs font-semibold text-white mb-1">Visit Count</p>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "#2d3748" }}
          ></div>
          <span className="text-gray-300">No visits</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "#7f9cf5" }}
          ></div>
          <span className="text-gray-300">1-9 visits</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "#667eea" }}
          ></div>
          <span className="text-gray-300">10-49 visits</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "#5a67d8" }}
          ></div>
          <span className="text-gray-300">50-99 visits</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "#434190" }}
          ></div>
          <span className="text-gray-300">100+ visits</span>
        </div>
      </div>
    </div>
  );
}
