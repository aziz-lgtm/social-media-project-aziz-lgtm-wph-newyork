"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SplashScreen } from "@/components/splash-screen";
import { useAppSelector } from "@/store/hooks";

/**
 * Wrap private pages. Waits for the session to hydrate from localStorage,
 * then redirects unauthenticated visitors to /login with a return-to path.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, hydrated } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !token) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, token, router, pathname]);

  // Not hydrated yet: legitimately loading, show the splash. Hydrated but
  // no token: a redirect to /login is about to fire, so stay blank rather
  // than flashing the splash right before /login's own UI takes over.
  if (!hydrated) return <SplashScreen />;
  if (!token) return null;

  return <>{children}</>;
}
