import React from 'react';
import { WeddingHall, Bar } from '@/types';
import Link from 'next/link';
import { MapPin, Users, DollarSign, Hotel, Wine } from 'lucide-react';
import { getMediaUrl } from '@/utils/media';

interface VenueCardProps {
  venue: WeddingHall | Bar;
}

function getVenueCover(venue: WeddingHall | Bar): string | null {
  if (venue.cover_image_url) return getMediaUrl(venue.cover_image_url);
  if (venue.cover_image) return getMediaUrl(venue.cover_image);
  if (venue.gallery_images && venue.gallery_images.length > 0) {
    const first = venue.gallery_images[0];
    const url = first.image_url || first.image;
    if (url) return getMediaUrl(url);
  }
  return null;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
  const isHall = 'max_capacity' in venue;
  const id = venue.id;
  const name = venue.name;
  const address = venue.address;
  const capacity = isHall ? (venue as WeddingHall).max_capacity : (venue as Bar).capacity;
  const coverUrl = getVenueCover(venue);
  
  // Format prices cleanly
  const depositFormatted = isHall 
    ? `${parseFloat((venue as WeddingHall).required_deposit).toLocaleString()} UZS (Zakalat)`
    : '';
  const priceFormatted = isHall
    ? 'Paketlar bo\'yicha'
    : `${parseFloat((venue as Bar).price_per_hour).toLocaleString()} UZS / soat`;

  const linkPath = isHall ? `/venues/halls/${id}` : `/venues/bars/${id}`;

  return (
    <Link 
      href={linkPath} 
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-900"
    >
      {/* Venue Image / Placeholder Gradient */}
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900">
        {coverUrl ? (
          <>
            <img 
              src={coverUrl} 
              alt={name} 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
          </>
        ) : (
          <>
            <div className={`absolute inset-0 opacity-40 transition-transform duration-500 group-hover:scale-105 bg-gradient-to-br ${
              isHall ? 'from-teal-400 via-emerald-500 to-indigo-600' : 'from-purple-500 via-indigo-600 to-pink-500'
            }`} />
            
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 shadow-sm backdrop-blur-sm dark:bg-slate-900/90">
              {isHall ? (
                <Hotel className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Wine className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
          </>
        )}

        {/* Category Badge */}
        <div className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm ${
          isHall ? 'bg-emerald-600/90' : 'bg-indigo-600/90'
        }`}>
          {isHall ? "To'yxona" : "Bar"}
        </div>
      </div>

      {/* Card Info Details */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
          {name}
        </h3>
        
        <div className="mt-3 flex items-start gap-1.5 text-slate-500 dark:text-slate-400">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span className="text-sm line-clamp-1">{address}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800/60">
          {/* Capacity Section */}
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Users className="h-4 w-4 text-slate-400" />
            <div className="text-xs">
              <p className="text-slate-400">Sig'imi</p>
              <p className="font-semibold">{capacity} kishi</p>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <div className="text-xs">
              <p className="text-slate-400">Narxi</p>
              <p className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[100px]">{isHall ? "Smeta bo'yicha" : priceFormatted}</p>
            </div>
          </div>
        </div>
        
        {isHall && (
          <div className="mt-3 rounded-lg bg-emerald-50/50 p-2 text-center text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/10">
            Kafolat summasi: {depositFormatted}
          </div>
        )}
      </div>
    </Link>
  );
};
export default VenueCard;
