import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import VisitorCounter from "./VisitorCounter";
import { CategoryIcon, ICONS } from "./CategoryIcons";
import { CATEGORIES, slugify, shortLabel } from "../data/categories";

function categoryHref(category) {
  return category === "All" ? "/" : `/category/${slugify(category)}`;
}

function CategoryBar() {
  const ExploreIcon = ICONS.grid;
  const scrollerRef = useRef(null);
  const location = useLocation();

  // Full-name tooltip shown below the hovered pill, only for categories
  // whose visible label got shortened. `position: fixed` + coordinates
  // computed from the hovered element's own rect — not `position:
  // absolute` inside the horizontally-scrolling row — because
  // `overflow-x-auto` containers clip `overflow-y` in most browsers too,
  // which would hide an absolutely-positioned tooltip below the row.
  const [tooltip, setTooltip] = useState(null);

  function handleEnter(e, fullName) {
    // Shows for every category, even ones like "Analytics" or "Other"
    // whose pill label is already the full name — hovering always
    // brings up the tooltip.
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      label: fullName,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 6,
    });
  }

  function handleLeave() {
    setTooltip(null);
  }

  // Active category comes from the current route now — "All" on the
  // homepage, or whichever category's slug is in the URL — so it stays
  // correct on refresh, back/forward, and direct links, not just clicks.
  const activeHref =
    location.pathname === "/category/" ? "/" : location.pathname;

  // Keep the category selected by the current route visible in the strip.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const active = scroller?.querySelector('[aria-current="page"]');
    if (!scroller || !active) return;
    const activeRect = active.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const left = scroller.scrollLeft + activeRect.left - scrollerRect.left - (scroller.clientWidth - activeRect.width) / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeHref]);

  return (
    <>
      {/* =========================
          CATEGORY BAR
          A cream, fully-rounded pill floating below the navbar —
          "All" solid orange, everything else plain icon + label,
          "Explore" as a plain orange link pinned to the right.
          Each item routes to its own /category/:slug page.
      ========================== */}

      <section className="w-full px-4 pt-3 pb-1 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1000px]">
          <div
            className="
              flex
              items-stretch
              gap-1
              rounded-full
              bg-[#f5f1ea]
              px-1.5
              py-1
              sm:px-2
              sm:py-1.5
              shadow-[0_1px_2px_rgba(20,15,10,0.03)]
              dark:bg-[#302a26]
            "
          >
            <div
              ref={scrollerRef}
              className="
                flex-1
                overflow-x-auto
                scroll-smooth
                [scrollbar-width:none]
                [-ms-overflow-style:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              <div className="flex w-max min-w-full items-center gap-0.5">
                {CATEGORIES.map((category) => {
                  const href = categoryHref(category);
                  const isActive = href === activeHref;

                  return (
                    <Link
                      key={category}
                      to={href}
                      aria-current={isActive ? "page" : undefined}
                      onMouseEnter={(e) => handleEnter(e, category)}
                      onMouseLeave={handleLeave}
                      className={`
                        inline-flex
                        shrink-0
                        items-center
                        gap-1
                        whitespace-nowrap
                        rounded-full
                        px-2.5
                        py-1.5
                        text-[13px]
                        font-semibold
                        transition-all
                        duration-200
                        ease-out
                        sm:gap-1.5
                        sm:px-3.5
                        sm:py-2
                        sm:text-sm
                        ${
                          isActive
                            ? "bg-[#ed7656] text-white shadow-[0_4px_10px_-3px_rgba(237,118,86,0.45)]"
                            : "text-[#57514b] hover:bg-white/70 hover:text-[#1c1a18] dark:text-[#e1d9d4] dark:hover:bg-white/10 dark:hover:text-white"
                        }
                      `}
                    >
                      <CategoryIcon
                        name={category}
                        className={`h-[15px] w-[15px] shrink-0 sm:h-[16px] sm:w-[16px] ${
                          isActive ? "text-white" : "text-[#a89d90] dark:text-[#aa6854]"
                        }`}
                      />
                      {shortLabel(category)}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Pinned Explore — plain orange text + icon, no box, just a
                thin divider before it. Icon-only on phones so it doesn't
                eat the limited width away from the scrollable categories;
                the label comes back from `sm:` up. */}
            <div className="flex shrink-0 items-center gap-1.5 pl-1 sm:gap-2">
              <span className="h-5 w-px bg-[#e3dcd2] dark:bg-[#55453d]" />
              <Link
                to="/explore"
                aria-label="Explore"
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  whitespace-nowrap
                  rounded-full
                  px-2.5
                  py-1.5
                  text-[13px]
                  font-semibold
                  text-[#ed7656]
                  transition
                  hover:bg-white/70
                  sm:px-3.5
                  sm:py-2
                  sm:text-sm
                  dark:hover:bg-white/10
                "
              >
                <ExploreIcon className="h-[15px] w-[15px] shrink-0 sm:h-[16px] sm:w-[16px]" />
                <span className="hidden sm:inline">Explore</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          MOBILE VISITOR STAT
          Same bordered pill used everywhere else — sits below the
          category pill in its own row so it never blends into it.
      ========================== */}

      <div className="flex justify-center px-4 pb-2 pt-1 lg:hidden">
        <VisitorCounter variant="card" />
      </div>

      {/* =========================
          FULL-NAME HOVER TOOLTIP
          One shared tooltip, positioned with `fixed` + coordinates from
          the hovered pill's own rect so it always shows below the item
          regardless of the row's horizontal scroll position.
      ========================== */}

      {tooltip &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: tooltip.x,
              top: tooltip.y,
              transform: "translateX(-50%)",
            }}
            className="
              pointer-events-none
              z-[999]
              whitespace-nowrap
              rounded-md
              border
              border-[#e5e0d8]
              bg-white
              px-2.5
              py-1
              text-xs
              font-medium
              text-[#3a352f]
              shadow-[0_4px_12px_rgba(20,15,10,0.12)]
              dark:border-white/15
              dark:bg-[#2a2622]
              dark:text-gray-100
            "
          >
            {tooltip.label}
          </div>,
          document.body
        )}
    </>
  );
}

export default CategoryBar;
