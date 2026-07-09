"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const { token, hydrated } = useAppSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(token ? "/feed" : "/login");
  }, [hydrated, token, router]);

  return null;
}
