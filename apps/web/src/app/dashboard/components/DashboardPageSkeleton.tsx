"use client";

export function DashboardPageSkeleton() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="w-full">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-muted rounded-md mb-2 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
          </div>
          <div className="h-6 w-96 bg-muted rounded-md relative overflow-hidden">
            <div
              className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>

        {/* Two Column Grid Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Task Statistics Card Skeleton */}
          <div className="h-[600px] bg-card rounded-lg border p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-32 bg-muted rounded-md relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
              </div>
              <div className="h-9 w-24 bg-muted rounded-md relative overflow-hidden">
                <div
                  className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="bg-card border rounded-lg p-4 relative overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
                  <div className="h-4 w-16 bg-muted rounded-md mb-2" />
                  <div className="h-8 w-12 bg-muted rounded-md" />
                </div>
              ))}
            </div>

            {/* Chart View Skeleton */}
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-32 bg-muted rounded-md" />
                <div className="h-4 w-16 bg-muted rounded-md" />
              </div>
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted" />
                      <div className="h-4 w-24 bg-muted rounded-md" />
                    </div>
                    <div className="h-4 w-16 bg-muted rounded-md" />
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* High Attention Tasks Card Skeleton */}
          <div className="h-[600px] bg-card rounded-lg border p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-muted" />
                <div className="h-6 w-40 bg-muted rounded-md relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
                </div>
                <div className="h-5 w-6 bg-muted rounded-full" />
              </div>
              <div className="h-9 w-20 bg-muted rounded-md relative overflow-hidden">
                <div
                  className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>

            {/* Task Cards Skeleton */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="bg-card border rounded-lg p-4 border-l-4 border-l-muted relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  />
                  <div className="h-5 w-full bg-muted rounded-md mb-2" />
                  <div className="h-4 w-3/4 bg-muted rounded-md mb-3" />
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-16 bg-muted rounded-md" />
                    <div className="h-5 w-24 bg-muted rounded-md" />
                    <div className="h-5 w-20 bg-muted rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Source Based Tasks Skeleton */}
        <div className="mb-6 h-[600px] bg-card rounded-lg border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-32 bg-muted rounded-md relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
            </div>
            <div className="h-9 w-28 bg-muted rounded-md relative overflow-hidden">
              <div
                className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                style={{ animationDelay: "0.6s" }}
              />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-10 w-24 bg-muted rounded-md relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                  style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                />
              </div>
            ))}
          </div>

          {/* Task List Skeleton */}
          <div className="space-y-2 flex-1 overflow-y-auto pr-2">
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="bg-card border rounded-lg p-3 border-l-4 border-l-muted relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-4 w-32 bg-muted rounded-md" />
                      <div className="h-5 w-16 bg-muted rounded-md" />
                    </div>
                    <div className="h-3 w-full bg-muted rounded-md mb-2" />
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-16 bg-muted rounded-md" />
                      <div className="h-3 w-20 bg-muted rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="p-6 border rounded-lg bg-card relative overflow-hidden"
            >
              <div
                className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                style={{ animationDelay: `${1.0 + index * 0.1}s` }}
              />
              <div className="w-6 h-6 rounded-full bg-muted mb-2" />
              <div className="h-5 w-32 bg-muted rounded-md mb-1" />
              <div className="h-4 w-full bg-muted rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
