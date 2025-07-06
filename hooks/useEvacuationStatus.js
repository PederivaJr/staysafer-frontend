import { useEffect, useState, useContext } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";

export default function useEvacuationStatus() {
  const { user } = useContext(AuthContext);
  const [state, setState] = useState({
    evacuation: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.company_id) {
      console.log("useEvacuationStatus: No user or company_id found");
      setState((prev) => ({
        ...prev,
        loading: false,
        evacuation: null,
      }));
      return;
    }

    const companyId = user.company_id;

    console.log(
      "useEvacuationStatus: Setting up Firestore listener for companyId:",
      companyId
    );

    // Listen to the company's active evacuation collection
    const activeEvacuationRef = collection(
      db,
      "companies",
      String(companyId),
      "active_evacuation"
    );

    console.log(
      "useEvacuationStatus: Collection path:",
      `companies/${companyId}/active_evacuation`
    );

    // Query for active evacuations, ordered by start time (most recent first)
    const q = query(
      activeEvacuationRef,
      where("status", "==", "active"),
      orderBy("evac_start", "desc"),
      limit(1)
    );

    console.log("useEvacuationStatus: Setting up onSnapshot listener...");

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("useEvacuationStatus: Snapshot received!");
        console.log("useEvacuationStatus: Snapshot size:", snapshot.size);
        console.log("useEvacuationStatus: Snapshot empty:", snapshot.empty);
        console.log(
          "useEvacuationStatus: Snapshot docs length:",
          snapshot.docs.length
        );

        if (snapshot.docs.length > 0) {
          const doc = snapshot.docs[0];
          const data = doc.data();

          console.log("useEvacuationStatus: Active evacuation found!");
          console.log("useEvacuationStatus: Document ID:", doc.id);
          console.log(
            "useEvacuationStatus: Document data:",
            JSON.stringify(data, null, 2)
          );

          // Format evacuation data to match existing structure
          const formattedEvacuation = {
            real_event: data.real_event || false,
            drill: data.drill || false,
            evacuation_id: data.evacuation_id,
            list_id: data.list_id,
            evac_start: data.evac_start?.toDate() || null,
            started_by: data.started_by,
            started_by_name: data.started_by_name,
            evac_type_id: data.evac_type_id,
            evac_type_name: data.evac_type_name,
          };

          console.log(
            "useEvacuationStatus: Formatted evacuation:",
            JSON.stringify(formattedEvacuation, null, 2)
          );

          setState({
            evacuation: formattedEvacuation,
            loading: false,
            error: null,
          });
        } else {
          console.log(
            "useEvacuationStatus: No active evacuation found for company:",
            companyId
          );
          setState({
            evacuation: null,
            loading: false,
            error: null,
          });
        }
      },
      (err) => {
        console.error("useEvacuationStatus: Firestore error:", err);
        console.error("useEvacuationStatus: Error code:", err.code);
        console.error("useEvacuationStatus: Error message:", err.message);
        setState({
          evacuation: null,
          loading: false,
          error: `Failed to load evacuation status: ${err.message}`,
        });
      }
    );

    return () => {
      console.log("useEvacuationStatus: Cleaning up Firestore listener");
      unsubscribe();
    };
  }, [user?.company_id]);

  return state;
}
