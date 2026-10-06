export type DriverId = "yassir" | "alveo";

type Point = { x: number; y: number };

export type Driver = {
  id: DriverId;
  first: string;
  last: string;
  number: string;
  city: string;
  province: string;
  photo: string;
  points: [string, string, string];
  track: { path: string; pin: Point; nodes: Point[] };
  bio: {
    lahir: string;
    asal: string;
    tim: string;
    debut: string;
    kendaraan: string;
    text: string;
  };
  stats: [label: string, value: string][];
  karier: [tahun: string, tim: string, catatan: string][];
};

// Semua angka, bio, dan riwayat karier adalah data dummy — ganti di sini.
export const drivers: Record<DriverId, Driver> = {
  yassir: {
    id: "yassir",
    first: "Yassir Army",
    last: "Tigreal",
    number: "44",
    city: "Tangerang Selatan",
    province: "Banten",
    photo: "/drivers/yassir-army-tigreal.webp",
    points: ["198", "341", "4215"],
    track: {
      path: "M56 44 C30 50 14 70 16 96 C18 124 48 134 68 126 C92 116 104 84 116 70 C126 86 134 112 160 118 L196 118 C218 110 228 86 220 64 C214 50 200 42 184 42",
      pin: { x: 196, y: 118 },
      nodes: [
        { x: 56, y: 44 },
        { x: 18, y: 76 },
        { x: 30, y: 112 },
        { x: 68, y: 126 },
        { x: 116, y: 70 },
        { x: 132, y: 96 },
        { x: 160, y: 118 },
        { x: 220, y: 80 },
        { x: 184, y: 42 },
      ],
    },
    bio: {
      lahir: "12 Maret 2001",
      asal: "Tangerang Selatan, Banten",
      tim: "Scuderia Garuda",
      debut: "2022",
      kendaraan: "Vario 125 · Vario 150 · Vario Thailook Racing",
      text: "Tumbuh di sirkuit gokart Sentul, Yassir dikenal dengan gaya balap agresif di tikungan lambat dan konsistensi di balapan basah. Debut kelas utama pada 2022, podium pertama diraih di musim keduanya.",
    },
    stats: [
      ["Balapan", "68"],
      ["Podium", "14"],
      ["Kemenangan", "5"],
      ["Pole", "3"],
      ["Lap Tercepat", "7"],
    ],
    karier: [
      ["2026", "Scuderia Garuda", "Peringkat 3 klasemen sementara, 2 kemenangan"],
      ["2024–25", "Scuderia Garuda", "Podium pertama (Sepang), 9 podium total"],
      ["2022–23", "Nusantara GP Junior", "Rookie of the Year 2022"],
      ["2018–21", "Gokart Nasional", "Juara nasional 2 kali"],
    ],
  },
  alveo: {
    id: "alveo",
    first: "Alveoniro",
    last: "Moskop Epic",
    number: "69",
    city: "Sukabumi",
    province: "Jawa Barat",
    photo: "/drivers/alveoniro-moskop.webp",
    points: ["227", "374", "4987"],
    track: {
      path: "M168 30 C120 32 60 50 36 62 C14 74 10 90 18 110 C28 130 20 150 36 160 C56 170 68 136 76 124 C90 150 118 148 128 140 C136 130 128 100 128 94 C148 92 170 90 184 82 C208 72 226 62 224 48 C218 30 196 28 168 30 Z M184 82 C170 70 156 46 168 30 M76 124 C70 110 66 102 70 100",
      pin: { x: 184, y: 82 },
      nodes: [
        { x: 168, y: 30 },
        { x: 224, y: 48 },
        { x: 18, y: 84 },
        { x: 30, y: 142 },
        { x: 76, y: 124 },
        { x: 70, y: 100 },
        { x: 98, y: 148 },
        { x: 128, y: 94 },
      ],
    },
    bio: {
      lahir: "28 Juli 2002",
      asal: "Sukabumi, Jawa Barat",
      tim: "Scuderia Garuda",
      debut: "2023",
      kendaraan: "Nmax · Aerox · Suzuki Smash",
      text: "Alveoniro memulai dari balap motor sebelum pindah ke roda empat. Ahli manajemen ban dan strategi satu pit stop, ia mencetak kemenangan pertamanya hanya di balapan kesepuluh.",
    },
    stats: [
      ["Balapan", "52"],
      ["Podium", "11"],
      ["Kemenangan", "4"],
      ["Pole", "2"],
      ["Lap Tercepat", "5"],
    ],
    karier: [
      ["2026", "Scuderia Garuda", "Peringkat 4 klasemen sementara, 1 kemenangan"],
      ["2024–25", "Scuderia Garuda", "Kemenangan perdana (Mandalika)"],
      ["2023", "Nusantara GP Junior", "Runner-up klasemen"],
      ["2019–22", "Balap Motor Regional", "Juara Jawa Barat 2021"],
    ],
  },
};

export const driverIds = Object.keys(drivers) as DriverId[];
