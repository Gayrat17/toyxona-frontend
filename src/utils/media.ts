import type { WeddingHall, Bar } from '@/types';

/** Django's absolute /media URLs must remain reachable from remote browsers. */
export function getMediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('/images/')) return path;
  if (!/^https?:\/\//i.test(path)) {
    if (path.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(path)) return '';
    return `/${path.replace(/^\/+/, '')}`;
  }
  try {
    const url = new URL(path);
    if (url.pathname.startsWith('/media/'))
      return `${url.pathname}${url.search}`;
    return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
      ? ''
      : url.href;
  } catch {
    return '';
  }
}

export function getVenueCover(venue: WeddingHall | Bar): string | null {
  const gallery = venue.gallery_images || [];
  const main = gallery.find((image) => image.is_main) || gallery[0];
  return (
    getMediaUrl(
      venue.cover_image_url ||
        venue.cover_image ||
        main?.image_url ||
        main?.image ||
        main?.file,
    ) || null
  );
}

export function getGallery(venue: WeddingHall | Bar) {
  return (venue.gallery_images || [])
    .map((image) => ({
      id: image.id,
      url: getMediaUrl(image.image_url || image.image || image.file),
    }))
    .filter((image) => Boolean(image.url));
}
