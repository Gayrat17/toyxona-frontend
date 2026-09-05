import {
  Accessibility,
  Baby,
  Car,
  Coffee,
  ShieldCheck,
  Sparkles,
  Utensils,
  Volume2,
  Wifi,
  Wind,
} from 'lucide-react';

export const AMENITIES = [
  { id: 'parking', label: 'Avtoturargoh', icon: Car },
  { id: 'wifi', label: 'Bepul Wi-Fi', icon: Wifi },
  { id: 'ac', label: 'Konditsioner', icon: Wind },
  { id: 'sound', label: 'Ovoz apparaturasi', icon: Volume2 },
  { id: 'playground', label: 'Bolalar maydonchasi', icon: Baby },
  { id: 'stage', label: 'Sahna va yorug‘lik', icon: Sparkles },
  { id: 'accessible', label: 'Qulay kirish imkoniyati', icon: Accessibility },
  { id: 'security', label: 'Xavfsizlik (CCTV)', icon: ShieldCheck },
  { id: 'kitchen', label: 'Oshxona', icon: Utensils },
  { id: 'coffee', label: 'Kofe / choy hududi', icon: Coffee },
];
