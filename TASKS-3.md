# Tugas 3: Deploy ke Kubernetes

Di tugas kedua kalian jalanin 3 container pakai Docker Compose di satu server. Sekarang aplikasinya sama persis, tapi kalian deploy ke **cluster Kubernetes yang kalian bangun sendiri** di EC2, dari install sampai jalan.

Tugasnya ada empat bagian:

- **Bagian A:** bangun cluster Kubernetes 2 node pakai kubeadm.
- **Bagian B:** push image ke Docker Hub.
- **Bagian C:** deploy pakai manifest YAML.
- **Bagian D:** buktiin apa yang Kubernetes bisa dan Compose nggak bisa.

Di tiap bagian ada catatan **Materi academy** yang nunjukin modul mana di academy.dhoclo.com yang ngebahas topiknya. Baca modulnya dulu kalau belum, soalnya di tugas ini nggak semua dijelasin ulang.

Course yang kepakai:

- **Kubernetes 101**: https://academy.dhoclo.com/learn/courses/kubernetes-security
- **Docker 101**: https://academy.dhoclo.com/learn/courses/docker-fundamentals

## Sebelum mulai: bikin repo baru

1. Extract zip tugas ini, terus masuk ke foldernya.
2. Copy `Dockerfile` dan `.dockerignore` dari repo tugas kedua (yang udah bersih dari temuan Trivy).
3. Bikin folder `k8s/`. Semua manifest kalian nanti ditaruh di situ.
4. Bikin repo GitHub baru yang **public**, misalnya `driver-duo-k8s`.

`compose.yaml` dan `nginx.conf` nggak dipakai lagi di tugas ini.

## Kenalan dulu sama susunannya

```
browser ──► NodePort 30080 ──► Service app ──► Pod app (x2) ──► Service db ──► Pod db ──► PVC
```

Hampir semua yang kalian tulis di `compose.yaml` punya padanannya di Kubernetes:

| Di Compose | Di Kubernetes |
| --- | --- |
| Satu `service` | `Deployment` (yang jalanin pod-nya) + `Service` (alamatnya) |
| File `.env` | `Secret` |
| `volumes` buat database | `PersistentVolumeClaim` |
| `ports` di nginx | `Service` tipe `NodePort` |
| `healthcheck` + `depends_on` | `readinessProbe` |
| `build: .` | Nggak ada. Image harus di-pull dari registry |

Aturan manggil container lain tetap sama: pakai nama. Dari pod `app`, alamat database-nya nama `Service`-nya, yaitu `db`.

> **Materi academy:** Kubernetes 101, modul 1 "Arsitektur Kubernetes" dan modul 2 "Objek Inti Kubernetes".

---

# Bagian A: Bangun cluster

## 1. Bikin 2 EC2 dan install Kubernetes

Ikutin **Kubernetes 101, modul 4 "Bangun Cluster Latihan Sendiri di AWS"** dari awal sampai akhir. Spesifikasi instance, security group, versi, dan semua perintah install-nya ada di situ, jadi nggak ditulis ulang di sini.

Urutan besarnya biar kalian nggak nyasar:

1. Bikin 2 instance di region Jakarta: 1 control plane, 1 worker.
2. Bikin security group sesuai tabel di modul.
3. Di **kedua** node: matiin swap, atur kernel, install containerd, install `kubeadm`, `kubelet`, `kubectl`.
4. Di control plane: `kubeadm init`, terus siapin kubeconfig.
5. Di worker: `kubeadm join`.
6. Di control plane: install Cilium.

Satu tambahan yang nggak ada di modul: paket `containerd.io` adanya di repo apt milik Docker, bukan di repo bawaan Ubuntu. Jadi **sebelum** `apt-get install containerd.io`, daftarin dulu repo-nya di kedua node:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt-get update
```

Kalau langkah ini kelewat, error-nya `Unable to locate package containerd.io`.

Beres kalau perintah ini nunjukin 2 node dan dua-duanya `Ready`:

```bash
kubectl get nodes
```

Semua perintah `kubectl` di tugas ini dijalanin dari control plane.

> **Materi academy:** Kubernetes 101, modul 4 "Bangun Cluster Latihan Sendiri di AWS". Kalau `kubectl`-nya masih asing, baca juga modul 3 "kubectl Sehari-hari".

## 2. Tambahin satu aturan di security group

Modul 4 cuma ngebuka port antar node. Biar website-nya bisa dibuka dari browser, tambahin satu aturan inbound:

| Sumber | Port | Untuk |
| --- | --- | --- |
| `0.0.0.0/0` | TCP 30080 | Website lewat NodePort |

Port 6443 tetap jangan dibuka ke semua orang. Alasannya ada di modul 4.

## 3. Pasang penyedia storage

Cluster kubeadm yang baru jadi belum punya `StorageClass`. Akibatnya `PersistentVolumeClaim` buat database nanti bakal `Pending` selamanya, karena nggak ada yang bikinin volume-nya.

Pasang `local-path-provisioner`, yang nyimpen data di disk node:

```bash
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.37/deploy/local-path-storage.yaml
```

Terus jadiin dia StorageClass default:

```bash
kubectl patch storageclass local-path \
  -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

Beres kalau `kubectl get storageclass` nunjukin `local-path (default)`.

> **Materi academy:** Kubernetes 101, modul 7 "Volume, PersistentVolumeClaim, dan StorageClass", bagian "StorageClass menentukan siapa yang membuatkan".

---

# Bagian B: Push image ke Docker Hub

Kubernetes nggak bisa nge-build image. Tiap node nge-pull image dari registry, jadi image kalian harus ada di sana dulu.

Ada satu jebakan: node kalian `t4g`, prosesornya **arm64**. Laptop kalian kemungkinan besar **amd64**. Image yang di-build biasa di laptop nggak bakal jalan di node, error-nya `exec format error`. Jadi image-nya harus di-build khusus buat arm64.

## 4. Build buat arm64 dan push

Kerjain di laptop.

**Langkah 1.** Bikin akun Docker Hub kalau belum punya, terus login.

```bash
docker login
```

**Langkah 2.** Pasang emulator biar laptop bisa nge-build image arm64. Cukup sekali.

```bash
docker run --privileged --rm tonistiigi/binfmt --install arm64
```

**Langkah 3.** Build dan langsung push. Nama image di Docker Hub formatnya `username/nama-image:tag`.

```bash
docker buildx build --platform ___ -t ___/driver-duo:1.0 --push .
```

Build-nya lebih lama dari biasanya (beberapa menit), soalnya lewat emulator.

Beres kalau image-nya muncul di halaman Docker Hub kalian dan kolom OS/Arch-nya `linux/arm64`. Pastiin repo Docker Hub-nya **public**.

> **Materi academy:** Docker 101, modul 3 "Arsitektur Docker" (soal registry, `docker push`, `docker login`) dan modul 5 "Image, Layer, dan Build Cache", bagian "Tag itu label yang bisa dipindah, digest nggak". Soal arm64 disinggung di Kubernetes 101 modul 4.

---

# Bagian C: Deploy pakai manifest

Manifest ditulis di laptop, di folder `k8s/`, terus di-push ke GitHub. Di control plane, clone repo-nya dan `kubectl apply` dari situ. Bagian `___` kalian isi sendiri.

## 5. Namespace dan Secret

Semua objek tugas ini ditaruh di namespace `driver-duo`.

```bash
kubectl create namespace driver-duo
```

Password nggak boleh ada di file YAML yang ke-push ke GitHub. Jadi `Secret`-nya dibikin langsung pakai perintah, bukan dari file:

```bash
kubectl -n driver-duo create secret generic driver-duo-secret \
  --from-literal=POSTGRES_USER=___ \
  --from-literal=POSTGRES_PASSWORD=___ \
  --from-literal=POSTGRES_DB=___ \
  --from-literal=SESSION_SECRET=$(openssl rand -hex 32)
```

Cek pakai `kubectl -n driver-duo get secret`.

> **Materi academy:** Kubernetes 101, modul 2 "Objek Inti Kubernetes", bagian "ConfigMap dan Secret: memisahkan setelan dari image" dan "Namespace: sekat, bukan dinding".

## 6. Database: `k8s/db.yaml`

Satu file ini isinya 3 objek, dipisah pakai `---`.

**PersistentVolumeClaim.** Minta disk 1 GB buat data PostgreSQL.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: db-data
  namespace: driver-duo
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: ___
```

**Deployment.** `envFrom` masukin semua isi Secret jadi environment variable, jadi `POSTGRES_USER` dan kawan-kawan otomatis kebaca sama image `postgres`. `PGDATA` udah diisiin, itu biar PostgreSQL nyimpen datanya di subfolder dan nggak protes soal folder yang nggak kosong.

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: db
  namespace: driver-duo
spec:
  replicas: ___
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: ___
    spec:
      containers:
        - name: postgres
          image: postgres:___
          ports:
            - containerPort: ___
          envFrom:
            - secretRef:
                name: ___
          env:
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
          readinessProbe:
            exec:
              command: ["sh", "-c", "pg_isready -U $POSTGRES_USER -d $POSTGRES_DB"]
            periodSeconds: 5
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: ___
```

**Service.** Ngasih database nama tetap di dalam cluster. Nama Service inilah yang dipakai `app` buat nyambung. `selector`-nya harus cocok sama label pod di atas.

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: ___
  namespace: driver-duo
spec:
  selector:
    app: ___
  ports:
    - port: 5432
      targetPort: 5432
```

> **Materi academy:** Kubernetes 101, modul 7 "Volume, PersistentVolumeClaim, dan StorageClass" (bagian "PVC meminta, PV menyediakan") dan modul 5 "Deployment, DaemonSet, StatefulSet, dan Job".

## 7. Aplikasi: `k8s/app.yaml`

**Deployment.** 2 replica, pakai image dari Docker Hub kalian. Tiga variabel `POSTGRES_*` diambil dari Secret satu-satu, terus dirangkai jadi `DATABASE_URL`. Tulisan `$(NAMA)` artinya Kubernetes ngisi nilainya dari variabel yang didefinisiin di atasnya. Satu udah dicontohin, sisanya kalian lanjutin.

`readinessProbe` bikin Kubernetes cuma ngirim request ke pod yang udah siap.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  namespace: driver-duo
spec:
  replicas: ___
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
        - name: app
          image: ___/driver-duo:___
          ports:
            - containerPort: ___
          env:
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: driver-duo-secret
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                ___
            - name: POSTGRES_DB
              valueFrom:
                ___
            - name: SESSION_SECRET
              valueFrom:
                ___
            - name: DATABASE_URL
              value: postgres://$(POSTGRES_USER):$(___)@___:5432/$(___)
          readinessProbe:
            httpGet:
              path: ___
              port: ___
            periodSeconds: 5
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              memory: 256Mi
```

**Service.** Tipe `NodePort` ngebuka satu port di semua node, jadi website bisa dibuka dari luar lewat IP publik node.

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: app
  namespace: driver-duo
spec:
  type: ___
  selector:
    app: ___
  ports:
    - port: 80
      targetPort: ___
      nodePort: 30080
```

> **Materi academy:** Kubernetes 101, modul 2 "Objek Inti Kubernetes" (bagian "Service dan Ingress: cara ditemukan") dan modul 6 "Probe, Resource Request, dan Cara Pod Ditempatkan" (bagian "Tiga probe, tiga pertanyaan berbeda" dan "Requests menentukan tempat, limits menentukan batas").

## 8. Apply dan cek

Push manifest ke GitHub, clone di control plane, terus:

```bash
kubectl apply -f k8s/
kubectl -n driver-duo get pods,svc,pvc -o wide
```

Beres kalau:

- 3 pod statusnya `Running` dan `READY`-nya `1/1`
- PVC `db-data` statusnya `Bound`
- `curl http://localhost:30080/api/health` di control plane ngasih `"db":"ok"`
- `http://<IP-PUBLIC-NODE>:30080` kebuka dari browser laptop, dan kalian bisa daftar + login

Coba buka pakai IP publik control plane, terus pakai IP publik worker. Dua-duanya harusnya bisa. Kenapa? Jawabannya ikut dikumpulin.

---

# Bagian D: Yang Compose nggak bisa

## 9. Pod yang mati hidup lagi sendiri

Lihat nama pod `app`, hapus salah satu, terus langsung lihat lagi:

```bash
kubectl -n driver-duo get pods
kubectl -n driver-duo delete pod ___
kubectl -n driver-duo get pods
```

Jumlah pod `app` balik jadi 2 tanpa kalian ngapa-ngapain. Refresh website-nya selama itu terjadi, tetap kebuka.

Sekarang hapus pod `db`, tunggu sampai `Running` lagi, terus login pakai akun yang tadi kalian bikin. Masih bisa? Kenapa?

## 10. Scale

Naikin `app` jadi 3 replica dengan ngubah angka di `k8s/app.yaml`, terus `kubectl apply` lagi. Lihat pod ketiga muncul, dan perhatiin kolom `NODE`: pod-nya jalan di node mana aja?

## 11. Rolling update dan rollback

Bikin versi baru yang kelihatan bedanya. Di `app/page.tsx`, ganti `defaultDriver="yassir"` jadi `defaultDriver="alveo"`, jadi yang muncul pertama Alveoniro.

1. Build dan push sebagai tag `1.1` (perintahnya sama kayak langkah 4, tag-nya aja yang beda).
2. Ganti tag image di `k8s/app.yaml`, terus apply sambil ngikutin prosesnya:

   ```bash
   kubectl apply -f k8s/app.yaml
   kubectl -n driver-duo rollout status deployment/app
   ```

   Perhatiin pod diganti satu-satu, bukan dimatiin semua sekaligus. Website-nya nggak pernah mati.

3. Refresh browser, sekarang Alveoniro yang muncul duluan.
4. Balikin ke versi sebelumnya dengan satu perintah `kubectl rollout`. Cari tahu perintahnya di modul 5.

> **Materi academy:** Kubernetes 101, modul 5 "Deployment, DaemonSet, StatefulSet, dan Job", bagian "Deployment: sekumpulan pod yang bisa saling menggantikan".

## Bonus

- Tulis `Secret`-nya sebagai file YAML juga, tapi jangan sampai ke-push. Gimana caranya?
- Pasang Ingress controller biar website kebuka di port 80 tanpa `:30080`. Materinya ada di course **Persiapan Ujian CKA**, modul 9 "Service, Ingress, dan Gateway API".

## Yang dikumpulin

1. Link repo GitHub yang baru (ada folder `k8s/` berisi `db.yaml` dan `app.yaml`)
2. Link image di Docker Hub
3. URL website (`http://<IP-PUBLIC-NODE>:30080`)
4. Screenshot `kubectl get nodes -o wide`
5. Screenshot `kubectl -n driver-duo get pods,svc,pvc -o wide`
6. Screenshot `kubectl -n driver-duo rollout history deployment/app`
7. Jawaban dua pertanyaan: kenapa website kebuka dari IP kedua node (langkah 8), dan kenapa akun masih ada setelah pod `db` dihapus (langkah 9)

## Jangan lupa matiin

Selesai ngerjain, **stop kedua instance** biar nggak kena tagihan terus. Hitungan biayanya ada di modul 4. Ingat, IP publik berubah tiap instance dinyalain lagi, jadi kumpulin tugasnya waktu cluster masih nyala.

## Kalau macet

Langkah pertama buat masalah apa pun di pod:

```bash
kubectl -n driver-duo describe pod ___
kubectl -n driver-duo logs ___
```

Bagian `Events` di paling bawah `describe` biasanya langsung nyebut penyebabnya.

- **Node `NotReady`:** CNI belum kepasang atau belum sehat. Cek `cilium status`
- **Pod `Pending`, Events nyebut `unbound immediate PersistentVolumeClaims`:** StorageClass belum ada atau belum jadi default (langkah 3)
- **Pod `Pending`, Events nyebut `Insufficient memory`:** worker kepenuhan. Cek `requests` di manifest
- **`ImagePullBackOff`:** nama atau tag image salah, atau repo Docker Hub-nya masih private
- **`CrashLoopBackOff` dan log-nya `exec format error`:** image-nya bukan arm64. Ulangi langkah 4, pastiin ada `--platform`
- **`CreateContainerConfigError`:** nama Secret atau `key`-nya salah ketik
- **`"db":"down"` di `/api/health`:** cek `DATABASE_URL`. Host-nya harus nama Service database, dan `$(...)` cuma bisa ngambil variabel yang ditulis **di atasnya**
- **Pod `app` `Running` tapi `READY 0/1`:** `readinessProbe`-nya gagal. Cek `path` dan `port`
- **`curl localhost:30080` bisa, dari browser nggak:** aturan security group port 30080 belum ada (langkah 2)
- **Service ada tapi nggak nyambung ke mana-mana:** `kubectl -n driver-duo get endpoints`. Kalau kosong, `selector` di Service nggak cocok sama label pod

> **Materi academy:** kalau course **Kubernetes Troubleshooting** kalian udah kebuka, modul 2 "Pod Stuck: Pending, ImagePullBackOff, CrashLoopBackOff" dan modul 4 "Service Timeout: Lima Tempat Request Bisa Hilang" ngebahas persis masalah-masalah di atas.
