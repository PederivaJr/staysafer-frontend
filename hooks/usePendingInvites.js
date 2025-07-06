import { useEffect, useState, useContext } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";

export default function usePendingInvites() {
  const { user } = useContext(AuthContext);
  const [state, setState] = useState({
    invites: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.id) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const invitesRef = collection(db, "invites");

    // Query for invites received by the user
    const qReceivedInvites = query(
      invitesRef,
      where("received_by", "==", user.id),
      where("status", "==", "pending"),
      orderBy("created_at", "desc")
    );

    // Query for invites sent by the user
    const qSentInvites = query(
      invitesRef,
      where("sended_by", "==", user.id),
      where("status", "==", "pending"),
      orderBy("created_at", "desc")
    );

    let receivedInvites = [];
    let sentInvites = [];
    let unsubscribeReceived = null;
    let unsubscribeSent = null;

    const combineAndSetInvites = () => {
      // Add type field to distinguish between sent and received
      const receivedWithType = receivedInvites.map((invite) => ({
        ...invite,
        type: "received",
      }));

      const sentWithType = sentInvites.map((invite) => ({
        ...invite,
        type: "sent",
      }));

      // Combine and sort by created_at
      const allInvites = [...receivedWithType, ...sentWithType].sort(
        (a, b) => b.created_at - a.created_at
      );

      setState({
        invites: allInvites,
        loading: false,
        error: null,
      });
    };

    // Subscribe to received invites
    unsubscribeReceived = onSnapshot(
      qReceivedInvites,
      (snapshot) => {
        console.log("Received Invites snapshot:", snapshot.docs.length, "docs");
        receivedInvites = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Received Invite doc:", doc.id, data);
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate() || new Date(),
          };
        });
        combineAndSetInvites();
      },
      (err) => {
        console.error("Received Invites error:", err);
        setState({
          invites: [],
          loading: false,
          error: "Failed to load received invites",
        });
      }
    );

    // Subscribe to sent invites
    unsubscribeSent = onSnapshot(
      qSentInvites,
      (snapshot) => {
        console.log("Sent Invites snapshot:", snapshot.docs.length, "docs");
        sentInvites = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Sent Invite doc:", doc.id, data);
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate() || new Date(),
          };
        });
        combineAndSetInvites();
      },
      (err) => {
        console.error("Sent Invites error:", err);
        setState({
          invites: [],
          loading: false,
          error: "Failed to load sent invites",
        });
      }
    );

    return () => {
      if (unsubscribeReceived) unsubscribeReceived();
      if (unsubscribeSent) unsubscribeSent();
    };
  }, [user?.id]);

  return state;
}
