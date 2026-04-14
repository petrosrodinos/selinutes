import { Navbar } from "../../components/Navbar";

const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-xl bg-stone-800/80 border border-stone-700/50 ${className}`} />
);

export const RulesPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(180,83,9,0.08),transparent)] pointer-events-none" />

      <Navbar showBackButton />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <SkeletonBlock className="h-44 w-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10 pb-20 space-y-10">
        <section>
          <SkeletonBlock className="h-9 w-56 mb-3" />
          <SkeletonBlock className="h-5 w-72 mb-6" />
          <SkeletonBlock className="h-56 w-full mb-5" />
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-11/12" />
            <SkeletonBlock className="h-4 w-10/12" />
          </div>
        </section>

        <section className="space-y-4">
          <SkeletonBlock className="h-8 w-72" />
          <SkeletonBlock className="h-44 w-full" />
        </section>

        <section className="space-y-4">
          <SkeletonBlock className="h-8 w-64" />
          <SkeletonBlock className="h-56 w-full" />
        </section>
      </main>
    </div>
  );
};
