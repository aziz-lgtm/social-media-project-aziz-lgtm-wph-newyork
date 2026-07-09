"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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

  if (!hydrated || !token) return null;

  return <>{children}</>;
}
