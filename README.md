# Bell’s Diary

Migrasi lengkap dari static HTML ke Next.js + Supabase. Desain asli, foto Bell, tulisan awal, palet warna, typography, dan responsive behavior dipertahankan.

## Yang sudah tersedia

- Homepage dinamis: 3 tulisan published terbaru
- Archive `/writings`: semua tulisan published
- Article route `/post/[slug]`
- Supabase Auth untuk satu akun Bell
- Protected admin di `/admin/dashboard`
- Create, edit, delete, save draft, dan publish
- Slug otomatis dan unik
- Upload cover image ke bucket `post-images` (maksimal 5 MB)
- Draft tidak dapat dibaca dari website public karena Row Level Security
- Empty, loading, validation, dan error states
- Mobile navigation dan admin table yang responsive

Tanpa environment variables, public site otomatis memakai tiga tulisan bawaan sebagai preview. Admin baru aktif setelah Supabase disambungkan.

## Menjalankan secara lokal

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

Buka `http://localhost:3000`.

## Setup Supabase satu kali

1. Buat satu project di Supabase.
2. Buka **SQL Editor**, lalu jalankan seluruh isi `supabase/migrations/001_bells_diary.sql`. Script ini membuat tabel, RLS policies, bucket cover image, dan memasukkan 3 tulisan lama.
3. Buka **Authentication → Users → Add user**. Buat akun Bell dengan email dan password. Tidak ada public registration di aplikasi.
4. Salin **Project URL** dan **Anon / Publishable key** dari Supabase Project Settings → API.
5. Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_KEY
```

Jangan masukkan service-role key. Aplikasi sengaja memakai anon/publishable key bersama RLS.

## Deploy ke Vercel satu kali

1. Push folder ini ke repository Git.
2. Import repository di Vercel.
3. Tambahkan dua environment variables yang sama di project Vercel.
4. Deploy.

Setelah setup awal itu, Bell cukup login ke `/admin/login`. Setiap artikel disimpan langsung ke Supabase dan otomatis muncul di website saat statusnya **Published**—tidak perlu mengedit HTML atau deploy ulang per artikel.

## Catatan sebelum live

- Ganti link Instagram dan alamat email di `components/Footer.tsx`.
- Di Supabase Auth, nonaktifkan public sign-ups jika tidak dibutuhkan.
- Tambahkan URL production Vercel ke Supabase **Authentication → URL Configuration**.
- Setelah custom domain tersedia, tambahkan domain tersebut ke konfigurasi redirect Supabase juga.
