# Driver Duo

Landing page profil dua pembalap bergaya F1: **Yassir Army Tigreal** (#44) dan **Alveoniro Moskop Epic** (#69). Satu halaman berisi hero, biografi, statistik, dan karier; klik avatar di hero untuk berganti pembalap. Pengunjung juga bisa daftar dan login lewat tombol **Masuk**; akunnya disimpan di PostgreSQL.

Dibangun dengan Next.js 16 (App Router), TypeScript, Tailwind CSS 4, dan PostgreSQL.

## Menjalankan secara lokal

Butuh Node.js 20.9 atau lebih baru.

```bash
npm ci
npm run dev      # mode development di http://localhost:3000
```

Untuk mode produksi:

```bash
npm run build
npm start
```

Halaman utama jalan tanpa database. Fitur daftar dan login butuh dua environment variable:

| Variable | Isi |
| --- | --- |
| `DATABASE_URL` | `postgres://USER:PASSWORD@HOST:5432/NAMA_DB` |
| `SESSION_SECRET` | Teks acak untuk menandatangani cookie login |

## Struktur

| Path | Isi |
| --- | --- |
| `app/page.tsx` | Halaman utama; atur `defaultDriver` dan `autoRotate` di sini |
| `app/masuk/page.tsx` | Halaman daftar dan login |
| `app/api/auth/` | Endpoint `register`, `login`, `logout`, `me` |
| `app/api/health/route.ts` | Endpoint health check, `GET /api/health` (termasuk status database) |
| `components/` | Hero, header, peta sirkuit, dan section Biografi/Statistik/Karier |
| `lib/drivers.ts` | Semua data pembalap (data dummy, ganti di sini) |
| `lib/db.ts`, `lib/auth.ts` | Koneksi PostgreSQL, hash password, dan session cookie |
| `public/drivers/` | Foto cutout pembalap |

## Tugas Docker

Repo ini sengaja belum punya `Dockerfile`, `compose.yaml`, dan manifest Kubernetes. Instruksinya:

1. [TASKS.md](TASKS.md): bikin `Dockerfile` dan deploy ke EC2
2. [TASKS-2.md](TASKS-2.md): Docker Compose (Nginx + app + PostgreSQL) dan scan image pakai Trivy
3. [TASKS-3.md](TASKS-3.md): bangun cluster Kubernetes pakai kubeadm di EC2, lalu deploy ke sana
