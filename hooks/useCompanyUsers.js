import { useState, useEffect, useContext } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

/**
 * Real-time hook for company users
 * Listens to Firestore updates for company user changes including role updates
 * Also handles current user role updates for screen visibility
 * Returns company users data and real-time update information
 */
const useCompanyUsers = () => {
  const authContext = useContext(AuthContext);
  const [companyUsers, setCompanyUsers] = useState([]);
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
      "useCompanyUsers: Setting up Firestore listener for company:",
      companyId
    );

    setLoading(true);
    setError(null);

    // Set up Firestore listener for company users updates
    const docRef = doc(
      db,
      "companies",
      companyId.toString(),
      "company_users",
      "current"
    );

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        console.log("useCompanyUsers: Firestore update received");

        if (doc.exists()) {
          const data = doc.data();
          console.log("useCompanyUsers: Document data:", data);

          // Update company users data
          if (data.company_users !== undefined) {
            setCompanyUsers(data.company_users || []);

            // CRITICAL: Check if current user's role was updated by someone else
            if (authContext.user?.id) {
              const currentUserInList = data.company_users?.find(
                (user) => user.user_id === authContext.user.id
              );

              if (
                currentUserInList &&
                currentUserInList.role !== authContext.user.role
              ) {
                console.log(
                  "useCompanyUsers: CURRENT USER ROLE CHANGED BY ANOTHER ADMIN:",
                  {
                    current_user_id: authContext.user.id,
                    old_role: authContext.user.role,
                    new_role: currentUserInList.role,
                    changed_by_user_id: data.changed_user_id,
                    changed_by_name: data.updated_by_name,
                  }
                );

                // Update current user's role in context immediately
                const updatedUser = {
                  ...authContext.user,
                  role: currentUserInList.role,
                };

                console.log(
                  "useCompanyUsers: Updating authContext.user with new role:",
                  updatedUser
                );
                authContext.setUser(updatedUser);

                // Also update in storage for persistence
                import("../auth/storage").then((storage) => {
                  storage.storeUser(updatedUser);
                  console.log("useCompanyUsers: Updated user role in storage");
                });

                // Log the critical role change
                console.log(
                  "useCompanyUsers: ⚠️ ROLE CHANGE DETECTED - Screen visibility should update now!"
                );
              }
            }
          }

          if (data.evac_points !== undefined) {
            setEvacPoints(data.evac_points || []);
          }

          // Set last update information for components to react to changes
          if (data.last_action && data.updated_at) {
            const updateInfo = {
              action: data.last_action,
              changedUserId: data.changed_user_id,
              changedUserName: data.changed_user_name,
              oldRole: data.old_role,
              newRole: data.new_role,
              updatedAt: data.updated_at,
              updatedBy: data.updated_by_name,
            };
            setLastUpdate(updateInfo);
            console.log("useCompanyUsers: Update info set:", updateInfo);

            // Additional logging for current user role changes
            if (data.changed_user_id === authContext.user?.id) {
              console.log(
                "useCompanyUsers: 🔥 THIS UPDATE AFFECTS THE CURRENT USER - Role should change from",
                data.old_role,
                "to",
                data.new_role
              );
            }
          }
        } else {
          console.log("useCompanyUsers: Document does not exist");
        }

        setLoading(false);
      },
      (error) => {
        console.error("useCompanyUsers: Firestore listener error:", error);
        setError("Failed to connect to real-time updates");
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      console.log("useCompanyUsers: Cleaning up Firestore listener");
      unsubscribe();
    };
  }, [
    authContext.user?.company_id,
    authContext.user?.id,
    authContext.user?.role,
  ]);

  return {
    companyUsers,
    evacPoints,
    loading,
    error,
    lastUpdate,
  };
};

export default useCompanyUsers;
