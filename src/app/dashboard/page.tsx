'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/common/protected-route';
import { useAuth } from '@/store/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchHallsRequest, 
  fetchBarsRequest, 
  fetchShiftsRequest,
  createHallRequest, 
  createBarRequest, 
  createShiftRequest, 
  createPackageRequest, 
  createShiftBlockRequest 
} from '@/services/venues';
import { 
  fetchHallBookingsRequest, 
  fetchBarBookingsRequest, 
  updateHallBookingStatus, 
  updateBarBookingStatus 
} from '@/services/bookings';
import { WeddingHall, Bar, Shift, HallBooking, BarBooking } from '@/types';
import { 
  LayoutDashboard, Hotel, Wine, Calendar, Clock, Sparkles, LogOut, 
  Plus, Check, X, AlertCircle, RefreshCw, Layers, Users, MapPin, DollarSign 
} from 'lucide-react';

type TabType = 'MY_VENUES' | 'ADD_VENUE' | 'BOOKINGS' | 'BLOCK_DATE';

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['VENUE_OWNER']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('MY_VENUES');
  const queryClient = useQueryClient();

  // Selected Wedding Hall for shift/package configuration quick-form
  const [selectedHallForConfig, setSelectedHallForConfig] = useState<number | null>(null);

  // Queries for owner's data
  const { data: halls = [], refetch: refetchHalls } = useQuery<WeddingHall[]>({
    queryKey: ['ownerHalls'],
    queryFn: fetchHallsRequest,
  });

  const { data: bars = [], refetch: refetchBars } = useQuery<Bar[]>({
    queryKey: ['ownerBars'],
    queryFn: fetchBarsRequest,
  });

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ['shifts'],
    queryFn: fetchShiftsRequest,
  });

  const { data: hallBookings = [], refetch: refetchHallBookings } = useQuery<HallBooking[]>({
    queryKey: ['hallBookings'],
    queryFn: fetchHallBookingsRequest,
  });

  const { data: barBookings = [], refetch: refetchBarBookings } = useQuery<BarBooking[]>({
    queryKey: ['barBookings'],
    queryFn: fetchBarBookingsRequest,
  });

  // MUTATIONS
  // Create Wedding Hall
  const createHallMutation = useMutation({
    mutationFn: createHallRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerHalls'] });
      setActiveTab('MY_VENUES');
    },
  });

  // Create Bar
  const createBarMutation = useMutation({
    mutationFn: createBarRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerBars'] });
      setActiveTab('MY_VENUES');
    },
  });

  // Create Shift
  const createShiftMutation = useMutation({
    mutationFn: createShiftRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  // Create Package
  const createPackageMutation = useMutation({
    mutationFn: createPackageRequest,
  });

  // Create Shift Block
  const createBlockMutation = useMutation({
    mutationFn: createShiftBlockRequest,
  });

  // Status updates
  const updateHallBookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'CONFIRMED' | 'REJECTED' | 'HOLD' }) => 
      updateHallBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hallBookings'] });
    },
  });

  const updateBarBookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'CONFIRMED' | 'REJECTED' | 'HOLD' }) => 
      updateBarBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barBookings'] });
    },
  });

  // FORM STATES
  // Add Venue Form
  const [venueType, setVenueType] = useState<'HALL' | 'BAR'>('HALL');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueDesc, setVenueDesc] = useState('');
  const [venueCapacity, setVenueCapacity] = useState(300);
  const [venueDeposit, setVenueDeposit] = useState('5000000');
  const [barHourlyPrice, setBarHourlyPrice] = useState('300000');
  const [addVenueError, setAddVenueError] = useState<string | null>(null);

  // Add Shift Form
  const [shiftName, setShiftName] = useState('');
  const [shiftStart, setShiftStart] = useState('11:00');
  const [shiftEnd, setShiftEnd] = useState('15:00');
  const [shiftError, setShiftError] = useState<string | null>(null);

  // Add Package Form
  const [pkgGuestCount, setPkgGuestCount] = useState(300);
  const [pkgPrice, setPkgPrice] = useState('45000000');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgError, setPkgError] = useState<string | null>(null);

  // Block Date Form
  const [blockHallId, setBlockHallId] = useState('');
  const [blockShiftId, setBlockShiftId] = useState('');
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('Remont/Texnik sozlash');
  const [blockError, setBlockError] = useState<string | null>(null);
  const [blockSuccess, setBlockSuccess] = useState(false);

  // Handlers
  const handleAddVenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddVenueError(null);
    try {
      if (venueType === 'HALL') {
        await createHallMutation.mutateAsync({
          name: venueName,
          address: venueAddress,
          description: venueDesc,
          max_capacity: venueCapacity,
          required_deposit: venueDeposit,
        });
      } else {
        await createBarMutation.mutateAsync({
          name: venueName,
          address: venueAddress,
          description: venueDesc,
          capacity: venueCapacity,
          price_per_hour: barHourlyPrice,
          required_deposit: venueDeposit,
        });
      }
      // Reset
      setVenueName('');
      setVenueAddress('');
      setVenueDesc('');
    } catch (err: any) {
      setAddVenueError(err.response?.data?.detail || "Obyekt qo'shishda xatolik yuz berdi.");
    }
  };

  const handleAddShiftSubmit = async (e: React.FormEvent, hallId: number) => {
    e.preventDefault();
    setShiftError(null);
    try {
      await createShiftMutation.mutateAsync({
        hall: hallId,
        name: shiftName,
        start_time: `${shiftStart}:00`,
        end_time: `${shiftEnd}:00`,
      });
      setShiftName('');
    } catch (err: any) {
      setShiftError("Ushbu nomdagi smena zal uchun allaqachon mavjud.");
    }
  };

  const handleAddPackageSubmit = async (e: React.FormEvent, hallId: number) => {
    e.preventDefault();
    setPkgError(null);
    try {
      await createPackageMutation.mutateAsync({
        hall: hallId,
        guest_count: pkgGuestCount,
        price: pkgPrice,
        description: pkgDesc,
      });
      setPkgDesc('');
    } catch (err: any) {
      setPkgError("Ushbu mehmonga mo'ljallangan paket allaqachon mavjud.");
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError(null);
    setBlockSuccess(false);

    if (!blockHallId || !blockShiftId || !blockDate) {
      setBlockError("Zal, smena va sanani kiritish majburiy.");
      return;
    }

    try {
      await createBlockMutation.mutateAsync({
        hall: parseInt(blockHallId),
        shift: parseInt(blockShiftId),
        date: blockDate,
        reason: blockReason,
      });
      setBlockSuccess(true);
      setBlockDate('');
    } catch (err: any) {
      setBlockError("Ushbu sanadagi smena allaqachon bloklangan yoki band qilingan.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Sidebar Nav */}
      <aside className="w-64 border-r border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800 text-white font-black text-xl tracking-wider">
          <LayoutDashboard className="h-6 w-6 text-indigo-400" />
          <span>B2B PANEL</span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          <button
            onClick={() => setActiveTab('MY_VENUES')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'MY_VENUES'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Hotel className="h-5 w-5" />
            <span>Mening joylarim</span>
          </button>

          <button
            onClick={() => setActiveTab('ADD_VENUE')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'ADD_VENUE'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span>Yangi joy qo&apos;shish</span>
          </button>

          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'BOOKINGS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span>Bronlar</span>
          </button>

          <button
            onClick={() => setActiveTab('BLOCK_DATE')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'BLOCK_DATE'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Kalendarni bloklash</span>
          </button>
        </nav>

        {/* User context & logOut */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/40 p-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.first_name || 'Joy egasi'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.phone_number}</p>
            </div>
            <button 
              onClick={logout}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-500"
              title="Chiqish"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {activeTab === 'MY_VENUES' && "Mening Joylarim Ro'yxati"}
            {activeTab === 'ADD_VENUE' && "Yangi Joy Qo'shish"}
            {activeTab === 'BOOKINGS' && "Foydalanuvchilardan kelgan bronlar"}
            {activeTab === 'BLOCK_DATE' && "Taqvim Smenalarini Bloklash"}
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                refetchHalls();
                refetchBars();
                refetchHallBookings();
                refetchBarBookings();
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              title="Yangilash"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              Venue Owner
            </span>
          </div>
        </header>

        <div className="p-8 flex-1">

          {/* TAB 1: MY_VENUES */}
          {activeTab === 'MY_VENUES' && (
            <div className="space-y-8">
              {/* Halls section */}
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-indigo-600" />
                  <span>To&apos;yxonalar ({halls.length})</span>
                </h3>
                {halls.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {halls.map((hall) => (
                      <div key={`hall-${hall.id}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white">{hall.name}</h4>
                            <p className="text-sm text-slate-400 mt-1 flex items-center gap-1"><MapPin className="h-4 w-4" /> {hall.address}</p>
                          </div>
                          <button
                            onClick={() => setSelectedHallForConfig(selectedHallForConfig === hall.id ? null : hall.id)}
                            className="text-xs font-semibold bg-slate-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1"
                          >
                            <Layers className="h-3.5 w-3.5" />
                            <span>Sozlash</span>
                          </button>
                        </div>

                        <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-500">
                          <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1"><Users className="h-4 w-4" /> Sig&apos;im: {hall.max_capacity} kishi</span>
                          <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1"><DollarSign className="h-4 w-4" /> Zakalat: {parseFloat(hall.required_deposit).toLocaleString()} UZS</span>
                        </div>

                        {/* Config panel triggers */}
                        {selectedHallForConfig === hall.id && (
                          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shift Creation form */}
                            <div className="space-y-4">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Yangi Smena Qo&apos;shish</h5>
                              {shiftError && <p className="text-xs text-rose-500">{shiftError}</p>}
                              <form onSubmit={(e) => handleAddShiftSubmit(e, hall.id)} className="space-y-3">
                                <input
                                  type="text"
                                  placeholder="Smena nomi (Masalan: Kechki)"
                                  required
                                  value={shiftName}
                                  onChange={(e) => setShiftName(e.target.value)}
                                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Boshlanishi (Masalan 18:00)"
                                    required
                                    value={shiftStart}
                                    onChange={(e) => setShiftStart(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Tugashi (Masalan 23:00)"
                                    required
                                    value={shiftEnd}
                                    onChange={(e) => setShiftEnd(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
                                  />
                                </div>
                                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-2 text-xs font-semibold">
                                  Smenani saqlash
                                </button>
                              </form>
                            </div>

                            {/* Package Creation form */}
                            <div className="space-y-4">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Yangi Paket Qo&apos;shish</h5>
                              {pkgError && <p className="text-xs text-rose-500">{pkgError}</p>}
                              <form onSubmit={(e) => handleAddPackageSubmit(e, hall.id)} className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="number"
                                    placeholder="Mehmon soni"
                                    required
                                    value={pkgGuestCount}
                                    onChange={(e) => setPkgGuestCount(parseInt(e.target.value) || 0)}
                                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Paket Narxi (UZS)"
                                    required
                                    value={pkgPrice}
                                    onChange={(e) => setPkgPrice(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
                                  />
                                </div>
                                <input
                                  type="text"
                                  placeholder="Paket tavsifi..."
                                  required
                                  value={pkgDesc}
                                  onChange={(e) => setPkgDesc(e.target.value)}
                                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
                                />
                                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-2 text-xs font-semibold">
                                  Paketni saqlash
                                </button>
                              </form>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Sizda hali to&apos;yxonalar qo&apos;shilmagan.</p>
                )}
              </div>

              {/* Bars section */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Wine className="h-5 w-5 text-indigo-600" />
                  <span>Barlar ({bars.length})</span>
                </h3>
                {bars.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {bars.map((bar) => (
                      <div key={`bar-${bar.id}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white">{bar.name}</h4>
                        <p className="text-sm text-slate-400 mt-1 flex items-center gap-1"><MapPin className="h-4 w-4" /> {bar.address}</p>
                        
                        <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-500">
                          <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1"><Users className="h-4 w-4" /> Sig&apos;im: {bar.capacity} kishi</span>
                          <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1"><DollarSign className="h-4 w-4" /> Soatbay: {parseFloat(bar.price_per_hour).toLocaleString()} UZS</span>
                          <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1"><DollarSign className="h-4 w-4" /> Zakalat: {parseFloat(bar.required_deposit).toLocaleString()} UZS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Sizda hali barlar qo&apos;shilmagan.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ADD_VENUE */}
          {activeTab === 'ADD_VENUE' && (
            <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Yangi Joy Ma&apos;lumotlari</h3>
              
              {addVenueError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-500 border border-rose-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{addVenueError}</span>
                </div>
              )}

              <form onSubmit={handleAddVenueSubmit} className="space-y-6">
                
                {/* Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Joy turi</label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setVenueType('HALL')}
                      className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all duration-200 ${
                        venueType === 'HALL'
                          ? 'border-indigo-600 bg-indigo-500/10 text-indigo-700'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Hotel className="h-6 w-6 mb-1" />
                      <span className="text-xs font-semibold">To&apos;yxona</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVenueType('BAR')}
                      className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all duration-200 ${
                        venueType === 'BAR'
                          ? 'border-indigo-600 bg-indigo-500/10 text-indigo-700'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Wine className="h-6 w-6 mb-1" />
                      <span className="text-xs font-semibold">Bar / Lounge</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Nomi</label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Yulduz Koshonasi"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Manzili</label>
                    <input
                      type="text"
                      required
                      placeholder="Toshkent sh., Yunusobod tumani"
                      value={venueAddress}
                      onChange={(e) => setVenueAddress(e.target.value)}
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Tavsif</label>
                    <textarea
                      placeholder="Batafsil ma'lumotlar..."
                      value={venueDesc}
                      onChange={(e) => setVenueDesc(e.target.value)}
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none h-24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Sig&apos;imi (Kishi)</label>
                      <input
                        type="number"
                        required
                        value={venueCapacity}
                        onChange={(e) => setVenueCapacity(parseInt(e.target.value) || 0)}
                        className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Talab qilinadigan zakalat</label>
                      <input
                        type="text"
                        required
                        value={venueDeposit}
                        onChange={(e) => setVenueDeposit(e.target.value)}
                        className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {venueType === 'BAR' && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Soatbay Ijara Narxi (UZS)</label>
                      <input
                        type="text"
                        required
                        value={barHourlyPrice}
                        onChange={(e) => setBarHourlyPrice(e.target.value)}
                        className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 text-sm font-semibold transition-colors">
                  Saqlash va qo&apos;shish
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: BOOKINGS */}
          {activeTab === 'BOOKINGS' && (
            <div className="space-y-8">
              {/* Hall Bookings table */}
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">To&apos;yxonaga olingan bronlar</h3>
                {hallBookings.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm text-slate-500 dark:text-slate-400">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Mijoz</th>
                          <th className="px-6 py-4">Sana</th>
                          <th className="px-6 py-4">Jami Narx</th>
                          <th className="px-6 py-4">Zakalat holati</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {hallBookings.map((b) => (
                          <tr key={`hb-${b.id}`}>
                            <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                              {b.user_phone || "Mijoz"}
                            </td>
                            <td className="px-6 py-4">{b.date}</td>
                            <td className="px-6 py-4">{parseFloat(b.total_price).toLocaleString()} UZS</td>
                            <td className="px-6 py-4">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                b.is_deposit_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {b.is_deposit_paid ? "To'langan" : "To'lanmagan"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                                b.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                                b.status === 'HOLD' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                              <button
                                onClick={() => updateHallBookingMutation.mutate({ id: b.id, status: 'CONFIRMED' })}
                                className="rounded p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                title="Tasdiqlash"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateHallBookingMutation.mutate({ id: b.id, status: 'HOLD' })}
                                className="rounded p-1 bg-amber-50 text-amber-600 hover:bg-amber-100"
                                title="Muzlatish"
                              >
                                <Clock className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateHallBookingMutation.mutate({ id: b.id, status: 'REJECTED' })}
                                className="rounded p-1 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                title="Rad etish"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">To&apos;yxonaga kelib tushgan bronlar yo&apos;q.</p>
                )}
              </div>

              {/* Bar Bookings table */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Bar uchun olingan bronlar</h3>
                {barBookings.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm text-slate-500 dark:text-slate-400">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Mijoz</th>
                          <th className="px-6 py-4">Sana</th>
                          <th className="px-6 py-4">Vaqt</th>
                          <th className="px-6 py-4">Jami Narx</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {barBookings.map((b) => (
                          <tr key={`bb-${b.id}`}>
                            <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                              {b.user_phone || "Mijoz"}
                            </td>
                            <td className="px-6 py-4">{b.date}</td>
                            <td className="px-6 py-4">{b.start_time.substring(0, 5)} - {b.end_time.substring(0, 5)}</td>
                            <td className="px-6 py-4">{parseFloat(b.total_price).toLocaleString()} UZS</td>
                            <td className="px-6 py-4">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                                b.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                                b.status === 'HOLD' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                              <button
                                onClick={() => updateBarBookingMutation.mutate({ id: b.id, status: 'CONFIRMED' })}
                                className="rounded p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                title="Tasdiqlash"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateBarBookingMutation.mutate({ id: b.id, status: 'HOLD' })}
                                className="rounded p-1 bg-amber-50 text-amber-600 hover:bg-amber-100"
                                title="Muzlatish"
                              >
                                <Clock className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateBarBookingMutation.mutate({ id: b.id, status: 'REJECTED' })}
                                className="rounded p-1 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                title="Rad etish"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Bar uchun kelib tushgan bronlar yo&apos;q.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BLOCK_DATE */}
          {activeTab === 'BLOCK_DATE' && (
            <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Smenani Bloklash Formasi</h3>
              
              {blockError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-500 border border-rose-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{blockError}</span>
                </div>
              )}

              {blockSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-600 border border-emerald-500/20">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>Smena ko&apos;rsatilgan sanada muvaffaqiyatli bloklandi.</span>
                </div>
              )}

              <form onSubmit={handleBlockSubmit} className="space-y-4">
                
                {/* Wedding Hall select */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">1. To&apos;yxonani tanlang</label>
                  <select
                    value={blockHallId}
                    onChange={(e) => {
                      setBlockHallId(e.target.value);
                      setBlockShiftId('');
                    }}
                    required
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  >
                    <option value="">-- Tanlang --</option>
                    {halls.map((hall) => (
                      <option key={`opt-hall-${hall.id}`} value={hall.id}>{hall.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">2. Sanani tanlang</label>
                  <input
                    type="date"
                    required
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Shift selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">3. Smenani tanlang</label>
                  <select
                    value={blockShiftId}
                    onChange={(e) => setBlockShiftId(e.target.value)}
                    required
                    disabled={!blockHallId}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none disabled:opacity-50"
                  >
                    <option value="">-- Tanlang --</option>
                    {shifts
                      .filter((s) => s.hall === parseInt(blockHallId))
                      .map((shift) => (
                        <option key={`opt-shift-${shift.id}`} value={shift.id}>{shift.name}</option>
                      ))}
                  </select>
                </div>

                {/* Reason text input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">4. Bloklash sababi</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Ta'mirlash ishlari (Remont)"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 text-sm font-semibold transition-colors mt-6">
                  Smenani yopish (Bloklash)
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
