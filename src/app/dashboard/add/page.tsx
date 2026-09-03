'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createHallRequest, createBarRequest, fetchRegionsRequest } from '@/services/venues';
import { Region } from '@/types';
import { useRouter } from 'next/navigation';
import {
  Hotel, Wine, DollarSign, Image as ImageIcon, Video, Check,
  AlertCircle, UploadCloud, X, Sparkles, Shield, Wifi, Car, AirVent, Music, Baby, Accessibility, Plus,
} from 'lucide-react';

const AMENITIES_LIST = [
  { id: 'parking', label: 'Avtoturargoh', icon: Car },
  { id: 'wifi', label: 'Bepul Wi-Fi', icon: Wifi },
  { id: 'ac', label: 'Konditsioner', icon: AirVent },
  { id: 'sound', label: 'Ovoz apparaturasi', icon: Music },
  { id: 'playground', label: 'Bolalar maydonchasi', icon: Baby },
  { id: 'stage', label: 'Sahna va yorug‘lik', icon: Sparkles },
  { id: 'accessible', label: 'Imkoniyati cheklanganlar uchun', icon: Accessibility },
  { id: 'security', label: 'Xavfsizlik (CCTV)', icon: Shield },
];

const venueFormSchema = z.object({
  venue_type: z.enum(['HALL', 'BAR']),
  name: z.string().min(3, "Nomi kamida 3 ta belgidan iborat bo'lishi shart"),
  description: z.string().min(10, "Tavsif kamida 10 ta belgidan iborat bo'lishi shart"),
  region: z.string().min(1, 'Viloyatni tanlang'),
  district: z.string().min(1, 'Tuman/Shaharni tanlang'),
  address: z.string().min(5, 'Aniq manzilni kiriting'),
  map_link: z.string().optional(),
  capacity: z.coerce.number().min(10, "Sig'im kamida 10 kishi bo'lishi kerak"),
  required_deposit: z.string().min(1, 'Zakalat miqdorini kiriting'),
  price_per_unit: z.string().min(1, 'Narxni kiriting'),
  video_url: z.string().optional(),
  amenities: z.array(z.string()).default([]),
});

type VenueFormData = z.infer<typeof venueFormSchema>;

/* Section wrapper — numbered panel with dark header strip */
function FormSection({
  step,
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  step: string;
  title: string;
  subtitle: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="card-lux overflow-hidden">
      <div className="texture-grain relative bg-espresso px-6 py-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative z-[2] flex items-center gap-4">
          <span className="flex h-11 w-11 rotate-45 items-center justify-center border border-gold/50 bg-white/5">
            <Icon className="h-5 w-5 rotate-[-45deg] text-gold" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">{step}</p>
            <h3 className="mt-0.5 font-display text-lg font-bold text-[#f2e9d6]">{title}</h3>
          </div>
        </div>
        <p className="relative z-[2] mt-2 pl-[60px] text-xs text-[#a29377]">{subtitle}</p>
      </div>
      <div className="p-6 sm:p-7">{children}</div>
    </div>
  );
}

export default function AddVenuePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: dbRegions = [] } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: fetchRegionsRequest,
    staleTime: 0,
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VenueFormData>({
    resolver: zodResolver(venueFormSchema) as any,
    defaultValues: {
      venue_type: 'HALL',
      name: '',
      description: '',
      region: '',
      district: '',
      address: '',
      map_link: '',
      capacity: 300,
      required_deposit: '5000000',
      price_per_unit: '150000',
      video_url: '',
      amenities: ['parking', 'wifi', 'ac', 'sound'],
    },
  });

  const selectedVenueType = watch('venue_type');
  const selectedRegionId = watch('region');

  const selectedRegionObj = React.useMemo(() => {
    return dbRegions.find((r) => String(r.id) === String(selectedRegionId)) || null;
  }, [dbRegions, selectedRegionId]);

  const currentDistricts = selectedRegionObj?.districts || [];

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const createHallMutation = useMutation({
    mutationFn: createHallRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ownerHalls'] }),
  });

  const createBarMutation = useMutation({
    mutationFn: createBarRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ownerBars'] }),
  });

  const onSubmit = async (values: VenueFormData) => {
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('address', values.address);
      if (values.region) formData.append('region', values.region);
      if (values.district) formData.append('district', values.district);

      formData.append('required_deposit', values.required_deposit);

      if (values.map_link) formData.append('map_link', values.map_link);
      if (values.video_url) formData.append('video_url', values.video_url);

      if (coverFile) {
        formData.append('cover_image', coverFile);
      }

      galleryFiles.forEach((file) => {
        formData.append('gallery_images', file);
      });

      formData.append('amenities', JSON.stringify(values.amenities));

      if (values.venue_type === 'HALL') {
        formData.append('max_capacity', values.capacity.toString());
        formData.append('price_per_person', values.price_per_unit);
        await createHallMutation.mutateAsync(formData);
      } else {
        formData.append('capacity', values.capacity.toString());
        formData.append('price_per_hour', values.price_per_unit);
        await createBarMutation.mutateAsync(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/venues');
      }, 1500);
    } catch (err: any) {
      console.error('Form Submit Error:', err);
      const detail = err.response?.data?.detail || err.response?.data?.message;
      setError(detail || 'Obyektni saqlashda xatolik yuz berdi. Iltimos qayta urining.');
    }
  };

  const isFormSubmitting = isSubmitting || createHallMutation.isPending || createBarMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-7 pb-12">
      {/* Page title */}
      <div>
        <p className="eyebrow">Boshqaruv paneli</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">Yangi joy qo&apos;shish</h1>
        <p className="mt-2 text-sm font-medium text-ink-soft">
          Platformaga to&apos;y zalingiz yoki baringiz haqida to&apos;liq va jozibador
          ma&apos;lumotlarni kiriting.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm font-semibold text-danger">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4 text-sm font-semibold text-success">
          <Check className="h-5 w-5 shrink-0" />
          <span>
            Yangi joy muvaffaqiyatli saqlandi! &quot;Mening joylarim&quot; sahifasiga
            o&apos;tkazilmoqda...
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        {/* SECTION 1 */}
        <FormSection
          step="Bo‘lim I"
          title="Asosiy ma'lumotlar"
          subtitle="Joy turi, nomi va umumiy tavsifini kiriting"
          icon={Hotel}
        >
          <div className="space-y-5">
            {/* Venue type */}
            <div>
              <label className="field-label">Joy turi</label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('venue_type', 'HALL')}
                  className={`flex cursor-pointer items-center justify-center gap-3 rounded-xl border p-4 transition-all ${
                    selectedVenueType === 'HALL'
                      ? 'border-gold bg-gold-tint shadow-[0_12px_26px_-14px_rgba(150,110,50,0.7)]'
                      : 'border-line bg-surface hover:border-gold/50'
                  }`}
                >
                  <Hotel
                    className={`h-5 w-5 ${selectedVenueType === 'HALL' ? 'text-gold-strong' : 'text-ink-faint'}`}
                  />
                  <span
                    className={`text-[13px] font-extrabold ${
                      selectedVenueType === 'HALL' ? 'text-ink' : 'text-ink-soft'
                    }`}
                  >
                    To&apos;y zali
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('venue_type', 'BAR')}
                  className={`flex cursor-pointer items-center justify-center gap-3 rounded-xl border p-4 transition-all ${
                    selectedVenueType === 'BAR'
                      ? 'border-gold bg-gold-tint shadow-[0_12px_26px_-14px_rgba(150,110,50,0.7)]'
                      : 'border-line bg-surface hover:border-gold/50'
                  }`}
                >
                  <Wine
                    className={`h-5 w-5 ${selectedVenueType === 'BAR' ? 'text-gold-strong' : 'text-ink-faint'}`}
                  />
                  <span
                    className={`text-[13px] font-extrabold ${
                      selectedVenueType === 'BAR' ? 'text-ink' : 'text-ink-soft'
                    }`}
                  >
                    Bar / Lounge
                  </span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="field-label">Joy nomi *</label>
              <input
                type="text"
                placeholder="Masalan: Crystal Hall"
                {...register('name')}
                className="input-lux mt-2"
              />
              {errors.name && <p className="mt-1.5 text-xs font-bold text-danger">{errors.name.message}</p>}
            </div>

            {/* Region / District */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label">Viloyat *</label>
                <select
                  {...register('region')}
                  value={selectedRegionId}
                  onChange={(e) => {
                    setValue('region', e.target.value);
                    setValue('district', '');
                  }}
                  className="select-lux mt-2"
                >
                  <option value="">— Viloyat tanlang —</option>
                  {dbRegions.map((region) => (
                    <option key={`reg-${region.id}`} value={String(region.id)}>
                      {region.name}
                    </option>
                  ))}
                </select>
                {errors.region && <p className="mt-1.5 text-xs font-bold text-danger">{errors.region.message}</p>}
              </div>

              <div>
                <label className="field-label">Tuman / Shahar *</label>
                <select
                  {...register('district')}
                  disabled={!currentDistricts.length}
                  className="select-lux mt-2"
                >
                  <option value="">— Tuman tanlang —</option>
                  {currentDistricts.map((district) => (
                    <option key={`dis-${district.id}`} value={String(district.id)}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="mt-1.5 text-xs font-bold text-danger">{errors.district.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="field-label">Aniq manzil *</label>
              <input
                type="text"
                placeholder="Masalan: Amir Temur ko'chasi, 108-uy"
                {...register('address')}
                className="input-lux mt-2"
              />
              {errors.address && <p className="mt-1.5 text-xs font-bold text-danger">{errors.address.message}</p>}
            </div>

            {/* Map link */}
            <div>
              <label className="field-label">Xarita havolasi (ixtiyoriy)</label>
              <input
                type="url"
                placeholder="https://maps.google.com/..."
                {...register('map_link')}
                className="input-lux mt-2"
              />
            </div>

            {/* Description */}
            <div>
              <label className="field-label">Tavsif *</label>
              <textarea
                rows={4}
                placeholder="Zalingizning afzalliklari, interyeri, sig'imi va xizmatlari haqida yozing..."
                {...register('description')}
                className="input-lux mt-2"
              />
              {errors.description && (
                <p className="mt-1.5 text-xs font-bold text-danger">{errors.description.message}</p>
              )}
            </div>
          </div>
        </FormSection>

        {/* SECTION 2 — capacity */}
        <FormSection
          step="Bo‘lim II"
          title="Sig'im va qobiliyat"
          subtitle="Maksimal mehmonlar sonini belgilang"
          icon={Wine}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label">
                {selectedVenueType === 'HALL' ? 'Maksimal sig‘im (kishi) *' : 'Sig‘im (kishi) *'}
              </label>
              <input type="number" {...register('capacity')} className="input-lux mt-2" />
              {errors.capacity && (
                <p className="mt-1.5 text-xs font-bold text-danger">{errors.capacity.message}</p>
              )}
            </div>
          </div>
        </FormSection>

        {/* SECTION 3 — money */}
        <FormSection
          step="Bo‘lim III"
          title="Moliyaviy ma'lumotlar"
          subtitle="Zakalat miqdori va ijara narxlarini belgilang"
          icon={DollarSign}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label">Talab qilinadigan zakalat (UZS) *</label>
              <input type="text" placeholder="5000000" {...register('required_deposit')} className="input-lux mt-2" />
              {errors.required_deposit && (
                <p className="mt-1.5 text-xs font-bold text-danger">{errors.required_deposit.message}</p>
              )}
            </div>

            <div>
              <label className="field-label">
                {selectedVenueType === 'HALL'
                  ? 'Har bir kishi / paket narxi (UZS) *'
                  : '1 soatlik ijara narxi (UZS) *'}
              </label>
              <input
                type="text"
                placeholder={selectedVenueType === 'HALL' ? '150000' : '300000'}
                {...register('price_per_unit')}
                className="input-lux mt-2"
              />
              {errors.price_per_unit && (
                <p className="mt-1.5 text-xs font-bold text-danger">{errors.price_per_unit.message}</p>
              )}
            </div>
          </div>
        </FormSection>

        {/* SECTION 4 — media */}
        <FormSection
          step="Bo‘lim IV"
          title="Media"
          subtitle="Joyingizning sifatli va jozibador fotosuratlarini yuklang"
          icon={ImageIcon}
        >
          <div className="space-y-6">
            {/* Cover */}
            <div>
              <label className="field-label">Asosiy rasm (Cover)</label>
              <div className="mt-2 flex items-center gap-6">
                {coverPreview ? (
                  <div className="frame-mat relative h-32 w-48 overflow-hidden rounded-xl p-1">
                    <img src={coverPreview} alt="Cover Preview" className="h-full w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                      className="absolute right-3 top-3 rounded-full bg-danger p-1 text-white shadow-md transition-colors hover:brightness-110"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-32 w-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line-strong bg-surface-2/50 transition-colors hover:border-gold/60 hover:bg-gold-tint/40">
                    <UploadCloud className="mb-1.5 h-7 w-7 text-gold" />
                    <span className="text-xs font-extrabold text-ink-soft">Rasm yuklash</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Gallery */}
            <div>
              <label className="field-label">Qo&apos;shimcha galereya rasmlari (3-5 ta)</label>
              <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {galleryPreviews.map((preview, idx) => (
                  <div key={idx} className="relative h-28 overflow-hidden rounded-xl border border-line">
                    <img src={preview} alt={`Gallery ${idx}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-danger p-1 text-white shadow transition-colors hover:brightness-110"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                <label className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line-strong bg-surface-2/50 transition-colors hover:border-gold/60 hover:bg-gold-tint/40">
                  <Plus className="mb-1 h-5 w-5 text-gold" />
                  <span className="text-xs font-extrabold text-ink-soft">Rasm qo&apos;shish</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
                </label>
              </div>
            </div>

            {/* Video */}
            <div>
              <label className="field-label flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5 text-gold" />
                Video havolasi (YouTube / Instagram)
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                {...register('video_url')}
                className="input-lux mt-2"
              />
            </div>
          </div>
        </FormSection>

        {/* SECTION 5 — amenities */}
        <FormSection
          step="Bo‘lim V"
          title="Qo'shimcha qulayliklar"
          subtitle="Mijozlar uchun yaratilgan qulayliklarni tanlang"
          icon={Sparkles}
        >
          <Controller
            name="amenities"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {AMENITIES_LIST.map((item) => {
                  const Icon = item.icon;
                  const isChecked = field.value?.includes(item.id);

                  return (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                        isChecked
                          ? 'border-gold bg-gold-tint'
                          : 'border-line bg-surface hover:border-gold/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...(field.value || []), item.id]);
                          } else {
                            field.onChange(field.value?.filter((val) => val !== item.id));
                          }
                        }}
                        className="hidden"
                      />
                      <span
                        className={`flex h-8 w-8 shrink-0 rotate-45 items-center justify-center border ${
                          isChecked ? 'border-gold-strong bg-surface' : 'border-line bg-surface-2'
                        }`}
                      >
                        <Icon
                          className={`h-3.5 w-3.5 rotate-[-45deg] ${
                            isChecked ? 'text-gold-strong' : 'text-ink-faint'
                          }`}
                        />
                      </span>
                      <span className={`text-xs font-bold ${isChecked ? 'text-ink' : 'text-ink-soft'}`}>
                        {item.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </FormSection>

        {/* SUBMIT */}
        <button type="submit" disabled={isFormSubmitting} className="btn-gold w-full !py-4 !text-base">
          {isFormSubmitting ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#251b0c] border-t-transparent" />
              <span>Saqlanmoqda...</span>
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              <span>Saqlash va joyni e&apos;lon qilish</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
