'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHallRequest, createBarRequest } from '@/services/venues';
import { useRouter } from 'next/navigation';
import { 
  Hotel, Wine, MapPin, DollarSign, Image as ImageIcon, Video, Check, 
  AlertCircle, UploadCloud, X, Sparkles, Shield, Wifi, Car, AirVent, Music, Baby, Accessibility, Plus 
} from 'lucide-react';

// Region & District Data for Uzbekistan
const REGIONS: Record<string, string[]> = {
  "Toshkent shahri": ["Yunusobod", "Chilonzor", "Mirzo Ulug'bek", "Yakkasaroy", "Mirobod", "Shayxontohur", "Olmazor", "Sergeli", "Yashnobod"],
  "Toshkent viloyati": ["Keles", "Chirchiq", "Olmaliq", "Angren", "Yangiyo'l", "Qibray", "Zangiota"],
  "Samarqand": ["Samarqand sh.", "Pastdarg'om", "Jomboy", "Toyloq", "Kattaqo'rg'on"],
  "Buxoro": ["Buxoro sh.", "G'ijduvon", "Kogon", "Romitsh"],
  "Farg'ona": ["Farg'ona sh.", "Marg'ilon", "Qo'qon", "Oltiariq"],
  "Namangan": ["Namangan sh.", "Chust", "Pop", "Kosonsoy"],
  "Andijon": ["Andijon sh.", "Asaka", "Shahrixon", "Xo'jaobod"],
};

// Amenities List
const AMENITIES_LIST = [
  { id: 'parking', label: 'Avtoturargoh (Parking)', icon: Car },
  { id: 'wifi', label: 'Bepul Wi-Fi', icon: Wifi },
  { id: 'ac', label: 'Konditsioner / Shamollatish', icon: AirVent },
  { id: 'sound', label: 'Musiqa va Ovoz apparaturasi', icon: Music },
  { id: 'playground', label: 'Bolalar maydonchasi', icon: Baby },
  { id: 'stage', label: 'Sahna va Yorug\'lik effektlari', icon: Sparkles },
  { id: 'accessible', label: 'Nogironlar uchun qulaylik', icon: Accessibility },
  { id: 'security', label: 'Xavfsizlik xizmati (CCTV)', icon: Shield },
];

// Zod Form Validation Schema
const venueFormSchema = z.object({
  venue_type: z.enum(['HALL', 'BAR']),
  name: z.string().min(3, "Nomi kamida 3 ta belgidan iborat bo'lishi shart"),
  description: z.string().min(10, "Tavsif kamida 10 ta belgidan iborat bo'lishi shart"),
  region: z.string().min(1, "Viloyatni tanlang"),
  district: z.string().min(1, "Tuman/Shaharni tanlang"),
  address: z.string().min(5, "Aniq manzilni kiriting"),
  map_link: z.string().optional(),
  capacity: z.coerce.number().min(10, "Sig'im kamida 10 kishi bo'lishi kerak"),
  required_deposit: z.string().min(1, "Zakalat miqdorini kiriting"),
  price_per_unit: z.string().min(1, "Narxni kiriting"),
  video_url: z.string().optional(),
  amenities: z.array(z.string()).default([]),
});

type VenueFormData = z.infer<typeof venueFormSchema>;

export default function AddVenuePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cover Image & Gallery Previews State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // React Hook Form initialization
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
      region: 'Toshkent shahri',
      district: 'Yunusobod',
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
  const selectedRegion = watch('region');

  // Handle Cover Image selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Handle Multiple Gallery Images selection
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

  // React Query Mutations
  const createHallMutation = useMutation({
    mutationFn: createHallRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ownerHalls'] }),
  });

  const createBarMutation = useMutation({
    mutationFn: createBarRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ownerBars'] }),
  });

  // Submit Handler: Constructs FormData payload with files and metadata
  const onSubmit = async (values: VenueFormData) => {
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      
      const fullAddress = `${values.region}, ${values.district}, ${values.address}`;
      formData.append('address', fullAddress);
      
      formData.append('required_deposit', values.required_deposit);

      if (values.map_link) formData.append('map_link', values.map_link);
      if (values.video_url) formData.append('video_url', values.video_url);

      // Append cover file if selected
      if (coverFile) {
        formData.append('cover_image', coverFile);
      }

      // Append gallery files
      galleryFiles.forEach((file) => {
        formData.append('gallery_images', file);
      });

      // Append amenities array as JSON string or multiple fields
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
      console.error("Form Submit Error:", err);
      const detail = err.response?.data?.detail || err.response?.data?.message;
      setError(detail || "Obyektni saqlashda xatolik yuz berdi. Iltimos qayta urining.");
    }
  };

  const isFormSubmitting = isSubmitting || createHallMutation.isPending || createBarMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
          Yangi Joy Qo&apos;shish
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Platformaga to&apos;yxonangiz yoki baringiz haqida to&apos;liq va jozibador ma&apos;lumotlarni kiriting.
        </p>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-500 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 shadow-sm">
          <Check className="h-5 w-5 shrink-0" />
          <span>Yangi joy muvaffaqiyatli saqlandi! &quot;Mening joylarim&quot; sahifasiga o&apos;tkazilmoqda...</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* SECTION 1: Asosiy Ma'lumotlar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <Hotel className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">1. Asosiy ma&apos;lumotlar</h3>
              <p className="text-xs text-slate-400">Joy turi, nomi va umumiy tavsifini kiriting</p>
            </div>
          </div>

          {/* Joy Turi Select Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Joy turi</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue('venue_type', 'HALL')}
                className={`flex items-center justify-center gap-3 rounded-2xl border p-4 transition-all duration-200 ${
                  selectedVenueType === 'HALL'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40'
                }`}
              >
                <Hotel className="h-6 w-6" />
                <span className="text-sm font-bold">To&apos;yxona (Wedding Hall)</span>
              </button>

              <button
                type="button"
                onClick={() => setValue('venue_type', 'BAR')}
                className={`flex items-center justify-center gap-3 rounded-2xl border p-4 transition-all duration-200 ${
                  selectedVenueType === 'BAR'
                    ? 'border-pink-600 bg-pink-50/50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-400 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40'
                }`}
              >
                <Wine className="h-6 w-6" />
                <span className="text-sm font-bold">Bar / Lounge</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Joy Nomi *</label>
              <input
                type="text"
                placeholder={selectedVenueType === 'HALL' ? "Masalan: Yulduz Koshonasi" : "Masalan: Grand Bar & Lounge"}
                {...register('name')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Maksimal Sig&apos;im (Kishi) *</label>
              <input
                type="number"
                placeholder="500"
                {...register('capacity')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {errors.capacity && <p className="mt-1 text-xs text-rose-500">{errors.capacity.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Joy haqida batafsil tavsif *</label>
            <textarea
              rows={4}
              placeholder="Joyingizning asosiy ustunliklari, menyu imkoniyatlari va sharoitlari haqida yozing..."
              {...register('description')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>}
          </div>
        </div>

        {/* SECTION 2: Manzil va Lokatsiya */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">2. Manzil va Lokatsiya</h3>
              <p className="text-xs text-slate-400">Joyingizning aniq geografik joylashuvini belgilang</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Viloyat *</label>
              <select
                {...register('region')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {Object.keys(REGIONS).map((reg) => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tuman / Shahar *</label>
              <select
                {...register('district')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {(REGIONS[selectedRegion] || []).map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Aniq ko&apos;cha va bino raqami *</label>
            <input
              type="text"
              placeholder="Masalan: Yunusobod tumani, A.Temur ko'chasi 45-uy"
              {...register('address')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {errors.address && <p className="mt-1 text-xs text-rose-500">{errors.address.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Google / Yandex Xarita Havolasi (Ixtiyoriy)</label>
            <input
              type="url"
              placeholder="https://maps.google.com/?q=..."
              {...register('map_link')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* SECTION 3: Moliyaviy Ma'lumotlar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">3. Moliyaviy ma&apos;lumotlar</h3>
              <p className="text-xs text-slate-400">Zakalat miqdori va ijara narxlarini belgilang</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Talab qilinadigan Zakalat (UZS) *</label>
              <input
                type="text"
                placeholder="5000000"
                {...register('required_deposit')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {errors.required_deposit && <p className="mt-1 text-xs text-rose-500">{errors.required_deposit.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {selectedVenueType === 'HALL' ? "Har bir kishi / paket narxi (UZS) *" : "1 soatlik ijara narxi (UZS) *"}
              </label>
              <input
                type="text"
                placeholder={selectedVenueType === 'HALL' ? "150000" : "300000"}
                {...register('price_per_unit')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {errors.price_per_unit && <p className="mt-1 text-xs text-rose-500">{errors.price_per_unit.message}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 4: Media (Rasm va Video yuklash) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">4. Media (Rasm va Video yuklash)</h3>
              <p className="text-xs text-slate-400">Joyingizning sifatli va jozibador fotosuratlarini yuklang</p>
            </div>
          </div>

          {/* Asosiy Cover Rasm */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Asosiy Rasm (Cover Photo)</label>
            <div className="flex items-center gap-6">
              {coverPreview ? (
                <div className="relative h-32 w-48 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  <img src={coverPreview} alt="Cover Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                    className="absolute top-2 right-2 rounded-full bg-rose-600 p-1 text-white shadow-md hover:bg-rose-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 transition-colors">
                  <UploadCloud className="h-8 w-8 text-indigo-500 mb-1" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Rasm yuklash</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                </label>
              )}
            </div>
          </div>

          {/* Galereya (Multiple Images) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Qo&apos;shimcha Galereya Rasmlari (3-5 ta rasm)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {galleryPreviews.map((preview, idx) => (
                <div key={idx} className="relative h-28 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  <img src={preview} alt={`Gallery ${idx}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-1.5 right-1.5 rounded-full bg-rose-600 p-1 text-white shadow hover:bg-rose-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <label className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 transition-colors">
                <Plus className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-500">Rasm qo&apos;shish</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
              </label>
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <Video className="h-4 w-4 text-purple-500" /> Video Havolasi (YouTube / Instagram Reels)
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              {...register('video_url')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* SECTION 5: Qo'shimcha Qulayliklar (Amenities) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">5. Qo&apos;shimcha Qulayliklar</h3>
              <p className="text-xs text-slate-400">Mijozlar uchun yaratilgan qulayliklarni tanlang</p>
            </div>
          </div>

          <Controller
            name="amenities"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {AMENITIES_LIST.map((item) => {
                  const Icon = item.icon;
                  const isChecked = field.value?.includes(item.id);

                  return (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40'
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
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="text-xs">{item.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isFormSubmitting}
          className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isFormSubmitting ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Saqlanmoqda...</span>
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              <span>Saqlash va Joyni e&apos;lon qilish</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
