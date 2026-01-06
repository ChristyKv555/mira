"use client";

export function ConnectPageSkeleton() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="w-full">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-32 bg-muted rounded-md mb-2 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
          </div>
          <div className="h-5 w-96 bg-muted rounded-md relative overflow-hidden">
            <div
              className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>

        {/* Integrations Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div
              key={index}
              className="bg-card border rounded-lg p-6 flex flex-col items-center relative overflow-hidden"
            >
              <div
                className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              />
              {/* Icon Skeleton */}
              <div className="w-12 h-12 rounded-lg bg-muted mb-4" />
              {/* Title Skeleton */}
              <div className="h-5 w-24 bg-muted rounded-md mb-2" />
              {/* Description Skeleton */}
              <div className="h-4 w-full bg-muted rounded-md mb-1" />
              <div className="h-4 w-3/4 bg-muted rounded-md mb-4" />
              {/* Button Skeleton */}
              <div className="h-9 w-full bg-muted rounded-md" />
            </div>
          ))}
        </div>

        {/* Connections List Skeleton */}
        <div className="mt-8">
          <div className="h-7 w-48 bg-muted rounded-md mb-4 relative overflow-hidden">
            <div
              className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
              style={{ animationDelay: "1.0s" }}
            />
          </div>
          <div className="border rounded-lg bg-card p-6">
            <div className="space-y-2">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                    style={{ animationDelay: `${1.1 + index * 0.1}s` }}
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted" />
                    <div>
                      <div className="h-4 w-32 bg-muted rounded-md mb-1" />
                      <div className="h-3 w-40 bg-muted rounded-md" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-16 bg-muted rounded-full" />
                    <div className="h-8 w-8 bg-muted rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
