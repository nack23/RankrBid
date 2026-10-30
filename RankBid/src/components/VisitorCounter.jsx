import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

function VisitorCounter({ variant = "card" }) {
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    online: 0,
  });

  useEffect(() => {
    let visitorId =
      localStorage.getItem("rankbid_visitor_id");

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(
        "rankbid_visitor_id",
        visitorId
      );
    }

    // ========================================
    // GET VISITOR STATS
    // ========================================

    const getStats = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/visitors/stats`
        );

        if (!response.ok) {
          throw new Error(
            `Stats request failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (data.success) {
          setStats({
            total: Number(data.total || 0),
            today: Number(data.today || 0),
            online: Number(data.online || 0),
          });
        }
      } catch (error) {
        console.error(
          "Visitor stats error:",
          error
        );
      }
    };

    // ========================================
    // REGISTER VISITOR
    // ========================================

    const registerVisitor = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/visitors`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              visitorId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Visitor registration failed: ${response.status}`
          );
        }

        await getStats();
      } catch (error) {
        console.error(
          "Visitor registration error:",
          error
        );
      }
    };

    // ========================================
    // HEARTBEAT
    // ========================================

    const sendHeartbeat = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/visitors/heartbeat`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              visitorId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Heartbeat failed: ${response.status}`
          );
        }

        await getStats();
      } catch (error) {
        console.error(
          "Heartbeat error:",
          error
        );
      }
    };

    // Register visitor immediately
    registerVisitor();

    // Update online status every 30 seconds
    const interval = setInterval(
      sendHeartbeat,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ========================================
  // INLINE
  // ========================================

  if (variant === "inline") {
    return (
      <div className="inline-flex shrink-0 items-center whitespace-nowrap text-[13px] leading-none">
        <span className="mr-1.5 text-[10px] text-green-600">
          ●
        </span>

        <span className="font-medium text-[#3f3a35] dark:text-gray-200">
          {stats.online.toLocaleString()} online
        </span>

        <span className="mx-1.5 text-[#c9c0ba] dark:text-white/20">
          ·
        </span>

        <span className="text-[#8a8177] dark:text-gray-400">
          {stats.today.toLocaleString()} visitors today
        </span>

        <span className="mx-1.5 text-[#c9c0ba] dark:text-white/20">
          ·
        </span>

        <Link
          to="/stats"
          className="font-medium text-[#4f4945] transition hover:text-orange-500 dark:text-gray-200 dark:hover:text-orange-400"
        >
          stats →
        </Link>
      </div>
    );
  }

  // ========================================
  // STRIP
  // ========================================

  if (variant === "strip") {
    return (
      <div className="inline-flex shrink-0 items-center whitespace-nowrap text-[12.5px] leading-none">
        <span className="mr-1.5 text-[10px] text-green-600">
          ●
        </span>

        <span className="font-medium text-[#3f3a35] dark:text-gray-200">
          {stats.online.toLocaleString()} online
        </span>

        <span className="mx-1.5 text-[#c2b8ae] dark:text-white/20">
          ·
        </span>

        <span className="text-[#8a8177] dark:text-gray-400">
          {stats.today.toLocaleString()} visitors today
        </span>

        <span className="mx-1.5 text-[#c2b8ae] dark:text-white/20">
          ·
        </span>

        <Link
          to="/stats"
          className="font-medium text-[#4f4945] transition hover:text-orange-500 dark:text-gray-200 dark:hover:text-orange-400"
        >
          stats →
        </Link>
      </div>
    );
  }

  // ========================================
  // CARD
  // ========================================

  return (
    <div
      className="
        inline-flex
        shrink-0
        items-center
        whitespace-nowrap
        rounded-full
        border
        border-[#e8dfd8]
        bg-white
        px-3
        py-1.5
        text-xs
        sm:px-3.5
        sm:py-2
        sm:text-sm
        dark:border-[#3d342e]
        dark:bg-[#211c19]
      "
    >
      {/* ONLINE */}

      <span className="mr-1.5 text-[11px] text-green-600 sm:text-xs">
        ●
      </span>

      <span className="font-medium text-green-700 dark:text-green-400">
        {stats.online.toLocaleString()} online
      </span>

      {/* SEPARATOR */}

      <span className="mx-1 text-[#c9c0ba] dark:text-white/20">
        ·
      </span>

      {/* TODAY */}

      <span className="text-[#756d68] dark:text-gray-400">
        {stats.today.toLocaleString()} visitors today
      </span>

      {/* SEPARATOR */}

      <span className="mx-1 text-[#c9c0ba] dark:text-white/20">
        ·
      </span>

      {/* STATS */}

      <Link
        to="/stats"
        className="
          font-medium
          text-orange-500
          transition
          hover:text-orange-600
          dark:hover:text-orange-400
        "
      >
        stats →
      </Link>
    </div>
  );
}

export default VisitorCounter;
