"use client";

export function TasksPageSkeleton() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="w-full">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-muted rounded-md mb-2 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
          </div>
          <div className="h-5 w-96 bg-muted rounded-md relative overflow-hidden">
            <div
              className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>

        {/* Tasks Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            {/* Search Bar Skeleton */}
            <div className="relative flex-1">
              <div className="h-10 w-full bg-muted rounded-md relative overflow-hidden">
                <div
                  className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
            {/* Filter Button Skeleton */}
            <div className="h-10 w-24 bg-muted rounded-md relative overflow-hidden">
              <div
                className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
          </div>
          {/* Settings Button Skeleton */}
          <div className="h-9 w-28 bg-muted rounded-md relative overflow-hidden">
            <div
              className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
              style={{ animationDelay: "0.6s" }}
            />
          </div>
        </div>

        {/* Kanban Board Skeleton */}
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
          {[1, 2, 3].map((columnIndex) => (
            <div key={columnIndex} className="shrink-0 w-80">
              <div className="bg-card rounded-lg border p-4 h-full flex flex-col">
                {/* Column Header Skeleton */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
                    </div>
                    <div className="h-5 w-24 bg-muted rounded-md relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
                    </div>
                    <div className="h-5 w-8 bg-muted rounded-md relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
                    </div>
                  </div>
                </div>

                {/* Tasks Container Skeleton */}
                <div className="flex-1 min-h-[400px] space-y-3">
                  {/* Task Card Skeletons */}
                  {[1, 2, 3].map((taskIndex) => (
                    <div
                      key={taskIndex}
                      className="bg-card border rounded-lg p-4 border-l-4 border-l-muted relative overflow-hidden"
                    >
                      <div
                        className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                        style={{
                          animationDelay: `${columnIndex * 0.1 + taskIndex * 0.05}s`,
                        }}
                      />
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="h-5 flex-1 bg-muted rounded-md" />
                        <div className="h-6 w-16 bg-muted rounded-md shrink-0" />
                      </div>
                      <div className="h-4 w-full bg-muted rounded-md mb-1" />
                      <div className="h-4 w-3/4 bg-muted rounded-md mb-3" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-20 bg-muted rounded-md" />
                          <div className="h-5 w-16 bg-muted rounded-md" />
                        </div>
                        <div className="h-6 w-6 bg-muted rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
