# Tugas Docker: Deploy Driver Duo ke EC2

Website-nya udah jadi, kodenya nggak perlu diubah. Tugas kalian: bikin `Dockerfile`, push ke GitHub, terus jalanin di EC2 sampai bisa dibuka dari browser.

## Kenalan dulu sama aplikasinya

- Butuh Node.js 20.9 ke atas
- Install: `npm ci`
- Build: `npm run build`
- Jalan di port `3000`
- Cek hidup atau nggak: `/api/health`

### Idenya: build di satu tempat, jalanin di tempat lain

Buat nge-build website ini butuh banyak barang: source code, ratusan package di `node_modules`, dan tools build. Tapi buat **jalanin** hasilnya, barang yang dibutuhin jauh lebih sedikit.

Makanya Dockerfile kalian dibagi jadi 2 bagian (namanya *multi-stage build*):

1. **Stage build**: tempat install dan build. Isinya berantakan dan gede, nggak apa-apa.
2. **Stage akhir**: tempat jalanin website. Isinya cuma hasil build yang diambil dari stage pertama.

Yang jadi image cuma stage akhir. Stage build dibuang, jadi image-nya kecil.

### Apa aja yang diambil dari stage build?

Setelah `npm run build`, ada 3 hal yang perlu kalian ambil:

| Ambil dari stage build | Isinya | Taruh di stage akhir |
| --- | --- | --- |
| isi folder `.next/standalone/` | Server-nya (`server.js`) | langsung di `WORKDIR` |
| folder `.next/static/` | CSS dan JavaScript | `.next/static/` |
| folder `public/` | Foto pembalap | `public/` |

Kalau `WORKDIR` stage akhir kalian `/app`, hasilnya harus kayak gini:

```
/app
├── server.js
├── node_modules/
├── .next/
│   └── static/
└── public/
```

`server.js` dan `node_modules` dua-duanya datang dari dalam `.next/standalone/`. Jadi yang di-copy itu **isi** foldernya, bukan foldernya.

### Cara jalaninnya

```bash
node server.js
```

Bukan `npm start`. Terus tambahin `ENV HOSTNAME=0.0.0.0`, soalnya tanpa itu server-nya cuma nerima koneksi dari dalam container dan nggak bisa dibuka dari browser.

## 1. Bikin `.dockerignore`

Isinya minimal: `node_modules`, `.next`, `.git`, `.env*`.

## 2. Bikin `Dockerfile`

Kerjain urut dari atas ke bawah. Bagian `___` kalian isi sendiri.

### Stage build

**Langkah 1.** Pilih base image Node dan kasih nama stage-nya. Pakai tag versi yang jelas, jangan `latest`.

```dockerfile
FROM node:___ AS builder
WORKDIR /app
```

**Langkah 2.** Copy file daftar dependency dulu, terus install. Sengaja dipisah dari kode lainnya biar Docker bisa nge-cache langkah ini.

```dockerfile
COPY package.json package-lock.json ./
RUN ___
```

**Langkah 3.** Baru copy semua kode, terus build.

```dockerfile
COPY ___ ___
RUN ___
```

### Stage akhir

**Langkah 4.** Mulai stage baru dari base image yang sama. `FROM` kedua ini yang bikin stage build ditinggal.

```dockerfile
FROM node:___
WORKDIR /app
```

**Langkah 5.** Set environment variable-nya. Lihat lagi bagian "Cara jalaninnya" di atas.

```dockerfile
ENV NODE_ENV=production
ENV ___=___
```

**Langkah 6.** Ambil 3 hal dari stage build. Satu udah dicontohin, dua lagi lihat tabel di atas.

```dockerfile
COPY --from=builder /app/public ./public
COPY --from=builder ___ ___
COPY --from=builder ___ ___
```

**Langkah 7.** Ganti ke user non-root. Image Node resmi udah punya user bawaan buat ini, cari tahu namanya.

```dockerfile
USER ___
```

**Langkah 8.** Kasih tahu port-nya dan perintah buat jalanin.

```dockerfile
EXPOSE ___
CMD [___]
```

Bonus: tambahin `HEALTHCHECK` ke `/api/health`.

Tes dulu di laptop:

```bash
docker build -t driver-duo:1.0 .
docker run --rm -p 3000:3000 driver-duo:1.0
```

Buka `http://localhost:3000`. Kalau foto dan styling-nya muncul, lanjut. Cek juga ukurannya pakai `docker images`, targetnya di bawah 350 MB.

## 3. Push ke GitHub

Bikin repo **public**, terus:

```bash
git init
git add .
git commit -m "Driver Duo + Dockerfile"
git branch -M main
git remote add origin <URL-REPO-KALIAN>
git push -u origin main
```

Pastiin `node_modules` dan `.next` nggak ikut ke-push.

## 4. Siapin EC2

- Region: Jakarta (`ap-southeast-3`)
- Instance type: `t3.small`
- Security Group: buka port 22 dan 3000

SSH ke instance-nya, install `git` dan Docker, terus clone:

```bash
git clone <URL-REPO-KALIAN>
cd <NAMA-REPO>
```

## 5. Build dan jalanin

```bash
docker build -t driver-duo:1.0 .
```

Terus jalanin container-nya dengan ketentuan: di background, namanya `driver-duo`, port 3000 ke 3000, dan otomatis nyala lagi kalau instance di-reboot.

Cek:

```bash
docker ps
docker logs driver-duo
curl http://localhost:3000/api/health
```

Beres kalau `http://<IP-PUBLIC-EC2>:3000` kebuka dari browser laptop kalian.

## Yang dikumpulin

1. Link repo GitHub
2. URL website di EC2
3. Screenshot `docker images` dan `docker ps`
4. Screenshot website di browser (address bar kelihatan)

## Kalau macet

- **Halaman polos tanpa styling:** `.next/static` belum ke-copy, atau ditaruh di tempat yang salah
- **Foto nggak muncul:** `public` belum ke-copy
- **`Cannot find module '/app/server.js'`:** yang ke-copy foldernya `standalone`, bukan isinya. Cek pakai `docker run --rm driver-duo:1.0 ls -la`
- **Di EC2 bisa, di browser nggak:** cek Security Group port 3000 dan `HOSTNAME=0.0.0.0`
- **`permission denied` pas jalanin docker:** user belum masuk grup `docker`, logout terus login lagi
- **`port is already allocated`:** masih ada container lama di port 3000
