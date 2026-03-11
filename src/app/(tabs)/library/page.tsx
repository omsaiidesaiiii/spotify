export default function LibraryPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Your Library</h1>
      <div className="mt-8 space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-20 glass rounded-xl flex items-center px-4 gap-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-md shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold">Saved Item {i + 1}</span>
              <span className="text-sm text-zinc-400">Playlist</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
