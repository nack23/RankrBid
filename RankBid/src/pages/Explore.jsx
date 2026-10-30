// The "Explore" page — linked from the category bar's pinned Explore
// button. Placeholder for now; wire up your full listings/backend data
// here whenever you're ready, e.g.:
//
//   const [listings, setListings] = useState([]);
//   useEffect(() => {
//     fetch("/api/listings")
//       .then((res) => res.json())
//       .then(setListings);
//   }, []);

function Explore() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Explore</h1>

      <p className="mt-3 max-w-2xl leading-7 text-gray-600 dark:text-gray-400">
        Every listing across RankBid.ai, in one place. This is placeholder
        content for now — add your full listings/rankings/backend data
        here whenever you're ready.
      </p>

      <div className="mt-10 rounded-2xl border border-dashed border-[#e3dcd2] p-10 text-center text-sm text-gray-500 dark:border-white/15 dark:text-gray-400">
        Data goes here.
      </div>
    </main>
  );
}

export default Explore;
