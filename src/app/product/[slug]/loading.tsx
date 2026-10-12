export default function ProductLoading() {
  return (
    <div className="container-x grid animate-pulse gap-10 pb-20 pt-10 md:grid-cols-2 md:gap-14 md:pt-12">
      <div className="aspect-[3/4] bg-[var(--line)]" />
      <div className="flex flex-col justify-center gap-4">
        <div className="h-3 w-24 bg-[var(--line)]" />
        <div className="h-8 w-3/4 bg-[var(--line)]" />
        <div className="mt-2 space-y-2">
          <div className="h-3 w-full bg-[var(--line)]" />
          <div className="h-3 w-5/6 bg-[var(--line)]" />
          <div className="h-3 w-4/6 bg-[var(--line)]" />
        </div>
        <div className="mt-6 h-11 w-40 bg-[var(--line)]" />
      </div>
    </div>
  );
}
