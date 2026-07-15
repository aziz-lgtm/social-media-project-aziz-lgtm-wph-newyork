"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { AuthBackground } from "@/components/auth-background";
import { Logo } from "@/components/logo";
import { PasswordInput } from "@/components/password-input";
import { cn } from "@/lib/utils";
import { register as registerUser } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/axios";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/auth-slice";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(
        /^[a-z0-9_.]+$/i,
        "Only letters, numbers, dots and underscores allowed"
      ),
    email: z.email("Enter a valid email address"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterValues = z.infer<typeof registerSchema>;

const inputClass =
  "h-12 w-full rounded-xl border bg-neutral-950 px-4 text-sm text-foreground outline-none placeholder:text-neutral-600 focus:ring-1";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: ({ token, user }) => {
      dispatch(setCredentials({ token, user }));
      router.replace("/feed");
    },
    onError: (error) => setApiError(getApiErrorMessage(error)),
  });

  const onSubmit = (values: RegisterValues) => {
    setApiError(null);
    mutation.mutate({
      name: values.name,
      username: values.username,
      email: values.email,
      password: values.password,
      ...(values.phone ? { phone: values.phone } : {}),
    });
  };

  const helper = (key: keyof RegisterValues) =>
    errors[key] && (
      <p className="mt-1.5 text-sm text-accent-red">{errors[key]?.message}</p>
    );

  const border = (key: keyof RegisterValues) =>
    errors[key]
      ? "border-accent-red focus:ring-accent-red"
      : "border-border focus:ring-ring";

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-black px-6 py-15 lg:py-30">
      <AuthBackground />

      {/* Card: 523px, p-[40px_24px] gap-6 desktop / 345px, p-[32px_16px] gap-4 mobile */}
      <div className="relative flex w-full max-w-130.75 flex-col gap-4 rounded-[16px] border border-border bg-black/20 px-4 py-8 backdrop-blur-[50px] lg:gap-6 lg:px-6 lg:py-10">
        <div className="flex items-center justify-center gap-3">
          <Logo className="text-foreground" />
          <span className="text-display-xs font-bold">Sociality</span>
        </div>

        <h1 className="text-center text-display-xs font-bold">Register</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 lg:space-y-5"
          noValidate
        >
          <div>
            <label htmlFor="name" className="text-sm font-semibold">
              Name
            </label>
            <input
              id="name"
              placeholder="Enter your name"
              className={cn(inputClass, "mt-1.5", border("name"))}
              {...field("name")}
            />
            {helper("name")}
          </div>

          <div>
            <label htmlFor="username" className="text-sm font-semibold">
              Username
            </label>
            <input
              id="username"
              placeholder="Enter your username"
              autoComplete="username"
              className={cn(inputClass, "mt-1.5", border("username"))}
              {...field("username")}
            />
            {helper("username")}
          </div>

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
            <label htmlFor="phone" className="text-sm font-semibold">
              Number Phone
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your number phone"
              autoComplete="tel"
              className={cn(inputClass, "mt-1.5", border("phone"))}
              {...field("phone")}
            />
            {helper("phone")}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              autoComplete="new-password"
              invalid={!!errors.password}
              className="mt-1.5"
              {...field("password")}
            />
            {helper("password")}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-sm font-semibold">
              Confirm Password
            </label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Enter your confirm password"
              autoComplete="new-password"
              invalid={!!errors.confirmPassword}
              className="mt-1.5"
              {...field("confirmPassword")}
            />
            {helper("confirmPassword")}
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
            {mutation.isPending ? "Submitting…" : "Submit"}
          </button>
        </form>

        <p className="text-center text-md">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary-200">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
