import { AccentId, WallpaperId } from './types';

export interface WallpaperConfig {
  id: WallpaperId;
  name: string;
  previewGradient: string;
  darkBackground: string;
  lightBackground: string;
}

export const WALLPAPERS: WallpaperConfig[] = [
  {
    id: 'ash',
    name: 'Ash',
    previewGradient: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
    darkBackground:
      'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(99, 110, 133, 0.28) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 85% 85%, rgba(45, 55, 72, 0.4) 0%, transparent 60%), #111319',
    lightBackground:
      'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(203, 213, 225, 0.6) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 85% 85%, rgba(226, 232, 240, 0.6) 0%, transparent 60%), #f8fafc',
  },
  {
    id: 'sand',
    name: 'Sand',
    previewGradient: 'linear-gradient(135deg, #b45309 0%, #451a03 100%)',
    darkBackground:
      'radial-gradient(ellipse 80% 50% at 15% 10%, rgba(217, 119, 6, 0.25) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 85% 85%, rgba(146, 64, 14, 0.28) 0%, transparent 60%), #141210',
    lightBackground:
      'radial-gradient(ellipse 80% 50% at 15% 10%, rgba(254, 215, 170, 0.7) 0%, transparent 65%), #faf8f5',
  },
  {
    id: 'sage',
    name: 'Sage',
    previewGradient: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
    darkBackground:
      'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(16, 185, 129, 0.22) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(5, 150, 105, 0.22) 0%, transparent 60%), #0e1614',
    lightBackground:
      'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(167, 243, 208, 0.6) 0%, transparent 65%), #f4fbf7',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    previewGradient: 'linear-gradient(135deg, #0d9488 0%, #7c3aed 100%)',
    darkBackground:
      'radial-gradient(ellipse 70% 50% at 10% 10%, rgba(20, 184, 166, 0.28) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 90% 40%, rgba(139, 92, 246, 0.3) 0%, transparent 60%), #0f1222',
    lightBackground:
      'radial-gradient(ellipse 70% 50% at 10% 10%, rgba(153, 246, 228, 0.6) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 90% 40%, rgba(221, 214, 254, 0.6) 0%, transparent 60%), #f8f9ff',
  },
  {
    id: 'smoke',
    name: 'Smoke',
    previewGradient: 'linear-gradient(135deg, #3f3f46 0%, #18181b 100%)',
    darkBackground:
      'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 60%), #0d0e12',
    lightBackground:
      'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(0, 0, 0, 0.03) 0%, transparent 60%), #f4f4f6',
  },
  {
    id: 'tide',
    name: 'Tide',
    previewGradient: 'linear-gradient(135deg, #0284c7 0%, #1e3a8a 100%)',
    darkBackground:
      'radial-gradient(ellipse 80% 50% at 15% 10%, rgba(14, 165, 233, 0.28) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 85% 80%, rgba(37, 99, 235, 0.32) 0%, transparent 60%), #0c1424',
    lightBackground:
      'radial-gradient(ellipse 80% 50% at 15% 10%, rgba(186, 230, 253, 0.7) 0%, transparent 65%), #f0f7ff',
  },
  {
    id: 'bloom',
    name: 'Bloom',
    previewGradient: 'linear-gradient(135deg, #db2777 0%, #581c87 100%)',
    darkBackground:
      'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(236, 72, 153, 0.26) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(168, 85, 247, 0.28) 0%, transparent 60%), #1a0f22',
    lightBackground:
      'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(251, 207, 232, 0.6) 0%, transparent 65%), #fff5fb',
  },
  {
    id: 'ember',
    name: 'Ember',
    previewGradient: 'linear-gradient(135deg, #ea580c 0%, #881337 100%)',
    darkBackground:
      'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(249, 115, 22, 0.28) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(225, 29, 72, 0.25) 0%, transparent 60%), #1a0f0d',
    lightBackground:
      'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(254, 215, 170, 0.6) 0%, transparent 65%), #fff8f5',
  },
  {
    id: 'grove',
    name: 'Grove',
    previewGradient: 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)',
    darkBackground:
      'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(34, 197, 94, 0.24) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(16, 185, 129, 0.26) 0%, transparent 60%), #0c1811',
    lightBackground:
      'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(187, 247, 208, 0.6) 0%, transparent 65%), #f2fbf5',
  },
  {
    id: 'dusk',
    name: 'Dusk',
    previewGradient: 'linear-gradient(135deg, #7c3aed 0%, #312e81 100%)',
    darkBackground:
      'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(139, 92, 246, 0.3) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 60%), #141126',
    lightBackground:
      'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(221, 214, 254, 0.6) 0%, transparent 65%), #f7f5ff',
  },
];

export interface AccentConfig {
  id: AccentId;
  name: string;
  hex: string;
  gradient: string;
  glow: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  activeNavGlow: string;
}

export const ACCENTS: Record<AccentId, AccentConfig> = {
  blue: {
    id: 'blue',
    name: 'Azul',
    hex: '#3b82f6',
    gradient: 'from-blue-600 to-sky-500',
    glow: 'rgba(59, 130, 246, 0.4)',
    textClass: 'text-blue-400',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-500/40',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    activeNavGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.35)]',
  },
  purple: {
    id: 'purple',
    name: 'Roxo',
    hex: '#8b5cf6',
    gradient: 'from-purple-600 to-indigo-500',
    glow: 'rgba(139, 92, 246, 0.4)',
    textClass: 'text-purple-400',
    bgClass: 'bg-purple-500',
    borderClass: 'border-purple-500/40',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    activeNavGlow: 'shadow-[0_0_20px_rgba(139,92,246,0.35)]',
  },
  pink: {
    id: 'pink',
    name: 'Rosa',
    hex: '#ec4899',
    gradient: 'from-pink-600 to-rose-500',
    glow: 'rgba(236, 72, 153, 0.4)',
    textClass: 'text-pink-400',
    bgClass: 'bg-pink-500',
    borderClass: 'border-pink-500/40',
    badgeClass: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    activeNavGlow: 'shadow-[0_0_20px_rgba(236,72,153,0.35)]',
  },
  orange: {
    id: 'orange',
    name: 'Laranja',
    hex: '#f97316',
    gradient: 'from-orange-600 to-amber-500',
    glow: 'rgba(249, 115, 22, 0.4)',
    textClass: 'text-orange-400',
    bgClass: 'bg-orange-500',
    borderClass: 'border-orange-500/40',
    badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    activeNavGlow: 'shadow-[0_0_20px_rgba(249,115,22,0.35)]',
  },
  green: {
    id: 'green',
    name: 'Verde',
    hex: '#10b981',
    gradient: 'from-emerald-600 to-teal-500',
    glow: 'rgba(16, 185, 129, 0.4)',
    textClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500/40',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    activeNavGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
  },
  gray: {
    id: 'gray',
    name: 'Cinza',
    hex: '#64748b',
    gradient: 'from-slate-600 to-zinc-500',
    glow: 'rgba(100, 116, 139, 0.4)',
    textClass: 'text-slate-300',
    bgClass: 'bg-slate-500',
    borderClass: 'border-slate-500/40',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    activeNavGlow: 'shadow-[0_0_20px_rgba(100,116,139,0.35)]',
  },
};
