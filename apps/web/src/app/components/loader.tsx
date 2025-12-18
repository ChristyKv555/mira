export function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground"></div>
        </div>
        <p className="text-sm text-foreground/60">Loading...</p>
      </div>
    </div>
  );
}
