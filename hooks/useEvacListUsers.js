import { useState, useEffect, useContext } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

/**
 * Real-time hook for evacuation list users
 * Listens to Firestore updates for evacuation list changes
 * Returns evacuation list data and real-time update information
 */
const useEvacListUsers = (listId = null) => {
  const authContext = useContext(AuthContext);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUsersDrill, setSelectedUsersDrill] = useState([]);
  const [tempContacts, setTempContacts] = useState([]);
  const [companyUsers, setCompanyUsers] = useState([]);
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
      "useEvacListUsers: Setting up Firestore listener for company:",
      companyId
    );

    setLoading(true);
    setError(null);

    // Set up Firestore listener for evac list updates
    const docRef = doc(
      db,
      "companies",
      companyId.toString(),
      "evac_lists",
      "current"
    );

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        console.log("useEvacListUsers: Firestore update received");

        if (doc.exists()) {
          const data = doc.data();
          console.log("useEvacListUsers: Document data:", data);

          // Update evacuation list data
          if (data.selected_users !== undefined) {
            setSelectedUsers(data.selected_users || []);
          }
          if (data.selected_users_drill !== undefined) {
            setSelectedUsersDrill(data.selected_users_drill || []);
          }
          if (data.temp_contacts !== undefined) {
            setTempContacts(data.temp_contacts || []);
          }
          if (data.company_users !== undefined) {
            setCompanyUsers(data.company_users || []);
          }

          // Set last update information for components to react to changes
          if (data.last_action && data.updated_at) {
            const updateInfo = {
              action: data.last_action,
              listId: data.list_id,
              addedContactId: data.added_contact_id,
              addedContactName: data.added_contact_name,
              removedContactId: data.removed_contact_id,
              removedContactName: data.removed_contact_name,
              contactType: data.contact_type,
              updatedAt: data.updated_at,
              updatedBy: data.updated_by_name,
            };
            setLastUpdate(updateInfo);
            console.log("useEvacListUsers: Update info set:", updateInfo);
          }
        } else {
          console.log("useEvacListUsers: Document does not exist");
        }

        setLoading(false);
      },
      (error) => {
        console.error("useEvacListUsers: Firestore listener error:", error);
        setError("Failed to connect to real-time updates");
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      console.log("useEvacListUsers: Cleaning up Firestore listener");
      unsubscribe();
    };
  }, [authContext.user?.company_id]);

  return {
    selectedUsers,
    selectedUsersDrill,
    tempContacts,
    companyUsers,
    loading,
    error,
    lastUpdate,
  };
};

export default useEvacListUsers;
