# Tugas Docker 2: Docker Compose + Trivy

Di tugas pertama kalian jalanin 1 container. Sekarang website-nya punya fitur **daftar dan login**, jadi butuh database. Tugas kalian ada dua bagian:

- **Bagian A:** jalanin 3 container sekaligus pakai Docker Compose.
- **Bagian B:** scan image kalian pakai Trivy, terus beresin temuannya.

## Sebelum mulai: bikin repo baru

Tugas ini dikerjain di **repo baru**, repo tugas pertama biarin aja apa adanya.

1. Extract zip yang baru, terus masuk ke foldernya.
2. Copy `Dockerfile` dan `.dockerignore` dari repo tugas pertama ke folder ini. Dua file itu masih bisa dipakai tanpa diubah.
3. Bikin repo GitHub baru yang **public**, misalnya `driver-duo-compose`, terus `git init` dan sambungin ke situ kayak di tugas pertama. Push-nya nanti aja di langkah 6, setelah semua file Compose-nya jadi.

## Kenalan dulu sama susunannya

```
browser ──► nginx ──► app ──► db
          (port 80)  (3000)  (5432)
```

| Container | Image | Tugasnya |
| --- | --- | --- |
| `nginx` | `nginx` | Pintu depan. Nerima request dari browser di port 80, terus nerusin ke `app` |
| `app` | hasil build `Dockerfile` kalian | Website-nya |
| `db` | `postgres` | Nyimpen akun user |

Cuma `nginx` yang dibuka ke luar. `app` dan `db` nggak perlu `ports`, soalnya container dalam satu file Compose otomatis satu jaringan dan bisa saling manggil **pakai nama service-nya**. Jadi dari `app`, alamat database-nya `db`, bukan `localhost`.

### Environment variable yang dibutuhin

Container `db` (ini aturan dari image `postgres`):

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

Container `app`:

- `DATABASE_URL`, formatnya `postgres://USER:PASSWORD@HOST:5432/NAMA_DB`
- `SESSION_SECRET`, teks acak buat ngamanin cookie login

Tabel di database dibikin otomatis sama aplikasinya, kalian nggak perlu bikin manual.

`/api/health` sekarang ngasih tahu status database juga: `"db":"ok"` atau `"db":"down"`.

---

# Bagian A: Docker Compose

## 1. Bikin file `.env`

Password nggak boleh ditulis langsung di `compose.yaml`, soalnya file itu ikut ke-push ke GitHub. Taruh di file `.env`, yang udah di-ignore sama git.

```bash
cp .env.example .env
```

Isi semua nilainya. Buat `SESSION_SECRET`, bikin teks acaknya pakai:

```bash
openssl rand -hex 32
```

Cek pakai `git status`: `.env` nggak boleh muncul di situ.

## 2. Bikin `compose.yaml`

Bagian `___` kalian isi sendiri. Tulisan `${NAMA}` artinya Compose ngambil nilainya dari file `.env`.

**Service `db`.** Ada dua hal penting di sini. `volumes` biar data nggak hilang waktu container dihapus. `healthcheck` biar Compose tahu kapan database-nya beneran siap.

```yaml
services:
  db:
    image: postgres:___
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ___
      POSTGRES_DB: ___
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 3s
      retries: 10
```

**Service `app`.** Di-build dari `Dockerfile` kalian. `depends_on` di bawah bikin `app` nunggu sampai `db` sehat dulu baru nyala.

```yaml
  app:
    build: ___
    image: driver-duo:2.0
    restart: unless-stopped
    environment:
      DATABASE_URL: postgres://___:___@___:5432/___
      SESSION_SECRET: ___
    depends_on:
      db:
        condition: service_healthy
```

**Service `nginx`.** Satu-satunya yang punya `ports`. File konfigurasinya (dibikin di langkah 3) dimasukin ke container pakai `volumes`.

```yaml
  nginx:
    image: nginx:___
    restart: unless-stopped
    ports:
      - "___:___"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - ___
```

**Volume.** Nama volume yang dipakai `db` harus didaftarin di paling bawah.

```yaml
volumes:
  ___:
```

## 3. Bikin `nginx.conf`

Isinya cuma nyuruh Nginx nerusin semua request ke container `app`. Ingat, manggil container lain pakai nama service-nya.

```nginx
server {
    listen ___;

    location / {
        proxy_pass http://___:___;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 4. Jalanin di laptop

```bash
docker compose up -d --build
docker compose ps
docker compose logs app
curl http://localhost/api/health
```

Beres kalau:

- `docker compose ps` nunjukin 3 container jalan, dan `db` statusnya `healthy`
- `curl` di atas ngasih `"db":"ok"`
- `http://localhost` (tanpa `:3000`) nampilin website-nya

## 5. Buktiin datanya nggak hilang

1. Buka website, klik **Masuk**, pilih **Daftar**, bikin akun.
2. Matiin semua, terus nyalain lagi:

   ```bash
   docker compose down
   docker compose up -d
   ```

3. Login pakai akun tadi. Harusnya masih bisa.

Sekarang coba `docker compose down -v`, nyalain lagi, terus login. Apa yang terjadi, dan kenapa? Jawabannya ikut dikumpulin.

## 6. Deploy ke EC2

1. Push ke repo baru kalian. Pastiin `compose.yaml` dan `nginx.conf` ikut, `.env` nggak.
2. Di Security Group: buka port **80**, tutup port **3000**.
3. Di EC2: hapus container `driver-duo` dari tugas pertama biar nggak bentrok, terus pastiin `docker compose version` jalan (kalau belum, install plugin Compose-nya).
4. Clone repo baru kalian di EC2, terus masuk ke foldernya.
5. Bikin file `.env` di situ. File ini nggak ada di GitHub, jadi harus kalian bikin lagi di sana.
6. `docker compose up -d --build`

Beres kalau `http://<IP-PUBLIC-EC2>` kebuka dari browser laptop dan kalian bisa daftar + login di situ.

---

# Bagian B: Scan pakai Trivy

Trivy itu tool buat nyari celah keamanan (CVE) yang udah diketahui di dalam image. Yang dicek: paket bawaan sistem operasinya dan library yang dipakai aplikasinya.

## 7. Scan image kalian

Trivy nggak perlu di-install, jalanin aja dari container:

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image --scanners vuln --severity HIGH,CRITICAL driver-duo:2.0
```

Baca hasilnya. Tiap temuan punya kolom penting:

- **Library**: paket yang bermasalah
- **Severity**: seberapa parah
- **Installed Version** dan **Fixed Version**: versi yang ada sekarang, dan versi yang udah aman

Simpan screenshot hasil scan pertama ini, nanti dikumpulin sebagai "sebelum".

## 8. Beresin temuannya

Target: **0 temuan HIGH dan CRITICAL**.

Waktu tugas ini dibikin, temuannya ada di dua tempat. Lihat di hasil scan kalian, temuannya ada di bagian mana:

1. **Paket sistem operasi** (bagian yang judulnya nama OS image-nya). Kolom *Fixed Version*-nya ada isinya, artinya udah ada versi yang aman. Berarti paket OS di stage akhir perlu di-update waktu build.
2. **Paket Node.js di `usr/local/lib/node_modules/npm`**. Itu bukan kode website kalian, itu `npm` bawaan image Node. Coba pikir: stage akhir kalian jalan pakai `node server.js`. Masih butuh `npm` nggak?

Daftar CVE berubah tiap hari, jadi hasil kalian bisa beda. Prinsip beresinnya tetap sama: **update yang bisa di-update, buang yang nggak dipakai**.

Ubah `Dockerfile` kalian, build ulang, terus scan lagi sampai bersih:

```bash
docker compose build app
```

Kalau udah bersih, jalanin scan dengan tambahan `--exit-code 1`, terus cek `echo $?`. Hasilnya `0` kalau bersih dan `1` kalau masih ada temuan. Opsi inilah yang nanti dipakai di CI/CD buat nolak image yang nggak aman.

Terakhir, pastiin website-nya masih jalan setelah diubah: `docker compose up -d`, terus coba login.

## Bonus

- Scan juga image `nginx` dan `postgres` yang kalian pakai. Ada temuan nggak? Bisa dikurangin dengan ganti tag?
- Cek `Dockerfile` kalian pakai `trivy config`. Ada saran apa?

## Yang dikumpulin

1. Link repo GitHub yang baru (ada `compose.yaml`, `nginx.conf`, `Dockerfile` yang udah diperbaiki)
2. URL website di EC2 (port 80)
3. Screenshot `docker compose ps`
4. Screenshot website setelah login (kelihatan "Halo, username")
5. Jawaban pertanyaan `down -v` di langkah 5
6. Screenshot hasil Trivy sebelum dan sesudah diperbaiki

## Kalau macet

- **`"db":"down"` di `/api/health`:** cek `DATABASE_URL`. Host-nya harus nama service (`db`), dan user, password, nama database-nya harus sama persis dengan `POSTGRES_*`
- **`password authentication failed` padahal `.env` udah bener:** password database cuma dipakai waktu volume masih kosong. Kalau kalian ganti password setelah database pernah jalan, hapus volume-nya pakai `docker compose down -v`
- **Daftar atau login muncul "Server lagi bermasalah" padahal `"db":"ok"`:** lihat `docker compose logs app`. Kalau ada tulisan `SESSION_SECRET belum di-set`, variabelnya belum nyampe ke container `app`. Cek pakai `docker compose config`
- **`502 Bad Gateway`:** Nginx jalan tapi nggak bisa manggil `app`. Cek nama service dan port di `proxy_pass`, terus `docker compose logs app`
- **Yang muncul halaman "Welcome to nginx":** `nginx.conf` kalian nggak kebaca. Cek path di `volumes`
- **`port is already allocated` di port 80:** ada program lain di port 80, atau container tugas pertama belum dihapus
- **`variable is not set` waktu `docker compose up`:** file `.env` nggak ada di folder yang sama dengan `compose.yaml`
- **Perintah update paket gagal `Permission denied` waktu build:** perintah itu butuh root, jadi harus ditaruh sebelum baris `USER`
