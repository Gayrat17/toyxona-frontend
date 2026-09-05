import React from 'react';
import { WeddingHall, Bar } from '@/types';
import Link from 'next/link';
import {
  MapPin,
  Users,
  Hotel,
  Wine,
  ArrowUpRight,
  BadgeCheck,
} from 'lucide-react';
import { getVenueCover } from '@/utils/media';
import { MediaImage } from '@/components/common/media-image';

interface VenueCardProps {
  venue: WeddingHall | Bar;
  date?: string;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue, date }) => {
  const isHall = 'max_capacity' in venue;
  const id = venue.id;
  const name = venue.name;
  const address = venue.address;
  const capacity = isHall
    ? (venue as WeddingHall).max_capacity
    : (venue as Bar).capacity;
  const coverUrl = getVenueCover(venue);

  const priceFormatted = isHall
    ? 'Paketlar bo‘yicha'
    : `${parseFloat((venue as Bar).price_per_hour).toLocaleString('uz-UZ')} UZS / soat`;

  const linkPath = isHall ? `/venues/halls/${id}` : `/venues/bars/${id}`;

  return (
    <Link
      href={`${linkPath}${date ? `?date=${encodeURIComponent(date)}` : ''}`}
      className="group block"
    >
      <div className="card-lux card-lux-hover h-full overflow-hidden">
        {/* Media */}
        <div className="relative h-56 w-full overflow-hidden">
          {coverUrl ? (
            <MediaImage
              src={coverUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center ${
                isHall
                  ? 'bg-gradient-to-br from-[#3a2e18] via-[#2a2113] to-[#1c1509]'
                  : 'bg-gradient-to-br from-[#33203a] via-[#241531] to-[#150a1d]'
              }`}
            >
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")",
                }}
              />
              {isHall ? (
                <Hotel className="h-12 w-12 text-gold-soft" />
              ) : (
                <Wine className="h-12 w-12 text-gold-soft" />
              )}
            </div>
          )}

          {/* Bottom scrim into card surface */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

          {/* Category badge */}
          <div className="absolute left-4 top-4">
            <span className="badge-gold">
              {isHall ? (
                <Hotel className="h-3 w-3" />
              ) : (
                <Wine className="h-3 w-3" />
              )}
              {isHall ? 'To‘y zali' : 'Bar'}
            </span>
          </div>

          {/* Verified pill */}
          {venue.is_approved === true && (
            <div
              aria-label="Tasdiqlangan joy"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-gold/50 bg-black/35 text-gold backdrop-blur-md transition-colors group-hover:bg-gold group-hover:text-espresso"
            >
              <BadgeCheck className="h-4 w-4" />
            </div>
          )}

          {/* Capacity chip on image bottom */}
          <div className="absolute bottom-3 left-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
            <Users className="h-3 w-3 text-gold-soft" />
            {capacity} kishigacha
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="break-words font-display text-xl font-bold leading-snug text-ink transition-colors group-hover:text-gold-strong">
              {name}
            </h3>
            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-faint transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-espresso">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-faint">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" />
            <span className="line-clamp-1">{address}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-line pt-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                {isHall ? 'Narxlar' : 'Soatbay narx'}
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-ink">
                {priceFormatted}
              </p>
            </div>
            {isHall && (
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                  Zakalat
                </p>
                <p className="mt-0.5 text-sm font-extrabold text-success">
                  {parseFloat(
                    (venue as WeddingHall).required_deposit,
                  ).toLocaleString('uz-UZ')}{' '}
                  UZS
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VenueCard;
