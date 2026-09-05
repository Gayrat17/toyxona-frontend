'use client';

import Link from 'next/link';

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-5 p-6 text-center">
      <h1 className="font-display text-3xl font-bold">
        Sahifani ochib bo‘lmadi
      </h1>
      <p className="text-sm leading-relaxed text-ink-soft">
        Kutilmagan xatolik yuz berdi. Qayta urinib ko‘ring yoki bosh sahifaga
        qayting.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={retry} className="btn-gold">
          Qayta urinish
        </button>
        <Link href="/" className="btn-outline">
          Bosh sahifa
        </Link>
      </div>
    </main>
  );
}
