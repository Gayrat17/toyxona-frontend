'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { fetchHallByIdRequest, updateHallRequest, fetchRegionsRequest } from '@/services/venues';
import { WeddingHall, Region } from '@/types';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { 
  Hotel, MapPin, Users, DollarSign, Image as ImageIcon, 
  Sparkles, Video, ArrowLeft, Save, UploadCloud, Plus, X, Check, Loader2,
  Car, Wifi, Wind, Volume2, ShieldCheck, Coffee, Utensils
} from 'lucide-react';

const AMENITIES_LIST = [
  { id: 'parking', label: 'Avtoturargoh (Parking)', icon: Car },
  { id: 'wifi', label: 'Yuqori tezlikdagi Wi-Fi', icon: Wifi },
  { id: 'ac', label: 'Konditsioner tizimi', icon: Wind },
  { id: 'sound', label: 'Professional ovoz tizimi', icon: Volume2 },
  { id: 'security', label: 'Qo\'riqlash va Video-kuzatuv', icon: ShieldCheck },
  { id: 'kitchen', label: 'Professional oshxona', icon: Utensils },
  { id: 'coffee', label: 'Kofe / Choy hududi', icon: Coffee },
];

const hallEditSchema = z.object({
  name: z.string().min(3, "Restoran nomi kamida 3 ta belgidan iborat bo'lishi kerak"),
  description: z.string().min(10, "Tavsif kamida 10 ta belgidan iborat bo'lishi kerak"),
  region: z.string().min(1, "Viloyatni tanlang"),
  district: z.string().min(1, "Tumanni tanlang"),
  address: z.string().min(5, "Aniq manzilni kiriting"),
  map_link: z.string().optional(),
  max_capacity: z.coerce.number().min(10, "Sig'im kamida 10 kishi bo'lishi kerak"),
  required_deposit: z.string().min(1, "Zakalat miqdorini kiriting"),
  price_per_person: z.string().optional(),
  video_url: z.string().optional(),
  amenities: z.array(z.string()).default([]),
});

type HallEditFormData = z.infer<typeof hallEditSchema>;

export default function WeddingHallEditPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = Number(params?.id);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cover & Gallery Media state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isCoverDeleted, setIsCoverDeleted] = useState(false);

  const [existingGallery, setExistingGallery] = useState<Array<{ id: number; url: string }>>([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<number[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);

  // 1. Fetch Hall details and DB Regions
  const { data: dbRegions = [] } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: fetchRegionsRequest,
    staleTime: 0,
  });

  const { data: hall, isLoading, isError, error: fetchError } = useQuery<WeddingHall>({
    queryKey: ['hallDetail', id],
    queryFn: () => fetchHallByIdRequest(id),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<HallEditFormData>({
    resolver: zodResolver(hallEditSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      region: '',
      district: '',
      address: '',
      map_link: '',
      max_capacity: 300,
      required_deposit: '5000000',
      price_per_person: '150000',
      video_url: '',
      amenities: ['parking', 'wifi', 'ac', 'sound'],
    },
  });

  // 2. Populate form fields and media previews when hall data arrives
  useEffect(() => {
    if (hall) {
      if (hall.cover_image_url) {
        setCoverPreview(hall.cover_image_url);
      } else {
        setCoverPreview(null);
      }
      setIsCoverDeleted(false);

      if (hall.gallery_images && hall.gallery_images.length > 0) {
        const existing = hall.gallery_images
          .map((img: any) => ({
            id: img.id,
            url: img.image_url || img.image,
          }))
          .filter((img: any) => Boolean(img.url));
        setExistingGallery(existing);
      } else {
        setExistingGallery([]);
      }
      setDeletedGalleryIds([]);
      setNewGalleryFiles([]);
      setNewGalleryPreviews([]);

      reset({
        name: hall.name || '',
        description: hall.description || '',
        region: hall.region ? String(hall.region) : '',
        district: hall.district ? String(hall.district) : '',
        address: hall.address || '',
        map_link: hall.map_link || '',
        video_url: hall.video_url || '',
        max_capacity: hall.max_capacity || 300,
        required_deposit: hall.required_deposit || '5000000',
        price_per_person: '150000',
        amenities: Array.isArray(hall.amenities) && hall.amenities.length > 0 ? hall.amenities : ['parking', 'wifi', 'ac', 'sound'],
      });
    }
  }, [hall, reset]);

  const selectedRegionId = watch('region');

  const selectedRegionObj = React.useMemo(() => {
    return dbRegions.find((r) => String(r.id) === String(selectedRegionId)) || null;
  }, [dbRegions, selectedRegionId]);

  const currentDistricts = selectedRegionObj?.districts || [];

  // Media Handlers
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setIsCoverDeleted(false);
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setIsCoverDeleted(true);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewGalleryFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setNewGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveExistingGalleryImage = (imageId: number) => {
    setDeletedGalleryIds((prev) => [...prev, imageId]);
    setExistingGallery((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleRemoveNewGalleryImage = (index: number) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 3. React Query Mutation for PATCH /api/v1/venues/halls/[id]/
  const updateHallMutation = useMutation({
    mutationFn: (data: FormData | any) => updateHallRequest(id, data),
    onSuccess: (updatedHall: any) => {
      setCoverFile(null);
      setIsCoverDeleted(false);
      setNewGalleryFiles([]);
      setNewGalleryPreviews([]);
      setDeletedGalleryIds([]);

      if (updatedHall?.cover_image_url) {
        setCoverPreview(updatedHall.cover_image_url);
      } else {
        setCoverPreview(null);
      }

      if (updatedHall?.gallery_images && updatedHall.gallery_images.length > 0) {
        const existing = updatedHall.gallery_images.map((g: any) => ({
          id: g.id,
          url: g.image_url || g.image,
        })).filter((g: any) => Boolean(g.url));
        setExistingGallery(existing);
      } else {
        setExistingGallery([]);
      }

      queryClient.invalidateQueries({ queryKey: ['hallDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['ownerHalls'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });

  const onSubmit = async (values: HallEditFormData) => {
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('max_capacity', values.max_capacity.toString());
      formData.append('required_deposit', values.required_deposit);
      formData.append('address', values.address);
      if (values.region) formData.append('region', values.region);
      if (values.district) formData.append('district', values.district);

      if (values.map_link) formData.append('map_link', values.map_link);
      if (values.video_url) formData.append('video_url', values.video_url);

      if (isCoverDeleted && !coverFile) {
        formData.append('delete_cover_image', 'true');
      }

      if (coverFile) {
        formData.append('cover_image', coverFile);
      }

      if (deletedGalleryIds.length > 0) {
        formData.append('deleted_gallery_ids', JSON.stringify(deletedGalleryIds));
      }

      newGalleryFiles.forEach((file) => {
        formData.append('gallery_images', file);
      });

      formData.append('amenities', JSON.stringify(values.amenities));

      await updateHallMutation.mutateAsync(formData);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err: any) {
      console.error("Update Error:", err);
      let detail = "O'zgarishlarni saqlashda xatolik yuz berdi. Iltimos qayta urining.";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          detail = data;
        } else if (typeof data === 'object') {
          const fieldErrors = Object.entries(data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ');
          if (fieldErrors) detail = fieldErrors;
        }
      }
      setError(detail);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <SkeletonCardLoader count={2} />
      </div>
    );
  }

  if (isError || !hall) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <ErrorAlert 
          message={fetchError instanceof Error ? fetchError.message : "Restoran ma'lumotlarini yuklashda xatolik yuz berdi."} 
        />
        <Link 
          href="/dashboard/venues"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" /> Ro&apos;yxatga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link href="/dashboard/venues" className="hover:text-indigo-600 transition-colors">Joylar ro&apos;yxati</Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-200">Restoranni tahrirlash</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Hotel className="h-7 w-7 text-indigo-600" />
            {hall.name} - Tahrirlash
          </h1>
        </div>

        <Link
          href="/dashboard/venues"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> Orqaga
        </Link>
      </div>

      {/* Global Alerts */}
      {error && <ErrorAlert message={error} />}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Muvaffaqiyatli saqlandi!</p>
            <p className="text-xs opacity-90">Restoran ma&apos;lumotlari va rasmlari bazaga muvaffaqiyatli saqlandi.</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* CARD 1: Asosiy Ma'lumotlar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <Hotel className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">1. Asosiy Ma&apos;lumotlar</h3>
              <p className="text-xs text-slate-400">Restoranning nomi, sig&apos;imi va umumiy tavsifini o&apos;zgartiring</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Restoran Nomi *</label>
              <input
                type="text"
                {...register('name')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Maksimal Sig&apos;im (Kishi) *</label>
              <input
                type="number"
                {...register('max_capacity')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {errors.max_capacity && <p className="mt-1 text-xs text-rose-500">{errors.max_capacity.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">To&apos;liq Tavsif *</label>
            <textarea
              rows={4}
              {...register('description')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>}
          </div>
        </div>

        {/* CARD 2: Manzil va Lokatsiya */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">2. Manzil va Lokatsiya</h3>
              <p className="text-xs text-slate-400">Viloyat, tuman va ko&apos;cha ma&apos;lumotlarini yangilang</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Viloyat *</label>
              <select
                {...register('region')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Viloyatni tanlang</option>
                {dbRegions.map((reg) => (
                  <option key={reg.id} value={String(reg.id)}>{reg.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tuman / Shahar *</label>
              <select
                {...register('district')}
                disabled={!selectedRegionId}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Tumanni tanlang</option>
                {currentDistricts.map((dist) => (
                  <option key={dist.id} value={String(dist.id)}>{dist.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Aniq manzil *</label>
            <input
              type="text"
              {...register('address')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {errors.address && <p className="mt-1 text-xs text-rose-500">{errors.address.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Google / Yandex Xarita havolasi</label>
            <input
              type="url"
              placeholder="https://maps.google.com/..."
              {...register('map_link')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* CARD 3: Moliyaviy Ko'rsatkichlar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">3. Moliyaviy ko&apos;rsatkichlar</h3>
              <p className="text-xs text-slate-400">Zakalat miqdori va paket narxlarini o&apos;zgartiring</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Talab qilinadigan Zakalat (UZS) *</label>
              <input
                type="text"
                {...register('required_deposit')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {errors.required_deposit && <p className="mt-1 text-xs text-rose-500">{errors.required_deposit.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Odam boshiga / Paket narxi (UZS)</label>
              <input
                type="text"
                {...register('price_per_person')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* CARD 4: Media (Rasm va Video) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">4. Media (Rasm va Video)</h3>
              <p className="text-xs text-slate-400">Yangi rasmlarni yuklang, keraksiz rasmlardagi &quot;X&quot; ni bosib o&apos;chiring</p>
            </div>
          </div>

          {/* Asosiy Rasm (Cover) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Asosiy Rasm (Cover)</label>
            <div className="flex items-center gap-6">
              {coverPreview ? (
                <div className="relative h-36 w-56 overflow-hidden rounded-2xl border border-slate-200 shadow-sm group">
                  <img src={coverPreview} alt="Cover Preview" className="h-full w-full object-cover" />
                  <label className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold gap-1">
                    <UploadCloud className="h-5 w-5" /> Rasm almashtirish
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    title="Rasmni o'chirish"
                    className="absolute top-2 right-2 rounded-full bg-rose-600 p-1.5 text-white shadow-md hover:bg-rose-500 z-10 transition-transform hover:scale-110"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-36 w-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 transition-colors">
                  <UploadCloud className="h-8 w-8 text-indigo-500 mb-1" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Rasm yuklash</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                </label>
              )}
            </div>
          </div>

          {/* Qo'shimcha Galereya Rasmlari */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Qo&apos;shimcha Galereya Rasmlari</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Existing Gallery Images */}
              {existingGallery.map((img) => (
                <div key={`existing-${img.id}`} className="relative h-28 overflow-hidden rounded-2xl border border-slate-200 shadow-sm group">
                  <img src={img.url} alt={`Gallery ${img.id}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingGalleryImage(img.id)}
                    title="Rasmni o'chirish"
                    className="absolute top-1.5 right-1.5 rounded-full bg-rose-600 p-1 text-white shadow hover:bg-rose-500 z-10 transition-transform hover:scale-110"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* Newly Added Gallery Files */}
              {newGalleryPreviews.map((preview, idx) => (
                <div key={`new-${idx}`} className="relative h-28 overflow-hidden rounded-2xl border border-indigo-300 shadow-sm group">
                  <img src={preview} alt={`New Gallery ${idx}`} className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">Yangi</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewGalleryImage(idx)}
                    title="Rasmni o'chirish"
                    className="absolute top-1.5 right-1.5 rounded-full bg-rose-600 p-1 text-white shadow hover:bg-rose-500 z-10 transition-transform hover:scale-110"
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">YouTube Video Havolasi</label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              {...register('video_url')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* CARD 5: Qo'shimcha Qulayliklar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">5. Qo&apos;shimcha Qulayliklar</h3>
              <p className="text-xs text-slate-400">Restorandagi yaratilgan imkoniyatlarni tanlang</p>
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
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const current = field.value || [];
                          if (e.target.checked) {
                            field.onChange([...current, item.id]);
                          } else {
                            field.onChange(current.filter((val) => val !== item.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Icon className="h-4 w-4 shrink-0 text-indigo-500" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </div>

        {/* Submit Actions Bar */}
        <div className="flex items-center justify-end gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
          <Link
            href="/dashboard/venues"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            Bekor qilish
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || updateHallMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || updateHallMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>O&apos;zgarishlarni saqlash</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
