import GridSkeleton from "./GridSkeleton";

/** Full-route loading state: hero placeholder + header bar + grid. Mirrors
 *  the layout of SectionPage/HomePage so there's no visible shift when the
 *  real content streams in. */
export default function PageSkeleton({ withHero = true }: { withHero?: boolean }) {
  return (
    <main className="flex-1">
      {withHero && (
        <div className="h-[60vh] min-h-[420px] bg-surface skeleton-shimmer" aria-hidden="true" />
      )}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="h-8 w-56 rounded skeleton-shimmer" />
          <div className="h-9 w-28 rounded-lg skeleton-shimmer" />
        </div>
        <GridSkeleton count={12} />
      </div>
    </main>
  );
}
