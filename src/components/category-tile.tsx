// Kategori vitrin görselleri: public/categories/ altında aşağıdaki adla bir
// .jpg varsa fotoğraf gösterilir, yoksa stilize oda sahnesi (SVG) çizilir.
// Fotoğraf değiştirmek/eklemek için dosyayı doğru adla klasöre koymak yeterli:
//   roller.jpg, cellular.jpg, roman.jpg, curtain.jpg, zebra.jpg,
//   venetian.jpg, wood.jpg, sheer.jpg, blackout.jpg, tulle.jpg

import { existsSync } from 'fs'
import path from 'path'
import { CATEGORY_LABELS } from '@/lib/labels'
import type { ProductCategory } from '@/lib/types'

const PHOTO_FILES: Partial<Record<ProductCategory, string>> = {
  ROLLER_BLIND: 'roller.jpg',
  CELLULAR_SHADE: 'cellular.jpg',
  ROMAN_SHADE: 'roman.jpg',
  CURTAIN: 'curtain.jpg',
  ZEBRA_BLIND: 'zebra.jpg',
  VENETIAN_BLIND: 'venetian.jpg',
  WOOD_BLIND: 'wood.jpg',
  SHEER: 'sheer.jpg',
  BLACKOUT: 'blackout.jpg',
  TULLE: 'tulle.jpg',
}

function photoFor(category: ProductCategory): string | null {
  const file = PHOTO_FILES[category]
  if (!file) return null
  return existsSync(path.join(process.cwd(), 'public', 'categories', file))
    ? `/categories/${file}`
    : null
}

const SCENE: Record<string, { wall: string; main: string; accent: string }> = {
  ROLLER_BLIND: { wall: '#F3EFE7', main: '#C9BCA4', accent: '#A5977C' },
  CELLULAR_SHADE: { wall: '#F1EEE8', main: '#E3D9C4', accent: '#C2B08D' },
  ROMAN_SHADE: { wall: '#EFEDE8', main: '#A9A294', accent: '#8A8274' },
  CURTAIN: { wall: '#F2EEE9', main: '#B57B3F', accent: '#96632F' },
  ZEBRA_BLIND: { wall: '#F1F0EC', main: '#D8D2C4', accent: '#8E8878' },
  VENETIAN_BLIND: { wall: '#EFF0F1', main: '#B9BEC4', accent: '#979CA3' },
  WOOD_BLIND: { wall: '#F3EEE6', main: '#B08050', accent: '#8A6238' },
  SHEER: { wall: '#F5F3EE', main: '#EDEAE0', accent: '#D9D4C6' },
  BLACKOUT: { wall: '#E9E7E3', main: '#4A4C52', accent: '#37393E' },
}

export function CategoryTile({ category }: { category: ProductCategory }) {
  const photo = photoFor(category)
  if (photo) {
    // Fotoğraf hangi oranda gelirse gelsin kırpılmadan tam görünür;
    // kutuda boş kalan kenarları aynı fotoğrafın bulanık hali doldurur.
    return (
      <div className="relative h-full w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt={CATEGORY_LABELS[category]}
          loading="lazy"
          className="relative h-full w-full object-contain"
        />
      </div>
    )
  }

  const c = SCENE[category] ?? SCENE.CURTAIN

  return (
    <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" className="h-full w-full object-cover">
      {/* duvar & zemin */}
      <rect width="300" height="200" fill={c.wall} />
      <rect y="164" width="300" height="36" fill="#E4DFD3" />
      {/* pencere */}
      <rect x="86" y="26" width="128" height="122" rx="3" fill="#FFFFFF" stroke="#D8D2C6" strokeWidth="5" />
      <rect x="96" y="36" width="108" height="102" fill={category === 'BLACKOUT' ? '#C6CFD6' : '#DFEAF2'} />

      {category === 'ROLLER_BLIND' && (
        <>
          <rect x="92" y="32" width="116" height="13" rx="6.5" fill={c.accent} />
          <rect x="97" y="43" width="106" height="62" fill={c.main} />
          <rect x="95" y="103" width="110" height="5" rx="2.5" fill={c.accent} />
          <line x1="150" y1="108" x2="150" y2="120" stroke={c.accent} strokeWidth="2" />
          <circle cx="150" cy="122" r="3" fill={c.accent} />
        </>
      )}

      {category === 'CELLULAR_SHADE' && (
        <>
          <rect x="94" y="33" width="112" height="9" rx="2" fill="#C9BFAD" />
          <rect x="95" y="40" width="110" height="72" fill={c.main} />
          {[50, 59, 68, 77, 86, 95, 104].map((y) => (
            <line key={y} x1="95" x2="205" y1={y} y2={y} stroke={c.accent} strokeOpacity="0.5" />
          ))}
          <rect x="94" y="110" width="112" height="5" rx="2.5" fill={c.main} stroke={c.accent} />
        </>
      )}

      {category === 'ROMAN_SHADE' && (
        <>
          <rect x="94" y="33" width="112" height="8" rx="2" fill="#C9BFAD" />
          <rect x="95" y="39" width="110" height="74" fill={c.main} />
          {[60, 80, 100].map((y) => (
            <path key={y} d={`M 95 ${y} Q 150 ${y + 10} 205 ${y}`} fill="none" stroke={c.accent} strokeWidth="3" strokeOpacity="0.7" />
          ))}
          <path d="M 95 113 Q 150 124 205 113" fill={c.main} stroke={c.accent} strokeOpacity="0.6" />
        </>
      )}

      {category === 'CURTAIN' && (
        <>
          <rect x="80" y="26" width="140" height="6" rx="3" fill="#8A7A62" />
          <path d="M 88 32 q 7 60 -3 118 h 32 q -10 -58 -3 -118 z" fill={c.main} />
          <path d="M 212 32 q -7 60 3 118 h -32 q 10 -58 3 -118 z" fill={c.main} />
          <path d="M 106 32 q 4 60 1 118" stroke={c.accent} strokeOpacity="0.6" fill="none" />
          <path d="M 194 32 q -4 60 -1 118" stroke={c.accent} strokeOpacity="0.6" fill="none" />
        </>
      )}

      {category === 'ZEBRA_BLIND' && (
        <>
          <rect x="92" y="32" width="116" height="10" rx="3" fill={c.accent} />
          {[42, 52, 62, 72, 82, 92, 102].map((y, i) => (
            <rect key={y} x="96" y={y} width="108" height="10" fill={i % 2 === 0 ? c.main : '#FFFFFF'} opacity={i % 2 === 0 ? 1 : 0.85} />
          ))}
          <rect x="94" y="112" width="112" height="4" rx="2" fill={c.accent} />
        </>
      )}

      {(category === 'VENETIAN_BLIND' || category === 'WOOD_BLIND') && (
        <>
          <rect x="92" y="32" width="116" height="8" rx="2" fill={c.accent} />
          {[42, 50, 58, 66, 74, 82, 90, 98, 106].map((y) => (
            <rect key={y} x="96" y={y} width="108" height="5.5" rx="2.5" fill={c.main} stroke={c.accent} strokeOpacity="0.4" />
          ))}
          <line x1="110" y1="40" x2="110" y2="112" stroke={c.accent} strokeOpacity="0.5" />
          <line x1="190" y1="40" x2="190" y2="112" stroke={c.accent} strokeOpacity="0.5" />
        </>
      )}

      {category === 'SHEER' && (
        <>
          <rect x="80" y="26" width="140" height="5" rx="2.5" fill="#B9AE9A" />
          <path d="M 90 31 q 8 62 -4 121 h 36 q -12 -58 -4 -121 z" fill={c.main} opacity="0.75" />
          <path d="M 210 31 q -8 62 4 121 h -36 q 12 -58 4 -121 z" fill={c.main} opacity="0.75" />
          <path d="M 112 31 q 5 62 2 121" stroke={c.accent} strokeOpacity="0.5" fill="none" />
          <path d="M 188 31 q -5 62 -2 121" stroke={c.accent} strokeOpacity="0.5" fill="none" />
        </>
      )}

      {category === 'BLACKOUT' && (
        <>
          <rect x="94" y="33" width="112" height="8" rx="2" fill="#5A5D64" />
          <rect x="95" y="39" width="110" height="82" fill={c.main} />
          <rect x="95" y="39" width="110" height="82" fill="url(#boGrad)" opacity="0.25" />
          <defs>
            <linearGradient id="boGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
              <stop offset="1" stopColor="#000" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </>
      )}

      {/* dekor: saksı + koltuk silueti */}
      <circle cx="48" cy="150" r="16" fill="#A5BE8F" opacity="0.75" />
      <rect x="41" y="158" width="14" height="14" rx="3" fill="#B08968" />
      <rect x="232" y="128" width="52" height="38" rx="8" fill="#D9D2C2" />
      <rect x="236" y="118" width="44" height="18" rx="6" fill="#CEC6B4" />
    </svg>
  )
}
