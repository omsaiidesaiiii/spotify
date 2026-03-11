export default function SearchPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Search</h1>
      <div className="mt-4">
        <input 
          type="text" 
          placeholder="What do you want to listen to?" 
          className="w-full glass rounded-full px-6 py-4 outline-none text-white focus:ring-2 focus:ring-white/20 transition-shadow"
        />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 glass rounded-xl flex items-center justify-center font-semibold">
            Category {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
