import { useState, useEffect, useContext } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

/**
 * Real-time hook for evacuation points
 * Listens to Firestore updates for evacuation points changes
 * Returns evacuation points data and real-time update information
 */
const useEvacPoints = () => {
  const authContext = useContext(AuthContext);
  const [evacPoints, setEvacPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Only set up listener if we have Firebase, company_id, and user is authenticated
    if (!db || !authContext.user?.company_id) {
      return;
    }

    const companyId = authContext.user.company_id;
    console.log(
      "useEvacPoints: Setting up Firestore listener for company:",
      companyId
    );

    setLoading(true);
    setError(null);

    // Set up Firestore listener for evac points updates
    const docRef = doc(
      db,
      "companies",
      companyId.toString(),
      "evac_points",
      "current"
    );

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        console.log("useEvacPoints: Firestore update received");

        if (doc.exists()) {
          const data = doc.data();
          console.log("useEvacPoints: Document data:", data);

          // Update evacuation points data
          if (data.evac_points !== undefined) {
            setEvacPoints(data.evac_points || []);
          }

          // Set last update information for components to react to changes
          if (data.last_action && data.updated_at) {
            const updateInfo = {
              action: data.last_action,
              evacPointId: data.evac_point_id,
              evacPointName: data.evac_point_name,
              createdEvacPointId: data.created_evac_point_id,
              createdEvacPointName: data.created_evac_point_name,
              deletedEvacPointId: data.deleted_evac_point_id,
              deletedEvacPointName: data.deleted_evac_point_name,
              updatedEvacPointId: data.updated_evac_point_id,
              updatedEvacPointName: data.updated_evac_point_name,
              updatedAt: data.updated_at,
              updatedBy: data.updated_by_name,
            };
            setLastUpdate(updateInfo);
            console.log("useEvacPoints: Update info set:", updateInfo);
          }
        } else {
          console.log("useEvacPoints: Document does not exist");
        }

        setLoading(false);
      },
      (error) => {
        console.error("useEvacPoints: Firestore listener error:", error);
        setError("Failed to connect to real-time updates");
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      console.log("useEvacPoints: Cleaning up Firestore listener");
      unsubscribe();
    };
  }, [authContext.user?.company_id]);

  return {
    evacPoints,
    loading,
    error,
    lastUpdate,
  };
};

export default useEvacPoints;
