// import { useEffect, useState, useContext } from "react";
// import { doc, onSnapshot } from "firebase/firestore";
// import { AuthContext } from "../context/AuthContext";
// import { db } from "../firebase";

// export default function useCheckinsRealtime() {
//   const { evacuation } = useContext(AuthContext);
//   const [checkinsData, setCheckinsData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!evacuation?.list_id) {
//       console.log(
//         "useCheckinsRealtime: No evacuation or list_id, clearing data"
//       );
//       setCheckinsData(null);
//       setLoading(false);
//       setError(null);
//       return;
//     }

//     const listId = evacuation.list_id;
//     const checkinsDocRef = doc(db, "checkins_ui", String(listId));

//     console.log(
//       "useCheckinsRealtime: Setting up listener for list_id:",
//       listId,
//       "evacuation_id:",
//       evacuation.evacuation_id
//     );
//     setLoading(true);
//     setError(null);

//     // Subscribe to real-time checkin updates
//     const unsubscribe = onSnapshot(
//       checkinsDocRef,
//       (docSnapshot) => {
//         console.log(
//           "useCheckinsRealtime: Snapshot received for list_id:",
//           listId
//         );
//         console.log(
//           "useCheckinsRealtime: Document exists:",
//           docSnapshot.exists()
//         );

//         if (docSnapshot.exists()) {
//           const data = docSnapshot.data();
//           console.log("useCheckinsRealtime: Document data:", {
//             list_id: data.list_id,
//             evacuation_id: data.evacuation_id,
//             checkins_count: data.selected_users_checkins?.length || 0,
//             updated_at: data.updated_at,
//           });

//           // Verify this document matches our current evacuation
//           if (data.evacuation_id === evacuation.evacuation_id) {
//             console.log(
//               "useCheckinsRealtime: Data matches current evacuation, updating state"
//             );
//             setCheckinsData(data.selected_users_checkins || []);
//             setError(null);
//           } else {
//             console.log(
//               "useCheckinsRealtime: Data is for different evacuation, ignoring",
//               {
//                 document_evacuation_id: data.evacuation_id,
//                 current_evacuation_id: evacuation.evacuation_id,
//               }
//             );
//           }
//         } else {
//           console.log(
//             "useCheckinsRealtime: No document found for list_id:",
//             listId
//           );
//           setCheckinsData([]);
//         }
//         setLoading(false);
//       },
//       (err) => {
//         console.error("useCheckinsRealtime: Firestore error:", err);
//         setError("Failed to load checkins updates");
//         setLoading(false);
//       }
//     );

//     return () => {
//       console.log(
//         "useCheckinsRealtime: Cleaning up listener for list_id:",
//         listId
//       );
//       unsubscribe();
//     };
//   }, [evacuation?.list_id, evacuation?.evacuation_id]); // Also depend on evacuation_id

//   // Function to merge real-time checkins data with existing user data
//   const mergeCheckinsWithUsers = (existingUsers, realtimeCheckins) => {
//     if (!existingUsers || !realtimeCheckins) return existingUsers;

//     return existingUsers.map((user) => {
//       // Find matching user in real-time checkins data
//       const updatedCheckins = realtimeCheckins.find(
//         (checkinUser) => checkinUser.user_to_list_id === user.user_to_list_id
//       );

//       if (updatedCheckins && updatedCheckins.checkins) {
//         // Merge user data with updated checkins
//         return {
//           ...user,
//           checkins: updatedCheckins.checkins,
//         };
//       }

//       return user;
//     });
//   };

//   return {
//     checkinsData,
//     loading,
//     error,
//     mergeCheckinsWithUsers,
//   };
// }

// import { useEffect, useState, useContext } from "react";
// import { doc, onSnapshot } from "firebase/firestore";
// import { AuthContext } from "../context/AuthContext";
// import { db } from "../firebase";

// export default function useCheckinsRealtime() {
//   const { evacuation } = useContext(AuthContext);
//   const [checkinsData, setCheckinsData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!evacuation?.evacuation_id) {
//       console.log("useCheckinsRealtime: No evacuation, clearing data");
//       setCheckinsData(null);
//       setLoading(false);
//       setError(null);
//       return;
//     }

//     const evacuationId = evacuation.evacuation_id;
//     const checkinsDocId = `evacuation_${evacuationId}`;
//     const checkinsDocRef = doc(db, "checkins_ui", checkinsDocId);

//     console.log(
//       "useCheckinsRealtime: Setting up listener for evacuation_id:",
//       evacuationId,
//       "document:",
//       checkinsDocId
//     );
//     setLoading(true);
//     setError(null);

//     // Subscribe to real-time checkin updates
//     const unsubscribe = onSnapshot(
//       checkinsDocRef,
//       (docSnapshot) => {
//         console.log(
//           "useCheckinsRealtime: Snapshot received for evacuation_id:",
//           evacuationId
//         );
//         console.log(
//           "useCheckinsRealtime: Document exists:",
//           docSnapshot.exists()
//         );

//         if (docSnapshot.exists()) {
//           const data = docSnapshot.data();
//           console.log("useCheckinsRealtime: Document data:", {
//             evacuation_id: data.evacuation_id,
//             list_id: data.list_id,
//             checkins_count: data.selected_users_checkins?.length || 0,
//             updated_at: data.updated_at,
//           });

//           console.log(
//             "useCheckinsRealtime: Updating checkins state with fresh data"
//           );
//           setCheckinsData(data.selected_users_checkins || []);
//           setError(null);
//         } else {
//           console.log(
//             "useCheckinsRealtime: No document found for evacuation_id:",
//             evacuationId
//           );
//           setCheckinsData([]);
//         }
//         setLoading(false);
//       },
//       (err) => {
//         console.error("useCheckinsRealtime: Firestore error:", err);
//         setError("Failed to load checkins updates");
//         setLoading(false);
//       }
//     );

//     return () => {
//       console.log(
//         "useCheckinsRealtime: Cleaning up listener for evacuation_id:",
//         evacuationId
//       );
//       unsubscribe();
//     };
//   }, [evacuation?.evacuation_id]); // Only depend on evacuation_id now

//   // Function to merge real-time checkins data with existing user data
//   const mergeCheckinsWithUsers = (existingUsers, realtimeCheckins) => {
//     if (!existingUsers || !realtimeCheckins) return existingUsers;

//     return existingUsers.map((user) => {
//       // Find matching user in real-time checkins data
//       const updatedCheckins = realtimeCheckins.find(
//         (checkinUser) => checkinUser.user_to_list_id === user.user_to_list_id
//       );

//       if (updatedCheckins && updatedCheckins.checkins) {
//         // Merge user data with updated checkins
//         return {
//           ...user,
//           checkins: updatedCheckins.checkins,
//         };
//       }

//       return user;
//     });
//   };

//   return {
//     checkinsData,
//     loading,
//     error,
//     mergeCheckinsWithUsers,
//   };
// }

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
    if (!evacuation?.evacuation_id) {
      console.log("useCheckinsRealtime: No evacuation, clearing data");
      setCheckinsData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const evacuationId = evacuation.evacuation_id;
    const checkinsDocId = `evacuation_${evacuationId}`;
    const checkinsDocRef = doc(db, "checkins_ui", checkinsDocId);

    console.log(
      "useCheckinsRealtime: Setting up listener for evacuation_id:",
      evacuationId,
      "document:",
      checkinsDocId
    );
    setLoading(true);
    setError(null);

    let isActive = true;

    // Add a small delay to ensure Firestore document is created first
    const timeoutId = setTimeout(() => {
      if (!isActive) return;

      // Subscribe to real-time checkin updates
      const unsubscribe = onSnapshot(
        checkinsDocRef,
        (docSnapshot) => {
          if (!isActive) return;

          console.log(
            "useCheckinsRealtime: Snapshot received for evacuation_id:",
            evacuationId
          );
          console.log(
            "useCheckinsRealtime: Document exists:",
            docSnapshot.exists()
          );

          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            console.log("useCheckinsRealtime: Document data:", {
              evacuation_id: data.evacuation_id,
              list_id: data.list_id,
              checkins_count: data.selected_users_checkins?.length || 0,
              updated_at: data.updated_at,
            });

            console.log(
              "useCheckinsRealtime: Updating checkins state with fresh data"
            );
            setCheckinsData(data.selected_users_checkins || []);
            setError(null);
          } else {
            console.log(
              "useCheckinsRealtime: No document found for evacuation_id:",
              evacuationId
            );
            setCheckinsData([]);
          }
          setLoading(false);
        },
        (err) => {
          if (!isActive) return;
          console.error("useCheckinsRealtime: Firestore error:", err);
          setError("Failed to load checkins updates");
          setLoading(false);
        }
      );

      // Store unsubscribe function for cleanup
      return () => {
        if (unsubscribe) {
          console.log(
            "useCheckinsRealtime: Cleaning up listener for evacuation_id:",
            evacuationId
          );
          unsubscribe();
        }
      };
    }, 500); // 500ms delay to allow backend to create Firestore document

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [evacuation?.evacuation_id]);

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
