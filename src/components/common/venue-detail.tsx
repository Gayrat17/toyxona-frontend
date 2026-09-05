'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { WeddingHall, Bar } from '@/types';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarCheck,
  BadgeCheck,
  ExternalLink,
  Hotel,
  Image as ImageIcon,
  MapPin,
  Play,
  Users,
  Wine,
} from 'lucide-react';
import { fetchBarByIdRequest, fetchHallByIdRequest } from '@/services/venues';
import { AMENITIES } from '@/lib/amenities';
import { getGallery, getVenueCover } from '@/utils/media';
import { safeExternalUrl } from '@/utils/navigation';
import { getErrorMessage, isNotFound } from '@/utils/errors';
import { localDateString, parseLocalDate } from '@/utils/date';
import { formatMoney } from '@/utils/booking';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ErrorAlert } from './error-alert';
import { LoadingState } from './loading-state';
import { MediaImage } from './media-image';
import { Modal } from './modal';
import { HallBookingForm } from './hall-booking-form';
import { BarBookingForm } from './bar-booking-form';
import { VenueCalendar } from './venue-calendar';
import { VenueActions } from './venue-actions';

export function VenueDetail({ type }: { type: 'halls' | 'bars' }) {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const id = Number(params.id);
  const validId = Number.isSafeInteger(id) && id > 0;
  const initialDate = search.get('date') || '';
  const [date, setDate] = useState(
    parseLocalDate(initialDate) && initialDate >= localDateString()
      ? initialDate
      : '',
  );
  const [image, setImage] = useState<string | null>(null);
  const query = useQuery<WeddingHall | Bar>({
    queryKey: ['venue', type, id],
    queryFn: () =>
      type === 'halls' ? fetchHallByIdRequest(id) : fetchBarByIdRequest(id),
    enabled: validId,
  });
  const venue = query.data;
  const Icon = type === 'halls' ? Hotel : Wine;
  const back = (
    <Link href={`/?category=${type}#katalog`} className="btn-outline">
      <ArrowLeft className="h-4 w-4" />
      Katalogga qaytish
    </Link>
  );

  if (query.isLoading)
    return (
      <div className="flex min-h-dvh flex-col">
        <Header />
        <LoadingState />
        <Footer />
      </div>
    );
  if (!validId || query.isError || !venue)
    return (
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
          <h1 className="font-display text-2xl font-bold">
            {!validId || isNotFound(query.error)
              ? 'Joy topilmadi'
              : 'Ma’lumotni yuklab bo‘lmadi'}
          </h1>
          <ErrorAlert
            message={
              !validId || isNotFound(query.error)
                ? 'Joy o‘chirilgan yoki havola noto‘g‘ri. Katalogdan boshqa joy tanlang.'
                : getErrorMessage(query.error)
            }
            onRetry={
              validId && !isNotFound(query.error)
                ? () => {
                    void query.refetch();
                  }
                : undefined
            }
          />
          {back}
        </main>
        <Footer />
      </div>
    );
  const isHall = 'max_capacity' in venue;
  const cover = getVenueCover(venue);
  const gallery = getGallery(venue);
  const videoUrl = safeExternalUrl(venue.video_url);
  const mapUrl = safeExternalUrl(venue.map_link);
  const selectDate = (value: string) => {
    setDate(value);
    document
      .getElementById('booking-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 lg:px-8">
        <nav
          aria-label="Sahifa yo‘li"
          className="mb-6 flex min-w-0 items-center gap-2 text-xs font-bold text-ink-soft"
        >
          <Link href="/" className="shrink-0 hover:text-gold-strong">
            Bosh sahifa
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={`/?category=${type}#katalog`}
            className="shrink-0 hover:text-gold-strong"
          >
            {isHall ? 'To‘y zallari' : 'Barlar'}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-gold-strong">{venue.name}</span>
        </nav>
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="badge-gold mb-3">
              <Icon className="h-3 w-3" />
              {isHall ? 'To‘y zali' : 'Bar / Lounge'}
            </span>
            <h1 className="break-words font-display text-3xl font-bold sm:text-4xl">
              {venue.name}
            </h1>
            <p className="mt-3 flex max-w-2xl items-start gap-2 text-sm text-ink-soft">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-strong" />
              <span className="break-words">
                {venue.address}
                {venue.region_name && ` · ${venue.region_name}`}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <VenueActions venueKey={`${type}-${id}`} name={venue.name} />
            <a
              href="#booking-form"
              className="btn-gold !px-4 !py-2 !text-xs lg:!hidden"
            >
              <CalendarCheck className="h-4 w-4" /> Bron qilish
            </a>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-6">
            <div className="frame-mat overflow-hidden rounded-2xl p-2">
              <div className="relative h-64 overflow-hidden rounded-xl bg-espresso sm:h-96">
                {cover ? (
                  <MediaImage
                    src={cover}
                    alt={venue.name}
                    priority
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="pattern-star flex h-full items-center justify-center">
                    <Icon className="h-16 w-16 text-gold-soft" />
                  </div>
                )}
                {venue.is_approved === true && (
                  <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-espresso/90 px-3 py-2 text-xs font-bold text-[#dfc58f]">
                    <BadgeCheck className="h-4 w-4" />
                    Tasdiqlangan joy
                  </span>
                )}
              </div>
            </div>
            {!!gallery.length && (
              <section className="card-lux p-5">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                  <ImageIcon className="h-5 w-5 text-gold-strong" />
                  Galereya
                  <span className="badge-outline">
                    {gallery.length} ta rasm
                  </span>
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {gallery.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={`${index + 1}-rasmni kattalashtirish`}
                      onClick={() => setImage(item.url)}
                      className="h-28 overflow-hidden rounded-xl border border-line hover:border-gold"
                    >
                      <MediaImage
                        src={item.url}
                        priority={index === 0}
                        alt={`${venue.name} — ${index + 1}-rasm`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}
            <section className="card-lux space-y-6 p-5 sm:p-7">
              <h2 className="font-display text-xl font-bold">
                {isHall ? 'Zal ma’lumotlari' : 'Bar ma’lumotlari'}
              </h2>
              <dl
                className={`grid gap-3 ${isHall ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'}`}
              >
                <div className="min-w-0 rounded-xl border border-line bg-surface-2/60 p-4">
                  <dt className="field-label">Sig‘im</dt>
                  <dd className="mt-2 flex flex-wrap items-center gap-2 font-display text-xl font-bold">
                    <Users className="h-5 w-5 text-gold-strong" />
                    {isHall ? venue.max_capacity : venue.capacity} kishi
                  </dd>
                </div>
                {!isHall && (
                  <div className="min-w-0 rounded-xl border border-line bg-surface-2/60 p-4">
                    <dt className="field-label">Soatbay narx</dt>
                    <dd className="mt-2 break-words font-display text-xl font-bold text-gold-strong">
                      {formatMoney(venue.price_per_hour)}
                    </dd>
                  </div>
                )}
                <div className="min-w-0 rounded-xl border border-line bg-surface-2/60 p-4">
                  <dt className="field-label">Zakalat</dt>
                  <dd className="mt-2 break-words font-display text-xl font-bold text-success">
                    {formatMoney(venue.required_deposit)}
                  </dd>
                </div>
              </dl>
              <div className="border-t border-dashed border-line pt-5">
                <h3 className="field-label">Tavsif</h3>
                <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-ink-soft">
                  {venue.description || 'Batafsil tavsif kiritilmagan.'}
                </p>
              </div>
              {!!venue.amenities?.length && (
                <div className="border-t border-dashed border-line pt-5">
                  <h3 className="field-label">Mavjud qulayliklar</h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[...new Set(venue.amenities)].map((key) => {
                      const item = AMENITIES.find(
                        (amenity) => amenity.id === key,
                      );
                      const AmenityIcon = item?.icon || Icon;
                      return (
                        <li
                          key={key}
                          className="flex items-center gap-2.5 rounded-xl border border-line p-3 text-xs font-bold"
                        >
                          <AmenityIcon className="h-4 w-4 shrink-0 text-gold-strong" />
                          {item?.label || key}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {(videoUrl || mapUrl) && (
                <div className="flex flex-wrap gap-3 border-t border-dashed border-line pt-5">
                  {videoUrl && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline !px-4 !text-xs"
                    >
                      <Play className="h-4 w-4" />
                      Videoni ko‘rish
                    </a>
                  )}
                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ink !px-4 !text-xs"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Xaritada ochish
                    </a>
                  )}
                </div>
              )}
            </section>
            <VenueCalendar
              key={`${type}-${id}-${date}`}
              type={type}
              id={id}
              initialDate={date}
              onSelectDate={selectDate}
            />
          </div>
          <aside className="min-w-0 space-y-3 lg:sticky lg:top-24">
            <a href="#booking-form" className="sr-only focus:not-sr-only">
              Bron formasiga o‘tish
            </a>
            {isHall ? (
              <HallBookingForm
                key={id}
                hall={venue}
                date={date}
                onDateChange={setDate}
              />
            ) : (
              <BarBookingForm
                key={id}
                bar={venue}
                date={date}
                onDateChange={setDate}
              />
            )}
          </aside>
        </div>
      </main>
      <Modal
        open={!!image}
        onClose={() => setImage(null)}
        title={`${venue.name} — galereya`}
        className="!max-w-4xl"
      >
        {image && (
          <div className="p-3">
            <MediaImage
              src={image}
              alt={`${venue.name} — kattalashtirilgan rasm`}
              className="max-h-[70dvh] w-full object-contain"
            />
          </div>
        )}
      </Modal>
      <Footer />
    </div>
  );
}
