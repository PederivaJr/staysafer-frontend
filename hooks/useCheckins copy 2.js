import { useEffect, useState, useContext } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";

export default function useCheckinsRealtime() {
  const { evacuation } = useContext(AuthContext);
  const [checkinsData, setCheckinsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!evacuation?.list_id) {
      setCheckinsData(null);
      setLoading(false);
      return;
    }

    const listId = evacuation.list_id;
    const checkinsDocRef = doc(db, "checkins_ui", String(listId));

    console.log(
      "Setting up Firestore listener for checkins updates only, listId:",
      listId
    );
    setLoading(true);

    // Subscribe to real-time checkin updates
    const unsubscribe = onSnapshot(
      checkinsDocRef,
      (docSnapshot) => {
        console.log(
          "Checkins Firestore snapshot received:",
          docSnapshot.exists()
        );

        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          console.log("Checkins update received:", {
            list_id: data.list_id,
            checkins_count: data.selected_users_checkins?.length || 0,
            updated_at: data.updated_at,
          });

          // Only store the checkins data, not the full user list
          setCheckinsData(data.selected_users_checkins || []);
          setError(null);
        } else {
          console.log("No checkins document found for listId:", listId);
          setCheckinsData([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Checkins Firestore error:", err);
        setError("Failed to load checkins updates");
        setLoading(false);
      }
    );

    return () => {
      console.log("Cleaning up checkins Firestore listener");
      unsubscribe();
    };
  }, [evacuation?.list_id]);

  // Function to merge real-time checkins data with existing user data
  const mergeCheckinsWithUsers = (existingUsers, realtimeCheckins) => {
    if (!existingUsers || !realtimeCheckins) return existingUsers;

    return existingUsers.map((user) => {
      // Find matching user in real-time checkins data
      const updatedCheckins = realtimeCheckins.find(
        (checkinUser) => checkinUser.user_to_list_id === user.user_to_list_id
      );

      if (updatedCheckins && updatedCheckins.checkins) {
        // Merge user data with updated checkins
        return {
          ...user,
          checkins: updatedCheckins.checkins,
        };
      }

      return user;
    });
  };

  return {
    checkinsData,
    loading,
    error,
    mergeCheckinsWithUsers,
  };
}
