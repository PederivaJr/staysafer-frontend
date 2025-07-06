// hooks/useMarkersWithDistance.js
import { useMemo } from "react";
import { getPreciseDistance } from "geolib";

export default function useMarkersWithDistance(markers, currentCoords) {
  return useMemo(() => {
    if (!markers || !currentCoords) return [];
    const updatedMarkers = markers.map((marker) => ({
      ...marker,
      distance: getPreciseDistance(currentCoords, marker.coordinate),
    }));
    return updatedMarkers.sort((a, b) => a.distance - b.distance);
  }, [markers, currentCoords]);
}
