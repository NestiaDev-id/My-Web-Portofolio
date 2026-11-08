import { useState, useEffect, useCallback, useRef } from "react";
import { getApiUrl } from "@/utils/rag";

export interface QueueInfo {
  activeCount: number;
  queuedCount: number;
  maxConcurrency: number;
}

export interface ChatPresenceState {
  activeUsers: number;
  isConnected: boolean;
  queueInfo: QueueInfo | null;
  refreshPresence: () => Promise<void>;
}

const HEARTBEAT_INTERVAL_MS = 20_000; // 20 detik (sesuai TTL Redis 35s)

export function useChatPresence(sessionId: string): ChatPresenceState {
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);

  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  // Send ping heartbeat to register or renew active session in Redis
  const sendPing = useCallback(async () => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) return;

    try {
      const response = await fetch(getApiUrl("/api/v1/chat/presence/ping"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: currentSessionId }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && typeof json.data?.activeUsers === "number") {
          setActiveUsers(json.data.activeUsers);
          setIsConnected(true);
        }
      }
    } catch {
      // Best-effort network failure handling
    }
  }, []);

  // Fetch queue status and fresh active users count
  const fetchPresenceInfo = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/chat/presence"));
      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          if (typeof json.data?.activeUsers === "number") {
            setActiveUsers(json.data.activeUsers);
          }
          if (json.data?.queue) {
            setQueueInfo(json.data.queue);
          }
        }
      }
    } catch {
      // Best-effort
    }
  }, []);

  // Send leave signal on unmount / page exit
  const sendLeave = useCallback(() => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) return;

    const leaveUrl = getApiUrl("/api/v1/chat/presence/leave");
    const payload = JSON.stringify({ sessionId: currentSessionId });

    // 1. Try navigator.sendBeacon with Blob JSON
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon(leaveUrl, blob);
      if (sent) return;
    }

    // 2. Fallback to fetch with keepalive: true (Modern Web Standard)
    try {
      fetch(leaveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Silent catch on window exit
    }
  }, []);

  useEffect(() => {
    // 1. Initial handshake
    sendPing();
    fetchPresenceInfo();

    // 2. Heartbeat timer every 20 seconds
    const interval = setInterval(() => {
      sendPing();
      fetchPresenceInfo();
    }, HEARTBEAT_INTERVAL_MS);

    // 3. Page visibility change & beforeunload listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendPing();
        fetchPresenceInfo();
      } else if (document.visibilityState === "hidden") {
        // Queue beacon when tab is hidden
        sendLeave();
      }
    };

    const handleBeforeUnload = () => {
      sendLeave();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      sendLeave();
    };
  }, [sessionId, sendPing, sendLeave, fetchPresenceInfo]);

  return {
    activeUsers,
    isConnected,
    queueInfo,
    refreshPresence: fetchPresenceInfo,
  };
}

