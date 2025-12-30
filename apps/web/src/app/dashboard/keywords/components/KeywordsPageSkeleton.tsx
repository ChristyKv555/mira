"use client";

export function KeywordsPageSkeleton() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="w-full">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-muted rounded-md mb-2 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
          </div>
          <div className="h-5 w-full max-w-3xl bg-muted rounded-md relative overflow-hidden">
            <div
              className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>

        {/* Two Column Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Select Type and Items */}
          <div className="bg-card rounded-lg border p-6">
            {/* Select Type Section */}
            <div className="mb-4">
              <div className="h-6 w-32 bg-muted rounded-md mb-3 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
              </div>
              {/* Tabs Skeleton */}
              <div className="grid w-full grid-cols-2 gap-2">
                <div className="h-10 w-full bg-muted rounded-md relative overflow-hidden">
                  <div
                    className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
                <div className="h-10 w-full bg-muted rounded-md relative overflow-hidden">
                  <div
                    className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>

            {/* Items List Skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded-md mb-3 relative overflow-hidden">
                <div
                  className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="w-full p-3 rounded-lg border bg-card relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <div className="h-4 w-32 bg-muted rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Keywords */}
          <div className="bg-card rounded-lg border p-6">
            <div className="h-6 w-32 bg-muted rounded-md mb-4 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
            </div>

            {/* Selected Item Info Skeleton */}
            <div className="mb-4">
              <div className="h-4 w-full bg-muted rounded-md mb-2 relative overflow-hidden">
                <div
                  className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                  style={{ animationDelay: "0.7s" }}
                />
              </div>
              {/* Input and Button Skeleton */}
              <div className="flex gap-2">
                <div className="h-10 flex-1 bg-muted rounded-md relative overflow-hidden">
                  <div
                    className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                    style={{ animationDelay: "0.8s" }}
                  />
                </div>
                <div className="h-10 w-16 bg-muted rounded-md relative overflow-hidden">
                  <div
                    className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                    style={{ animationDelay: "0.9s" }}
                  />
                </div>
              </div>
            </div>

            {/* Keywords Badges Skeleton */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div
                    key={index}
                    className="h-8 w-24 bg-muted rounded-md relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                      style={{ animationDelay: `${1.0 + index * 0.05}s` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
