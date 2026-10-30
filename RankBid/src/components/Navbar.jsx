import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import VisitorCounter from "./VisitorCounter";

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive =
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`
        group
        relative
        whitespace-nowrap
        text-[13px]
        tracking-wide
        transition
        sm:text-sm
        ${
          isActive
            ? "font-semibold text-[#1c1a18] dark:text-white"
            : "font-medium text-[#57514b] hover:text-[#1c1a18] dark:text-gray-300 dark:hover:text-white"
        }
      `}
    >
      {children}
      <span
        className={`
          absolute
          -bottom-1.5
          left-0
          h-[2px]
          rounded-full
          bg-orange-500
          transition-all
          duration-200
          ${isActive ? "w-full" : "w-0 group-hover:w-full"}
        `}
      />
    </Link>
  );
}

function SearchIcon(props) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M17 17l-3.5-3.5" />
    </svg>
  );
}

function MoonIcon(props) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17 11.3A7 7 0 018.7 3a7 7 0 108.3 8.3z" />
    </svg>
  );
}

function SunIcon(props) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="10" cy="10" r="3.6" />
      <path d="M10 2.3v2M10 15.7v2M3.5 10h-2M18.5 10h-2M5.4 5.4L4 4M16 16l-1.4-1.4M14.6 5.4L16 4M4 16l1.4-1.4" />
    </svg>
  );
}

function RankBidLogo() {
  return (
    <>
      {/* Mobile Logo - Icon Only.
          The icon now comes from an actual image file — drop your logo
          at public/logo.png in the project and it shows up here as-is,
          no more hand-drawn SVG shapes to get wrong. */}
      <Link
        to="/"
        aria-label="RankBid.ai"
        className="flex shrink-0 items-center transition-transform duration-200 hover:scale-[1.03] sm:hidden"
      >
        <img
          src="/logo.png"
          alt="RankBid.lol"
          className="h-10 w-10 object-contain"
        />
      </Link>

      {/* Desktop Full Logo — same image icon, plus the wordmark + tagline
          as plain text next to it (kept as before, just no longer inside
          an SVG since the icon isn't SVG anymore). */}
      <Link
        to="/"
        aria-label="RankBid.lol"
        className="hidden shrink-0 items-center gap-2.5 transition-transform duration-200 hover:scale-[1.02] sm:flex"
      >
        <img
          src="/logo.png"
          alt="RankBid.lol"
          className="h-10 w-10 object-contain lg:h-11 lg:w-11"
        />

        <div className="flex flex-col leading-none">
          <span
            className="translate-y-[6px] text-[22px] font-bold tracking-[-.05em] text-[#111827] dark:text-white lg:text-2xl"
          >
            RankBid<span className="text-orange-500">.lol</span>
          </span>
          <span className="mt-1 text-[8px] font-medium tracking-[0.2em] text-gray-500 dark:text-gray-400">
            BID. RANK. GROW.
          </span>
        </div>
      </Link>
    </>
  );
}

function Navbar() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("rankbid-theme") === "dark"; }
    catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try { localStorage.setItem("rankbid-theme", isDark ? "dark" : "light"); }
    catch { /* The theme still works when storage is disabled. */ }
  }, [isDark]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#eee7dd] bg-white/90 shadow-[0_1px_3px_rgba(20,15,10,0.04)] backdrop-blur-md dark:border-[#332b26] dark:bg-[#1b1714]/95 dark:shadow-none">
      <div className="mx-auto w-full max-w-[1150px] px-4 sm:px-6 lg:px-8">

        <div
          className="
            flex
            h-[70px]
            w-full
            items-center
            lg:h-20
          "
        >

          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <RankBidLogo />
          </div>

          {/* Desktop Visitor Counter, next to the logo */}
          <div className="ml-5 hidden shrink-0 items-center lg:flex">
            <VisitorCounter variant="card" />
          </div>

          {/* Navigation */}
          <div
            className="
              ml-auto
              flex
              shrink-0
              items-center
              gap-5
              sm:gap-7
              lg:gap-8
            "
          >
            <NavLink to="/daily">Daily</NavLink>
            <NavLink to="/categories">Categories</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/rules">Rules</NavLink>

            {/* Search + theme toggle — grouped in one soft pill so they
                read as a single control, not two loose icons. */}
            <div className="ml-1 hidden items-center gap-0.5 rounded-full bg-[#f5f1ea] p-1 sm:flex dark:bg-transparent">
              <button
                type="button"
                aria-label="Search"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-[#8a8177]
                  transition
                  hover:bg-white
                  hover:text-[#1c1a18]
                  hover:shadow-sm
                  dark:text-[#c6bdb7]
                  dark:hover:bg-white/5
                  dark:hover:text-white
                "
              >
                <SearchIcon />
              </button>

              <button
                type="button"
                aria-label="Toggle theme"
                onClick={() => setIsDark((v) => !v)}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-[#8a8177]
                  transition
                  hover:bg-white
                  hover:text-[#1c1a18]
                  hover:shadow-sm
                  dark:text-[#c6bdb7]
                  dark:hover:bg-white/5
                  dark:hover:text-white
                "
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
