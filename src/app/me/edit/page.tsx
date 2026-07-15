"use client";

import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar, UserMenu } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getMe, updateMe } from "@/lib/api/me";
import { getApiErrorMessage } from "@/lib/api/axios";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/auth-slice";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];

const editProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9_.]+$/i, "Only letters, numbers, dots and underscores allowed"),
  // API 500s on domestic phone formats ("081234...") but accepts E.164 ("+6281234...").
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\+[0-9]{7,15}$/.test(v),
      "Use international format starting with + (e.g. +6281234567890)"
    ),
  bio: z.string().max(200, "Bio must be 200 characters or fewer").optional(),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

const inputClass =
  "h-11.75 w-full rounded-xl border bg-neutral-950 px-4 text-sm text-foreground outline-none placeholder:text-neutral-600 focus:ring-1";

/** Mobile header matches the pattern established on the profile/add-post pages: back arrow + title + own avatar. */
function MobileHeader() {
  const router = useRouter();
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-black px-4 lg:hidden">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="size-5 text-foreground" />
        </button>
        <span className="text-lg font-bold">Edit Profile</span>
      </div>
      <UserMenu size="mobile" />
    </header>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function EditProfileForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const meQuery = useQuery({ queryKey: ["me"], queryFn: getMe });

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    values: meQuery.data
      ? {
          name: meQuery.data.profile.name,
          username: meQuery.data.profile.username,
          phone: meQuery.data.profile.phone ?? "",
          bio: meQuery.data.profile.bio ?? "",
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (values: EditProfileValues) =>
      updateMe({
        name: values.name,
        username: values.username,
        phone: values.phone ?? "",
        bio: values.bio ?? "",
        ...(avatarFile ? { avatar: avatarFile } : {}),
      }),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      // Navbar reads avatar/name from Redux, not the "me" query — sync both.
      dispatch(setUser(profile));
      toast.success("Profile Success Update", {
        style: {
          background: "var(--color-accent-green)",
          color: "var(--color-white)",
          border: "none",
          borderRadius: "8px",
        },
      });
      router.push("/me");
    },
    onError: (error) => setApiError(getApiErrorMessage(error)),
  });

  const onSubmit = (values: EditProfileValues) => {
    setApiError(null);
    mutation.mutate(values);
  };

  const pickAvatar = (candidate: File | undefined) => {
    if (!candidate) return;
    if (!ACCEPTED_AVATAR_TYPES.includes(candidate.type)) {
      setAvatarError("Only PNG, JPG or WEBP files are allowed.");
      return;
    }
    if (candidate.size > MAX_AVATAR_BYTES) {
      setAvatarError("File must be 5mb or smaller.");
      return;
    }
    setAvatarError(null);
    setAvatarFile(candidate);
    setAvatarPreview(URL.createObjectURL(candidate));
  };

  const helper = (key: keyof EditProfileValues) =>
    errors[key] && (
      <p className="mt-1.5 text-sm text-accent-red">{errors[key]?.message}</p>
    );

  const border = (key: keyof EditProfileValues) =>
    errors[key]
      ? "border-accent-red focus:ring-accent-red"
      : "border-border focus:ring-ring";

  if (meQuery.isPending) {
    return (
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
        <div className="flex flex-col items-center gap-4.25">
          <Skeleton className="size-20 rounded-full lg:size-32.5" />
          <Skeleton className="h-9.75 w-39.75 rounded-full" />
        </div>
        <div className="flex-1 space-y-6 lg:max-w-147.75">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-11.75 w-full rounded-xl" />
          ))}
          <Skeleton className="h-25 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const profile = meQuery.data?.profile;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6 lg:flex-row lg:gap-12">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => pickAvatar(e.target.files?.[0])}
      />

      <div className="flex flex-col items-center gap-4.25">
        <Avatar className="size-20 lg:size-32.5">
          {avatarPreview ? (
            // No AvatarFallback here — it only tracks AvatarImage's load state,
            // and rendering both as flex siblings squeezes them.
            // eslint-disable-next-line @next/next/no-img-element -- local blob: URL, next/image's optimizer can't fetch it
            <img src={avatarPreview} alt="New avatar" className="size-full rounded-full object-cover" />
          ) : (
            <>
              <AvatarImage src={profile?.avatarUrl ?? undefined} alt={profile?.name} />
              <AvatarFallback className="text-xl">
                {profile ? initials(profile.name) : ""}
              </AvatarFallback>
            </>
          )}
        </Avatar>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-9.75 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground"
        >
          Change Photo
        </button>
        {avatarError && <p className="text-sm text-accent-red">{avatarError}</p>}
      </div>

      <div className="flex-1 space-y-6 lg:max-w-147.75 lg:space-y-8">
        <div>
          <label htmlFor="name" className="text-sm font-bold">
            Name
          </label>
          <input
            id="name"
            placeholder="Enter your name"
            className={cn(inputClass, "mt-3", border("name"))}
            {...field("name")}
          />
          {helper("name")}
        </div>

        <div>
          <label htmlFor="username" className="text-sm font-bold">
            Username
          </label>
          <input
            id="username"
            autoComplete="username"
            className={cn(inputClass, "mt-3", border("username"))}
            {...field("username")}
          />
          {helper("username")}
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-bold">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={profile?.email ?? ""}
            disabled
            readOnly
            className={cn(inputClass, "mt-3 cursor-not-allowed opacity-60")}
          />
        </div>

        <div>
          <label htmlFor="phone" className="text-sm font-bold">
            Number Phone
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+6281234567890"
            autoComplete="tel"
            className={cn(inputClass, "mt-3", border("phone"))}
            {...field("phone")}
          />
          {helper("phone")}
        </div>

        <div>
          <label htmlFor="bio" className="text-sm font-bold">
            Bio
          </label>
          <textarea
            id="bio"
            placeholder="Create your bio"
            className={cn(
              "mt-3 h-25 w-full resize-none rounded-xl border bg-neutral-950 p-4 text-sm text-foreground outline-none placeholder:text-neutral-600 focus:ring-1",
              border("bio")
            )}
            {...field("bio")}
          />
          {helper("bio")}
        </div>

        {apiError && (
          <p role="alert" className="text-sm text-accent-red">
            {apiError}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex h-10 w-full items-center justify-center rounded-full bg-primary-300 text-sm font-semibold text-white hover:bg-primary-200 disabled:opacity-60 lg:h-12"
        >
          {mutation.isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default function EditProfilePage() {
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <MobileHeader />
      <main className="mx-auto w-full max-w-90.25 flex-1 px-4 pt-6 pb-32 lg:max-w-198.75 lg:px-0 lg:pt-10">
        <div className="mb-6 hidden items-center gap-3 lg:flex">
          <button type="button" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft className="size-5 text-foreground" />
          </button>
          <h1 className="text-display-xs font-bold">Edit Profile</h1>
        </div>
        <EditProfileForm />
      </main>
    </AuthGuard>
  );
}
