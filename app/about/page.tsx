import type { Metadata } from "next";
import Image from "next/image";
import { PublicChrome } from "@/components/PublicChrome";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <PublicChrome>
      <main className="container">
        <section className="about-page">
          <div className="about-photo">
            <Image src="/images/bell-reading.jpg" width={720} height={900} alt="Bella reading a book" priority />
          </div>
          <div className="about-copy">
            <p className="eyebrow">Hello, I’m Bella.</p>
            <h1>Bella Herlinda</h1>
            <p className="about-kicker">A reader, a writer, and a keeper of little moments.</p>
            <p>Namaku Bella Herlinda. Aku suka membaca, menulis, dan menyimpan hal-hal kecil yang kadang terasa terlalu sederhana untuk diceritakan, tapi terlalu berarti untuk dilupakan.</p>
            <p>Bell’s Diary adalah ruang kecil tempat aku menaruh cerita, pemikiran, refleksi, dan potongan hari yang ingin aku ingat lebih lama. Di sini mungkin ada tulisan tentang buku, perasaan, proses bertumbuh, hal-hal yang aku pelajari, atau sekadar catatan kecil dari hari biasa.</p>
            <p>Aku percaya tidak semua hal harus luar biasa untuk layak ditulis. Kadang justru dari hal-hal sederhana, kita bisa menemukan cerita yang paling dekat dengan diri sendiri.</p>
            <div className="tags"><span>reading</span><span>writing</span><span>personal notes</span><span>reflections</span><span>little stories</span></div>
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
