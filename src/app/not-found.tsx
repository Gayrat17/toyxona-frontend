import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
        <p className="font-display text-7xl font-bold text-gold-strong">404</p>
        <h1 className="mt-5 font-display text-3xl font-bold">
          Sahifa topilmadi
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Havola noto‘g‘ri yoki sahifa boshqa manzilga ko‘chirilgan bo‘lishi
          mumkin.
        </p>
        <Link href="/" className="btn-gold mt-7">
          Bosh sahifaga qaytish
        </Link>
      </main>
      <Footer />
    </div>
  );
}
