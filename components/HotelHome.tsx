"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const rooms = [
  {
    name: "Garden Suite",
    detail: "Teras privat · 42 m² · 2 tamu",
    price: "2.450.000",
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1100&q=85",
    imagePosition: "center 55%",
  },
  {
    name: "Ocean View Room",
    detail: "Balkon laut · 48 m² · 2 tamu",
    price: "3.100.000",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1100&q=85",
    imagePosition: "center 58%",
  },
  {
    name: "Cliffside Villa",
    detail: "Kolam privat · 86 m² · 3 tamu",
    price: "5.800.000",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1100&q=85",
    imagePosition: "center 60%",
  },
];

export default function HotelHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [guests, setGuests] = useState("2");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [status, setStatus] = useState("");

  function searchAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (new Date(checkOut) <= new Date(checkIn)) {
      setStatus("Tanggal check-out harus setelah tanggal check-in.");
      return;
    }
    setStatus(`Pilihan kamar untuk ${guests} tamu, ${checkIn} sampai ${checkOut}.`);
    document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" });
  }

  function chooseRoom(name: string) {
    setSelectedRoom(name);
    setStatus(`${name} dipilih. Isi tanggal untuk melihat detail masa inap.`);
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="hotel-site">
      <section className="stay-hero" id="top" aria-label="Sora House, Uluwatu">
        <header className="stay-header">
          <Link className="stay-brand" href="#top" aria-label="Sora House, halaman utama">
            <span className="stay-brand-mark">S</span>
            <span>SORA <i>HOUSE</i></span>
          </Link>
          <nav className={`stay-nav${menuOpen ? " is-open" : ""}`} aria-label="Navigasi utama">
            <a href="#stay" onClick={() => setMenuOpen(false)}>Tentang</a>
            <a href="#rooms" onClick={() => setMenuOpen(false)}>Kamar</a>
            <a href="#experience" onClick={() => setMenuOpen(false)}>Pengalaman</a>
            <Link className="stay-nav-mobile-login" href="/masuk">Masuk akun</Link>
          </nav>
          <div className="stay-header-actions">
            <Link href="/masuk" className="stay-login">Masuk</Link>
            <a className="stay-header-cta" href="#booking">Pesan kamar <span aria-hidden="true">↗</span></a>
          </div>
          <button
            type="button"
            className={`stay-menu-toggle${menuOpen ? " is-open" : ""}`}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </header>

        <div className="stay-hero-content">
          <p className="stay-kicker"><span /> BOUTIQUE STAY · ULUWATU, BALI</p>
          <h1>Laut di depan mata.<br /><em>Waktu yang melambat.</em></h1>
          <p className="stay-hero-copy">Sebuah tempat untuk pulang pada hal-hal sederhana: udara asin, pagi tanpa alarm, dan senja yang selalu terasa baru.</p>
          <a href="#booking" className="stay-round-link" aria-label="Cari kamar"><span>↓</span></a>
        </div>
        <div className="stay-hero-caption"><span>08°49&apos; S · 115°06&apos; E</span><span>DI ATAS GARIS PANTAI ULUWATU</span></div>
      </section>

      <section className="stay-booking-wrap" id="booking" aria-label="Cari ketersediaan kamar">
        <form className="stay-booking" onSubmit={searchAvailability}>
          <label className="stay-field">
            <span>Check-in</span>
            <input aria-label="Tanggal check-in" required type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
          </label>
          <label className="stay-field">
            <span>Check-out</span>
            <input aria-label="Tanggal check-out" required type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
          </label>
          <label className="stay-field stay-guest-field">
            <span>Tamu</span>
            <select aria-label="Jumlah tamu" value={guests} onChange={(event) => setGuests(event.target.value)}>
              <option value="1">1 tamu</option>
              <option value="2">2 tamu</option>
              <option value="3">3 tamu</option>
              <option value="4">4 tamu</option>
            </select>
          </label>
          <button className="stay-search-button" type="submit">Cek ketersediaan <span aria-hidden="true">↗</span></button>
          {selectedRoom && <input type="hidden" name="room" value={selectedRoom} />}
        </form>
        <p className="stay-booking-note" role="status">{status || "Harga terbaik selalu tersedia langsung dari kami."}</p>
      </section>

      <section className="stay-intro stay-section" id="stay">
        <div className="stay-intro-heading">
          <p className="stay-eyebrow">TEMPAT UNTUK MENEMUKAN JEDA</p>
          <h2>Ruang kecil<br />untuk <em>merasa jauh.</em></h2>
        </div>
        <div className="stay-intro-copy">
          <p>Di ujung selatan Bali, Sora House tumbuh mengikuti kontur tebing dan ritme laut. Hanya dua belas kamar, dirancang dengan material lokal dan dibiarkan terbuka pada cahaya.</p>
          <a href="#experience" className="stay-text-link">Kenali Sora House <span aria-hidden="true">↗</span></a>
          <div className="stay-stats">
            <div><strong>12</strong><span>kamar privat</span></div>
            <div><strong>180°</strong><span>cakrawala laut</span></div>
            <div><strong>5 min</strong><span>ke pantai</span></div>
          </div>
        </div>
        <div className="stay-intro-image" role="img" aria-label="Kolam renang dan vila yang menghadap laut tropis" />
        <p className="stay-image-caption">SORE HARI, DARI KOLAM UTAMA</p>
      </section>

      <section className="stay-rooms stay-section" id="rooms">
        <div className="stay-section-heading">
          <div>
            <p className="stay-eyebrow">TINGGAL SEDIKIT LEBIH LAMA</p>
            <h2>Kamar dengan <em>ceritanya sendiri.</em></h2>
          </div>
          <a className="stay-text-link" href="#booking">Semua kamar <span aria-hidden="true">↗</span></a>
        </div>
        <div className="stay-room-grid">
          {rooms.map((room, index) => (
            <article className="stay-room" key={room.name}>
              <div
                className="stay-room-image"
                role="img"
                aria-label={room.name}
                style={{ backgroundImage: `url("${room.image}")`, backgroundPosition: room.imagePosition }}
              >
                <span className="stay-room-index">0{index + 1} / 03</span>
              </div>
              <div className="stay-room-info">
                <div><h3>{room.name}</h3><p>{room.detail}</p></div>
                <div className="stay-room-price"><span>mulai dari</span><strong>Rp {room.price}</strong><small> / malam</small></div>
              </div>
              <button type="button" className="stay-room-link" onClick={() => chooseRoom(room.name)}>
                Pilih kamar <span aria-hidden="true">↗</span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="stay-experience" id="experience">
        <div className="stay-experience-image" role="img" aria-label="Interior suite dengan cahaya matahari pagi" />
        <div className="stay-experience-copy">
          <p className="stay-eyebrow">HARI-HARI YANG TAK PERLU RENCANA</p>
          <h2>Ikuti saja<br /><em>suasana hati.</em></h2>
          <p>Mulai hari dengan kopi Bali di teras. Habiskan siang di air yang tenang. Saat matahari turun, meja sudah menunggu dengan hasil laut hari ini.</p>
          <div className="stay-experience-list">
            <span>01 <b>Meja musim</b></span>
            <span>02 <b>Ritual spa</b></span>
            <span>03 <b>Jalan ke pantai</b></span>
          </div>
          <a href="#booking" className="stay-light-button">Rencanakan kunjungan <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <footer className="stay-footer">
        <Link className="stay-brand stay-brand-footer" href="#top"><span className="stay-brand-mark">S</span><span>SORA <i>HOUSE</i></span></Link>
        <span className="stay-footer-location">ULUWATU, BALI · INDONESIA</span>
        <a href="#top" className="stay-back-top">Kembali ke atas ↑</a>
        <small>© 2026 Sora House</small>
      </footer>
    </main>
  );
}