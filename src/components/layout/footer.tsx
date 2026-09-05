import Link from 'next/link';
import { Crown, ArrowRight } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="texture-grain relative mt-auto overflow-hidden bg-espresso text-[#e9dfc9]">
      {/* Star lattice ornament */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

      <div className="relative z-[2] mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 rotate-45 items-center justify-center border border-gold/60 bg-gradient-to-br from-[#ecd49c] to-[#b08d4f]">
                <span className="flex h-7 w-7 rotate-[-45deg] items-center justify-center">
                  <Crown className="h-3.5 w-3.5 text-[#221a0f]" />
                </span>
              </span>
              <div>
                <p className="font-display text-2xl font-bold tracking-[0.08em] text-[#f2e9d6]">
                  TOYXONA
                </p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.42em] text-gold">
                  Luxe Venue
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#b7a888]">
              O‘zbekiston bo‘ylab eng sara to‘y zallari, restoranlar va barlarni
              bitta platformada toping. Hashamatli kunlaringiz shu yerdan
              boshlanadi.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:justify-self-center">
            <p className="eyebrow !text-gold">Sahifalar</p>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-[#b7a888]">
              <li>
                <Link
                  href="/?category=halls#katalog"
                  className="transition-colors hover:text-gold"
                >
                  To‘y zallari
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=bars#katalog"
                  className="transition-colors hover:text-gold"
                >
                  Barlar &amp; Lounge
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-gold"
                >
                  Tizimga kirish
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="transition-colors hover:text-gold"
                >
                  Ro‘yxatdan o‘tish
                </Link>
              </li>
            </ul>
          </div>

          {/* Only publish real destinations, not placeholder phone numbers or social links. */}
          <div className="md:justify-self-end">
            <p className="eyebrow !text-gold">Yordam</p>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-[#c4b496]">
              <li>
                <Link
                  href="/#qanday-ishlaydi"
                  className="flex items-center gap-2 hover:text-gold"
                >
                  Qanday ishlaydi? <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
              <li>
                <Link
                  href="/register?role=VENUE_OWNER"
                  className="hover:text-gold"
                >
                  Joy egalari uchun
                </Link>
              </li>
              <li className="max-w-xs text-xs font-normal leading-relaxed">
                Bron tafsilotlarini joy sahifasidagi ma’lumotlar orqali egasi
                bilan kelishishingiz mumkin.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-gold/15 pt-6 text-xs text-[#b7a888] sm:flex-row">
          <p>© {year} TOYXONA Luxe Venue. Barcha huquqlar himoyalangan.</p>
          <p className="tracking-[0.2em] uppercase">
            Hashamat — bu an&apos;anadir
          </p>
        </div>
      </div>
    </footer>
  );
}
