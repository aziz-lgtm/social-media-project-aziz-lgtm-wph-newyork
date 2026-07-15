"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { AuthBackground } from "@/components/auth-background";
import { Logo } from "@/components/logo";
import { PasswordInput } from "@/components/password-input";
import { cn } from "@/lib/utils";
import { login } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/axios";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/auth-slice";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

const inputClass =
  "h-12 w-full rounded-xl border bg-neutral-950 px-4 text-sm text-foreground outline-none placeholder:text-neutral-600 focus:ring-1";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ token, user }) => {
      dispatch(setCredentials({ token, user }));
      const returnTo = searchParams.get("returnTo");
      router.replace(returnTo && returnTo.startsWith("/") ? returnTo : "/feed");
    },
    onError: (error) => setApiError(getApiErrorMessage(error)),
  });

  const onSubmit = (values: LoginValues) => {
    setApiError(null);
    mutation.mutate(values);
  };

  const helper = (key: keyof LoginValues) =>
    errors[key] && (
      <p className="mt-1.5 text-sm text-accent-red">{errors[key]?.message}</p>
    );

  const border = (key: keyof LoginValues) =>
    errors[key]
      ? "border-accent-red focus:ring-accent-red"
      : "border-border focus:ring-ring";

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-black px-6 py-15 lg:py-30">
      <AuthBackground />

      {/* Card: 446px, p-[40px_24px] gap-6 desktop / 345px, p-[32px_16px] gap-4 mobile */}
      <div className="relative flex w-full max-w-86.25 flex-col gap-4 rounded-[16px] border border-border bg-black/20 px-4 py-8 backdrop-blur-[20px] lg:max-w-111.5 lg:gap-6 lg:px-6 lg:py-10">
        <div className="flex items-center justify-center gap-3">
          <Logo className="text-foreground" />
          <span className="text-display-xs font-bold">Sociality</span>
        </div>

        <h1 className="text-center text-display-xs font-bold">Welcome back</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-4 lg:gap-6"
          noValidate
        >
          <div>
            <label htmlFor="email" className="text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              className={cn(inputClass, "mt-1.5", border("email"))}
              {...field("email")}
            />
            {helper("email")}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              invalid={!!errors.password}
              className="mt-1.5"
              {...field("password")}
            />
            {helper("password")}
          </div>

          {apiError && (
            <p role="alert" className="text-sm text-accent-red">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="h-12 w-full rounded-full bg-primary-300 text-md font-semibold text-white transition-colors hover:bg-primary-200 disabled:opacity-60"
          >
            {mutation.isPending ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="text-center text-md">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-primary-200">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
