import MangaCard from "./MangaCard";

export default function MangaGrid({ items = [] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {items.map((m) => (
        <MangaCard key={m.id || m._id} manga={m} />
      ))}
    </div>
  );
}
