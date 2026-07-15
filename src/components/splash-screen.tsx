/**
 * Self-designed loading/splash screen (no Figma reference) — matches the
 * layout of the reference: wordmark, tagline, and three pulsing dots.
 * Shown while the session hydrates (AuthGuard).
 */
export function SplashScreen() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 700px 400px at 50% 45%, color-mix(in srgb, var(--color-primary-300) 25%, transparent), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-display-sm font-bold text-foreground">Sociality</h1>
          <p className="text-md text-muted-foreground">Elevating Your Social</p>
        </div>

        <div className="flex items-center gap-1.5">
          {/*
            Tailwind's animate-pulse is a slow (2s) opacity fade — at only
            200ms apart the stagger barely reads as motion. A proper
            three-dot loader needs a snappier bounce, which isn't a stock
            Tailwind utility, so it's defined inline via a scoped
            <style> tag (keyframes can't go in a className/style prop).
          */}
          <style>{`
            @keyframes splash-dot-bounce {
              0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
              40% { transform: scale(1); opacity: 1; }
            }
          `}</style>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 rounded-full bg-primary-200"
              style={{
                animation: "splash-dot-bounce 1.1s ease-in-out infinite",
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
