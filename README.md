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

## Deploy dengan Terraform

Terraform mengelola namespace, aplikasi, PostgreSQL, dan penyimpanan persisten pada cluster Kubernetes yang dipilih oleh kubeconfig. Jalankan dari root repo:

```bash
docker buildx build --platform linux/arm64 -t alveoniro98/driver-duo:1.2 --push .
terraform -chdir=terraform init
terraform -chdir=terraform apply -var="node_public_ip=IP_PUBLIK_NODE"
terraform -chdir=terraform output -raw app_public_url
```

Image `1.2` berisi tampilan hotel terbaru; login ke registry sebelum build/push jika diminta. NodePort `30080` meneruskan trafik ke aplikasi pada port `3000`. Agar URL publik bisa dicapai, buka inbound TCP `30080` pada security group node yang dituju. Untuk akses dari mana saja gunakan sumber `0.0.0.0/0`; lebih aman batasi ke CIDR pengguna yang membutuhkan akses. Gunakan IP publik salah satu node Kubernetes. Setelah deploy, alamatnya `http://IP_PUBLIK_NODE:30080`.

Saat `apply`, Terraform meminta `postgres_password` dan `session_secret`. State dibuat di `terraform/terraform.tfstate`; file ini berisi data rahasia dan sengaja diabaikan Git. Simpan state dengan akses terbatas, atau konfigurasi backend remote terenkripsi sebelum dipakai bersama tim.

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
