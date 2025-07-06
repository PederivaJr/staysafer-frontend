import { useEffect, useState, useContext } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";

export default function useCompanyUsers() {
  const { user } = useContext(AuthContext);
  const [state, setState] = useState({
    companyUsers: [],
    evacPoints: [],
    loading: true,
    error: null,
    lastUpdate: null,
  });

  useEffect(() => {
    if (!user?.company_id) {
      console.log("useCompanyUsers: No user or company_id found");
      setState({
        companyUsers: [],
        evacPoints: [],
        loading: false,
        error: null,
        lastUpdate: null,
      });
      return;
    }

    const companyId = user.company_id;

    console.log(
      "useCompanyUsers: Setting up Firestore listener for company_id:",
      companyId
    );

    // Listen to the company's users collection
    const companyUsersDocRef = doc(
      db,
      "companies",
      String(companyId),
      "company_users",
      "current"
    );

    console.log(
      "useCompanyUsers: Document path:",
      `companies/${companyId}/company_users/current`
    );

    let isInitialLoad = true;

    const unsubscribe = onSnapshot(
      companyUsersDocRef,
      (docSnapshot) => {
        const loadType = isInitialLoad ? "INITIAL" : "UPDATE";
        console.log(`useCompanyUsers: ${loadType} Snapshot received!`);
        console.log(
          `useCompanyUsers: ${loadType} Document exists:`,
          docSnapshot.exists()
        );

        if (docSnapshot.exists()) {
          const data = docSnapshot.data();

          console.log(
            `useCompanyUsers: ${loadType} Company users data received:`,
            {
              company_id: data.company_id,
              users_count: data.company_users?.length || 0,
              evac_points_count: data.evac_points?.length || 0,
              last_action: data.last_action,
              changed_user_name: data.changed_user_name,
              old_role: data.old_role,
              new_role: data.new_role,
              updated_at: data.updated_at,
              updated_by: data.updated_by_name,
            }
          );

          // Log the actual users for debugging
          if (data.company_users) {
            console.log(
              `useCompanyUsers: ${loadType} Users list:`,
              data.company_users.map((u) => `${u.name}: ${u.role}`).join(", ")
            );
          }

          setState({
            companyUsers: data.company_users || [],
            evacPoints: data.evac_points || [],
            loading: false,
            error: null,
            lastUpdate: {
              action: data.last_action,
              changedUserId: data.changed_user_id,
              changedUserName: data.changed_user_name,
              oldRole: data.old_role,
              newRole: data.new_role,
              updatedBy: data.updated_by_name,
              updatedAt: data.updated_at?.toDate(),
            },
          });
        } else {
          console.log(
            `useCompanyUsers: ${loadType} No company users document found for company:`,
            companyId
          );
          setState({
            companyUsers: [],
            evacPoints: [],
            loading: false,
            error: null,
            lastUpdate: null,
          });
        }

        isInitialLoad = false;
      },
      (err) => {
        console.error("useCompanyUsers: Firestore error:", err);
        console.error("useCompanyUsers: Error code:", err.code);
        console.error("useCompanyUsers: Error message:", err.message);
        setState({
          companyUsers: [],
          evacPoints: [],
          loading: false,
          error: `Failed to load company users: ${err.message}`,
          lastUpdate: null,
        });
      }
    );

    return () => {
      console.log("useCompanyUsers: Cleaning up Firestore listener");
      unsubscribe();
    };
  }, [user?.company_id]);

  return state;
}
