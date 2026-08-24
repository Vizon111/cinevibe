export default function Loading() {
  return (
    <main className="flex-1">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <div className="h-4 w-16 rounded skeleton-shimmer mb-6" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="relative w-full md:w-72 aspect-[2/3] shrink-0 rounded-xl skeleton-shimmer" />
          <div className="flex-1 flex flex-col gap-4">
            <div className="h-12 w-2/3 rounded skeleton-shimmer" />
            <div className="h-5 w-1/2 rounded skeleton-shimmer" />
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>
    </main>
  );
}
