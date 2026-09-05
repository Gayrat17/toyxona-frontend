'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Check, Hotel, Plus, Save, UploadCloud, Wine, X } from 'lucide-react';
import type { Bar, WeddingHall } from '@/types';
import { AMENITIES } from '@/lib/amenities';
import { venueFormSchema, type VenueFormValues } from '@/lib/venue-form-schema';
import { fetchRegionsRequest } from '@/services/venues';
import { getGallery, getMediaUrl } from '@/utils/media';
import { getErrorMessage } from '@/utils/errors';
import { ErrorAlert } from '@/components/common/error-alert';
import { MediaImage } from '@/components/common/media-image';

type Venue = WeddingHall | Bar;
type Upload = { file: File; url: string };
const MAX_GALLERY = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function defaults(venue?: Venue): VenueFormValues {
  const isHall = !venue || 'max_capacity' in venue;
  return {
    venue_type: isHall ? 'HALL' : 'BAR',
    name: venue?.name || '',
    description: venue?.description || '',
    region: venue?.region ? String(venue.region) : '',
    district: venue?.district ? String(venue.district) : '',
    address: venue?.address || '',
    capacity: venue
      ? 'max_capacity' in venue
        ? venue.max_capacity
        : venue.capacity
      : 300,
    required_deposit: venue?.required_deposit || '0',
    price_per_unit: venue
      ? 'max_capacity' in venue
        ? venue.price_per_person || ''
        : venue.price_per_hour
      : '',
    map_link: venue?.map_link || '',
    video_url: venue?.video_url || '',
    amenities: venue?.amenities || [],
  };
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="field-label mb-2">
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs font-semibold text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="card-lux overflow-hidden">
      <div className="border-b border-gold/20 bg-espresso p-5 sm:px-7">
        <h3 className="font-display text-lg font-bold text-[#f2e9d6]">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[#c4b496]">
          {subtitle}
        </p>
      </div>
      <div className="space-y-5 p-5 sm:p-7">{children}</div>
    </section>
  );
}

export function VenueForm({
  venue,
  onSave,
}: {
  venue?: Venue;
  onSave: (data: FormData, type: 'HALL' | 'BAR') => Promise<Venue>;
}) {
  const [currentVenue, setCurrentVenue] = useState(venue);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cover, setCover] = useState<Upload | null>(null);
  const [deleteCover, setDeleteCover] = useState(false);
  const [newGallery, setNewGallery] = useState<Upload[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const objectUrls = useRef(new Set<string>());
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError: setFieldError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VenueFormValues>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: defaults(venue),
  });
  const type = useWatch({ control, name: 'venue_type' });
  const region = useWatch({ control, name: 'region' });
  const regions = useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegionsRequest,
    staleTime: 300000,
  });
  const districts =
    regions.data?.find((item) => String(item.id) === region)?.districts || [];
  const existingGallery = currentVenue
    ? getGallery(currentVenue).filter((image) => !deletedIds.includes(image.id))
    : [];
  const coverUrl =
    cover?.url ||
    (!deleteCover &&
      getMediaUrl(
        currentVenue?.cover_image_url || currentVenue?.cover_image,
      )) ||
    '';

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const release = (upload: Upload | null) => {
    if (upload) {
      URL.revokeObjectURL(upload.url);
      objectUrls.current.delete(upload.url);
    }
  };
  const upload = (file: File): Upload => {
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    return { file, url };
  };
  const validFiles = (files: File[]) => {
    if (
      files.some(
        (file) =>
          !ACCEPTED_IMAGES.includes(file.type) || file.size > MAX_FILE_SIZE,
      )
    ) {
      setError(
        'Har bir rasm JPG, PNG, WebP yoki GIF formatida va 5 MB dan kichik bo‘lishi kerak.',
      );
      return false;
    }
    return true;
  };
  const onCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !validFiles([file])) return;
    release(cover);
    setCover(upload(file));
    setDeleteCover(false);
    setSuccess(false);
    setError(null);
  };
  const onGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length || !validFiles(files)) return;
    if (files.length + existingGallery.length + newGallery.length > MAX_GALLERY)
      return setError('Galereyada ko‘pi bilan 5 ta rasm bo‘lishi mumkin.');
    setNewGallery((items) => [...items, ...files.map(upload)]);
    setSuccess(false);
    setError(null);
  };
  const accessibility = (key: keyof VenueFormValues) => ({
    id: key,
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
  });

  async function submit(values: VenueFormValues) {
    setError(null);
    setSuccess(false);
    if (
      (!venue || type === 'BAR') &&
      (!values.price_per_unit || Number(values.price_per_unit) <= 0)
    )
      return setFieldError(
        'price_per_unit',
        { message: 'Noldan katta narx kiriting.' },
        { shouldFocus: true },
      );
    if (!districts.some((district) => String(district.id) === values.district))
      return setFieldError(
        'district',
        { message: 'Tanlangan viloyatga tegishli tumanni tanlang.' },
        { shouldFocus: true },
      );
    const data = new FormData();
    for (const key of [
      'name',
      'description',
      'address',
      'region',
      'district',
      'required_deposit',
      'map_link',
      'video_url',
    ] as const)
      data.append(key, values[key]);
    data.append(
      type === 'HALL' ? 'max_capacity' : 'capacity',
      String(values.capacity),
    );
    if (values.price_per_unit)
      data.append(
        type === 'HALL' ? 'price_per_person' : 'price_per_hour',
        values.price_per_unit,
      );
    data.append('amenities', JSON.stringify(values.amenities));
    if (cover) data.append('cover_image', cover.file);
    else if (deleteCover) data.append('delete_cover_image', 'true');
    if (deletedIds.length)
      data.append('deleted_gallery_ids', JSON.stringify(deletedIds));
    newGallery.forEach((item) => data.append('gallery_images', item.file));
    try {
      const saved = await onSave(data, type);
      setCurrentVenue(saved);
      reset(defaults(saved));
      release(cover);
      newGallery.forEach(release);
      setCover(null);
      setNewGallery([]);
      setDeleteCover(false);
      setDeletedIds([]);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Joy ma’lumotlarini saqlab bo‘lmadi.'));
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
      className="space-y-6"
      aria-label={venue ? 'Joyni tahrirlash' : 'Yangi joy qo‘shish'}
    >
      {error && <ErrorAlert message={error} />}
      {success && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/10 p-4 text-sm font-bold text-success"
        >
          <Check className="h-5 w-5 shrink-0" />
          O‘zgarishlar muvaffaqiyatli saqlandi.
        </div>
      )}
      {regions.isError && (
        <ErrorAlert
          message="Viloyat va tumanlar yuklanmadi. Saqlashdan oldin qayta urinib ko‘ring."
          onRetry={() => {
            void regions.refetch();
          }}
        />
      )}
      <fieldset disabled={isSubmitting} className="space-y-6">
        <Section
          title="I. Asosiy ma’lumotlar"
          subtitle="Joy turi, nomi va tavsifini kiriting."
        >
          {!venue && (
            <fieldset>
              <legend className="field-label">Joy turi</legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(
                  [
                    { value: 'HALL', label: 'To‘y zali', icon: Hotel },
                    { value: 'BAR', label: 'Bar / Lounge', icon: Wine },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-4 text-sm font-bold ${type === value ? 'border-gold bg-gold-tint' : 'border-line bg-surface'}`}
                  >
                    <input
                      type="radio"
                      {...register('venue_type')}
                      value={value}
                      className="sr-only"
                    />
                    <Icon className="h-5 w-5 shrink-0 text-gold-strong" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <Field id="name" label="Joy nomi *" error={errors.name?.message}>
            <input
              {...register('name')}
              {...accessibility('name')}
              required
              placeholder="Masalan: Crystal Hall"
              className="input-lux"
            />
          </Field>
          <Field
            id="description"
            label="Tavsif *"
            error={errors.description?.message}
          >
            <textarea
              {...register('description')}
              {...accessibility('description')}
              required
              rows={4}
              placeholder="Joyingiz va xizmatlaringiz haqida yozing…"
              className="input-lux"
            />
          </Field>
          <Field
            id="capacity"
            label="Maksimal sig‘im (kishi) *"
            error={errors.capacity?.message}
          >
            <input
              type="number"
              min={1}
              max={100000}
              step={1}
              required
              {...register('capacity', { valueAsNumber: true })}
              {...accessibility('capacity')}
              className="input-lux sm:max-w-xs"
            />
          </Field>
        </Section>
        <Section
          title="II. Manzil"
          subtitle="Viloyat va tumanni tanlab, aniq manzilni yozing."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="region" label="Viloyat *" error={errors.region?.message}>
              <Controller
                name="region"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    {...accessibility('region')}
                    onChange={(event) => {
                      field.onChange(event);
                      setValue('district', '', {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    required
                    disabled={regions.isLoading || regions.isError}
                    className="select-lux"
                  >
                    <option value="">
                      {regions.isLoading ? 'Yuklanmoqda…' : 'Viloyatni tanlang'}
                    </option>
                    {regions.data?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </Field>
            <Field
              id="district"
              label="Tuman / shahar *"
              error={errors.district?.message}
            >
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    {...accessibility('district')}
                    required
                    disabled={!region || !districts.length}
                    className="select-lux"
                  >
                    <option value="">Tumanni tanlang</option>
                    {districts.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </Field>
          </div>
          <Field
            id="address"
            label="Aniq manzil *"
            error={errors.address?.message}
          >
            <input
              {...register('address')}
              {...accessibility('address')}
              required
              className="input-lux"
              placeholder="Ko‘cha va uy raqami"
            />
          </Field>
          <Field
            id="map_link"
            label="Xarita havolasi (ixtiyoriy)"
            error={errors.map_link?.message}
          >
            <input
              type="url"
              {...register('map_link')}
              {...accessibility('map_link')}
              className="input-lux"
              placeholder="https://maps.google.com/…"
            />
          </Field>
        </Section>
        <Section
          title="III. Narxlar"
          subtitle="Narxlar so‘mda (UZS) kiritiladi. Zakalat uchun 0 kiritish mumkin."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="required_deposit"
              label="Talab qilinadigan zakalat (UZS) *"
              error={errors.required_deposit?.message}
            >
              <input
                inputMode="decimal"
                {...register('required_deposit')}
                {...accessibility('required_deposit')}
                required
                className="input-lux"
              />
            </Field>
            <Field
              id="price_per_unit"
              label={
                type === 'HALL'
                  ? 'Kishi boshiga narx (UZS)'
                  : '1 soatlik ijara narxi (UZS) *'
              }
              error={errors.price_per_unit?.message}
            >
              <input
                inputMode="decimal"
                {...register('price_per_unit')}
                {...accessibility('price_per_unit')}
                required={!venue || type === 'BAR'}
                className="input-lux"
                placeholder={type === 'HALL' ? '150000' : '300000'}
              />
            </Field>
          </div>
          {type === 'HALL' && (
            <p className="text-xs leading-relaxed text-ink-soft">
              Bronning yakuniy narxi tanlangan paketga bog‘liq. Zal saqlangandan
              so‘ng smenalar va narx paketlarini sozlang.
            </p>
          )}
        </Section>
        <Section
          title="IV. Rasmlar va video"
          subtitle="JPG, PNG, WebP yoki GIF. Har bir rasm 5 MB gacha, galereyada ko‘pi bilan 5 ta rasm."
        >
          <div>
            <p className="field-label mb-3">Asosiy rasm</p>
            {coverUrl && (
              <div className="relative mb-3 h-40 w-full max-w-xs overflow-hidden rounded-xl border border-line">
                <MediaImage
                  src={coverUrl}
                  alt="Asosiy rasm"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Asosiy rasmni o‘chirish"
                  onClick={() => {
                    release(cover);
                    setCover(null);
                    setDeleteCover(true);
                    setSuccess(false);
                  }}
                  className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-danger text-white dark:text-espresso"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <label className="btn-outline !rounded-xl !px-4 !text-xs">
              <UploadCloud className="h-4 w-4" />
              {coverUrl
                ? 'Asosiy rasmni almashtirish'
                : 'Asosiy rasmni yuklash'}
              <input
                type="file"
                accept={ACCEPTED_IMAGES.join(',')}
                className="sr-only"
                onChange={onCoverChange}
              />
            </label>
          </div>
          <div>
            <p className="field-label mb-3">
              Galereya ({existingGallery.length + newGallery.length}/
              {MAX_GALLERY})
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {existingGallery.map((image) => (
                <div
                  key={image.id}
                  className="relative h-28 overflow-hidden rounded-xl border border-line"
                >
                  <MediaImage
                    src={image.url}
                    alt={`Galereya rasmi ${image.id}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Galereya rasmi ${image.id} ni o‘chirish`}
                    onClick={() => {
                      setDeletedIds((ids) => [...ids, image.id]);
                      setSuccess(false);
                    }}
                    className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-danger text-white dark:text-espresso"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {newGallery.map((image, index) => (
                <div
                  key={image.url}
                  className="relative h-28 overflow-hidden rounded-xl border border-gold"
                >
                  <MediaImage
                    src={image.url}
                    alt={`Yangi rasm ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Yangi rasm ${index + 1} ni o‘chirish`}
                    onClick={() => {
                      release(image);
                      setNewGallery((items) =>
                        items.filter((item) => item !== image),
                      );
                    }}
                    className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-danger text-white dark:text-espresso"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {existingGallery.length + newGallery.length < MAX_GALLERY && (
                <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong text-xs font-bold text-ink-soft hover:border-gold">
                  <Plus className="h-5 w-5 text-gold-strong" />
                  Rasm qo‘shish
                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED_IMAGES.join(',')}
                    className="sr-only"
                    onChange={onGalleryChange}
                  />
                </label>
              )}
            </div>
          </div>
          <Field
            id="video_url"
            label="Video havolasi (ixtiyoriy)"
            error={errors.video_url?.message}
          >
            <input
              type="url"
              {...register('video_url')}
              {...accessibility('video_url')}
              placeholder="https://youtube.com/watch?v=…"
              className="input-lux"
            />
          </Field>
        </Section>
        <Section
          title="V. Qulayliklar"
          subtitle="Joyingizda mavjud bo‘lgan xizmat va imkoniyatlarni belgilang."
        >
          <Controller
            control={control}
            name="amenities"
            render={({ field }) => (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ...AMENITIES,
                  ...field.value
                    .filter((id) => !AMENITIES.some((item) => item.id === id))
                    .map((id) => ({ id, label: id, icon: Plus })),
                ].map(({ id, label, icon: Icon }) => (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs font-bold ${field.value.includes(id) ? 'border-gold bg-gold-tint' : 'border-line bg-surface'}`}
                  >
                    <input
                      type="checkbox"
                      checked={field.value.includes(id)}
                      onChange={(event) =>
                        field.onChange(
                          event.target.checked
                            ? [...field.value, id]
                            : field.value.filter((value) => value !== id),
                        )
                      }
                      className="h-4 w-4 shrink-0 accent-[var(--gold)]"
                    />
                    <Icon className="h-4 w-4 shrink-0 text-gold-strong" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          />
        </Section>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href={`/dashboard/venues?tab=${type === 'HALL' ? 'halls' : 'bars'}`}
            className="btn-outline"
          >
            Bekor qilish
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || regions.isLoading || regions.isError}
            className="btn-gold"
          >
            <Save className="h-4 w-4" />
            {isSubmitting
              ? 'Saqlanmoqda…'
              : venue
                ? 'O‘zgarishlarni saqlash'
                : 'Joyni saqlash'}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
