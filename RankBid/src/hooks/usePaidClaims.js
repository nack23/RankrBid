import { useEffect, useState } from "react";
import { API_URL } from "../config";

export default function usePaidClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;

    async function load() {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      try {
        const response = await fetch(`${API_URL}/api/claims`, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load rankings");
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Could not load rankings");
        if (!controller.signal.aborted) {
          setClaims(data.claims || []);
          setError(false);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          console.error("Paid listings fetch error:", loadError);
          setError(true);
        }
      } finally {
        inFlight = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60000);
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [retryKey]);

  return { claims, loading, error, retry: () => setRetryKey((key) => key + 1) };
}
