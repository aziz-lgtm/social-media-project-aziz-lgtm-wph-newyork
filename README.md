# Sociality Frontend MVP Guide (Business • FULL per Endpoint)

[Link Deployment di Vercel](socialitagram.vercel.app)

> **Goal:** Mentee men-deliver MVP FE yang mencakup semua endpoint yang kamu sediakan. Fokus pada end-to-end user flows, UI surfaces, akses/otorisasi, dan acceptance criteria.

## 0 Prinsip Umum

- **Auth required:** Semua aksi privat (like, comment, follow, save, create/delete post, edit profile, feed pribadi, list "my-*") wajib login.
- **Idempotent actions:** Like/Unlike, Follow/Unfollow, Save/Unsave harus aman ditekan berulang (UI tidak dobel-count).
- **Pagination / Infinite:** Feed & listing posts/likes/comments gunakan paging atau infinite scroll. Tampilkan Loading, Empty, dan Error states.
- **Public vs Private:** Halaman publik hanya tampilkan data yang memang public (profile, posts by username, liked posts by user bila memang public sesuai API).
- **Consistency:** Hitung ulang counter (likes, comments, followers) secara konsisten setelah aksi.

[Social Media App API:](https://be-social-media-api-production.up.railway.app/)

### Tech Stack Wajib

- **Next.js + TypeScript** — framework & type safety
- **Tailwind CSS** — styling cepat, utility-first
- **shadcn/ui** — komponen UI siap pakai
- **Redux Toolkit** — state UI lain (client state)
- **TanStack Query (React Query)** — fetching & caching server state
- **Optimistic UI** — UX responsif
- **Day.js** — format waktu/tanggal
- **Zod + React Hook Form** — validasi & form handling

## 1 Authentication & Session

### Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`

### User Stories

- Sebagai user baru, aku bisa daftar akun dan langsung login.
- Sebagai user terdaftar, aku bisa login dan tetap signed-in saat refresh.
- Sebagai user, aku bisa logout dengan jelas.

### UI Surfaces

- **Page:** Register, Login
- **Global:** Auth Guard untuk halaman privat; Persist Session (local storage/cookie) + token attach ke request privat.

### Acceptance

- Register berhasil → diarahkan ke Feed / Onboarding singkat.
- Login salah → pesan error jelas (bukan generic).
- Token tersimpan/terpasang otomatis pada request privat.

## 2 My Profile (Private)

### Endpoints

- `GET /api/me` (profil + quick stats)
- `PATCH /api/me` (update basic profile)

### User Stories

- Aku bisa melihat profilku (avatar, display name, bio, stats: posts, followers, following, likes saved count jika tersedia).
- Aku bisa mengubah informasi dasar profilku.

### UI Surfaces

- **Page:** `/me` (tab: Overview, Posts, Saved, Likes, Settings)
- **Modal/Form:** Edit Profile

### Acceptance

- GET menampilkan data konsisten dengan aktivitas terakhir.
- PATCH menyimpan perubahan dan UI ter-update tanpa reload penuh.

## 3 Users (Public Directory)

### Endpoints

- `GET /api/users/search` (search by name/username)
- `GET /api/users/{username}` (public profile)
- `GET /api/users/{username}/posts` (list posts public)
- `GET /api/users/{username}/likes` (list posts yang user tsb like — sesuai aturan public API)

### User Stories

- Sebagai user, aku bisa mencari user lain.
- Aku bisa melihat profil publik user lain, termasuk daftar post dan (jika diizinkan) post yang mereka like.

### UI Surfaces

- **Page:** Search Users, Public Profile (header profil, grid posts, tab Posts / Likes jika tersedia)

### Acceptance

- Search memiliki debounced query dan empty state.
- Public profile tampil meski viewer tidak login (tapi aksi privat tersembunyi/disabled).

## 4 Feed (Private Timeline)

### Endpoint

- `GET /api/feed` (self + following)

### User Stories

- Sebagai user, aku melihat timeline gabungan post ku dan orang yang ku-follow.
- Aku bisa memuat lebih banyak konten (paging/infinite scroll).

### UI Surfaces

- **Page:** Feed dengan Post Card (image, caption, author, created time, like count, comment count, tombol like/save, link komentar & profil)

### Acceptance

- Infinite load/pagination berfungsi, tidak duplikasi item.
- Empty state jika belum follow siapapun.

## 5 Posts (CRUD Minimal)

### Endpoints

- `POST /api/posts` (create: 1 image + caption)
- `GET /api/posts/{id}` (detail)
- `DELETE /api/posts/{id}` (hapus post sendiri)

### User Stories

- Aku bisa membuat post baru dengan 1 gambar + caption.
- Aku bisa melihat detail post (image besar, caption lengkap, author, counts, actions).
- Aku bisa menghapus post milikku.

### UI Surfaces

- **Modal/Page:** Create Post (drag & drop/upload image, preview, caption)
- **Page:** Post Detail (comments section di bawah)
- **Action:** Delete hanya muncul untuk owner.

### Acceptance

- Setelah create, post muncul di feed & profilku.
- Delete menghilangkan post dari semua list tanpa reload penuh.

## 6 Likes (Reaksi)

### Endpoints

- `POST /api/posts/{id}/like` (Like — idempotent)
- `DELETE /api/posts/{id}/like` (Unlike — idempotent)
- `GET /api/posts/{id}/likes` (List users who liked)
- `GET /api/me/likes` (Get posts I liked)

### User Stories

- Aku bisa like/unlike post di mana saja card muncul.
- Aku bisa melihat siapa saja yang like post tersebut.
- Aku bisa membuka halaman khusus post yang aku like (My Likes).

### UI Surfaces

- Inline action di Post Card & Post Detail.
- **Modal/Drawer:** Liked by (list pengguna yang menyukai post).
- **Page:** My Likes (grid/list post yang pernah aku like).

### Acceptance

- Tombol like menyatu (toggle) dan tidak menggandakan counter.
- My Likes menampilkan data paginated dengan empty state.

## 7 Comments

### Endpoints

- `GET /api/posts/{id}/comments`
- `POST /api/posts/{id}/comments`
- `DELETE /api/comments/{id}` (only owner)

### User Stories

- Aku dapat melihat dan menambah komentar pada sebuah post.
- Aku dapat menghapus komentarku sendiri.

### UI Surfaces

- **Comments Section** di Post Detail: list + composer (input + submit), load-more untuk pagination.
- Action delete hanya muncul untuk pemilik komentar.

### Acceptance

- Setelah kirim komentar, komentar tampil seketika (optimistic) lalu disinkronkan.
- Delete komentar mengurangi counter dan menghapus item dari list.

## 8 Follow (Social Graph)

### Endpoints

- `POST /api/follow/{username}` (Follow — idempotent)
- `DELETE /api/follow/{username}` (Unfollow — idempotent)
- `GET /api/users/{username}/followers` (public)
- `GET /api/users/{username}/following` (public)
- `GET /api/me/followers`
- `GET /api/me/following`

### User Stories

- Aku bisa follow/unfollow user lain dari profil atau dari kartu user di mana pun tampil.
- Aku bisa melihat daftar followers/following user (public list) dan daftar punyaku sendiri.

### UI Surfaces

- **Button:** Follow/Unfollow di profile & di komponen user chip/card.
- **Page/Modal:** Followers, Following (public & my list).

### Acceptance

- Counter followers/following update konsisten di profil.
- Idempotensi: klik berulang tidak memunculkan error/duplikasi.

## 9 Saves (Bookmarks)

### Endpoints

- `POST /api/posts/{id}/save`
- `DELETE /api/posts/{id}/save`
- `GET /api/me/saved`

### User Stories

- Aku dapat menyimpan/unsave post untuk dibaca nanti.
- Aku dapat melihat daftar post yang kusimpan.

### UI Surfaces

- **Toggle Save** pada Post Card & Post Detail.
- **Page:** Saved (grid/list), bisa diakses dari `/me`.

### Acceptance

- Toggle tidak menduplikasi entry.
- Halaman Saved memiliki empty state & pagination.

## 10 Navigasi & IA (Information Architecture)

- **Public:** `/login`, `/register`, `/profile/[username]`, `/users/search`, `/posts/[id]` (detail dapat diakses publik bila API mengizinkan)
- **Private:** `/feed`, `/me` (+ tabs: Posts, Likes, Saved, Settings), `/me/followers`, `/me/following`
- **Shared components:** Post Card, User Chip, Follow Button, Like/Save Button, Comment Composer, Empty/Error/Loading states.

## 11 Permissions & Edge Cases

- **Only Owner:** delete post, delete comment, edit profile.
- **Missing media:** fallback image/placeholder.
- **Private actions while logged out:** redirect ke Login dengan return-to.
- **Rate limits / errors:** tampilkan pesan yang ramah & retry affordance.
- **Optimistic vs Server Truth:** lakukan reconcile setelah respons server datang.

## 12 Non-Functional Requirements (MVP)

- **Performance:** gambar dioptimasi (thumb/fit), pagination per 10–20 item.
- **Accessibility:** fokus ring, alt text gambar post (opsional MVP), warna kontras cukup.
- **Analytics ringan:** event view post, like/unlike, follow/unfollow, save/unsave, comment submit untuk evaluasi UX.

## 13 Deliverables (Checklist per Endpoint → UI)

- [ ] **Auth** register/login → halaman & persist session
- [ ] **/api/me** GET/PATCH → halaman `/me` + edit profil
- [ ] **Users** search/profile/posts/likes → halaman Search & Public Profile + tabs
- [ ] **Feed** GET → halaman `/feed` + infinite scroll
- [ ] **Posts** POST/GET/DELETE → create modal/page, detail page, delete action
- [ ] **Likes** POST/DELETE/GET + me/likes → toggle like, modal "Liked by", halaman My Likes
- [ ] **Comments** GET/POST/DELETE → section komentar lengkap
- [ ] **Follow** POST/DELETE + followers/following + me/* → tombol follow/unfollow + pages
- [ ] **Saves** POST/DELETE + me/saved → toggle save + halaman Saved

## 14 Definition of Done (DoD)

- Semua flow di atas berhasil dipakai oleh user baru tanpa panduan.
- Empty/Error/Loading tertangani di setiap halaman.
- Idempotensi action teruji (rapid click tetap aman, counter akurat).
- Navigasi jelas antara feed ↔ detail ↔ profil.

## 15 Saran Timeline (7 Hari)

1. **Hari 1:** Auth, Session, Layout & Navigation, `/me` GET.
2. **Hari 2:** Feed + Post Card + Like/Save.
3. **Hari 3:** Post Detail + Comments.
4. **Hari 4:** Public Profile + Follow + Users Search.
5. **Hari 5–7:** Create/Delete Post, My Likes, My Saved, Followers/Following pages + QA.

> **Catatan Mentor:** Semua endpoint yang disediakan telah masuk MVP. Jika waktu mepet, prioritaskan urutan timeline di atas supaya tetap end-to-end usable. Pastikan setiap aksi ada feedback visual dan state selalu sinkron dengan server.
