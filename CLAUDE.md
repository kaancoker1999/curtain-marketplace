# CurtainOS — Proje Notları

AI destekli B2B perde sektörü platformu ("Alibaba + SAP + Uber + Shopify + AI").
Perakendeci, üretici, dikim atölyesi, kumaş tedarikçisi ve montaj ekiplerini bağlar.
Sahibi: Kaan (Türkçe konuşur — yanıtlar Türkçe olsun).

## Çalıştırma

- Node `~/.local/node/bin` altında (Homebrew/Docker YOK). Komutlardan önce:
  `export PATH="$HOME/.local/node/bin:$PATH"`
- `npm run dev` → http://localhost:3000
- **Demo mod:** PostgreSQL yoksa tüm veri `src/lib/demo-data.ts`'ten gelir (otomatik fallback).
  DB kurulumu: `npm run db:up && npm run db:migrate && npm run db:seed` (Docker gerekir, makinede yok).
- Build almadan önce dev sunucusunu DURDUR (`next build` dev'in `.next` klasörünü bozuyor).
  Genelde `npx tsc --noEmit` yeterli.

## Kurallar / Konvansiyonlar

- Arayüz TAMAMEN Türkçe; enum etiketleri `src/lib/labels.ts`'te (tek kaynak).
- Para birimi TRY; gösterim `formatTRY()` (`src/lib/format.ts`). Satış adetleri kademeli
  gösterilir: `formatSalesTier()` → 100+/500+/1000+/2500+/5000+/10000+/25000+/50000+ (asla tam sayı).
- Prisma 7: datasource URL `prisma.config.ts`'te; client `src/generated/prisma`'ya üretilir
  (gitignore'da). Şema değişince `npx prisma generate`.
- shadcn/ui **Base UI tabanlı**: `asChild` YOK → `render={<Link .../>}` kullan; ama SSR'da
  hydration sorunu çıkarsa `buttonVariants()` sınıflarıyla düz `<Link>` tercih et.
  Select `onValueChange` değeri `string | null`.
- AI katmanı `src/lib/ai` (Anthropic/OpenAI, env: `AI_PROVIDER`, anahtar yok → devre dışı,
  her şey deterministik fallback ile çalışır).
- Commit'ler İngilizce, sonunda `Co-Authored-By: Claude ...` satırı.

## Önemli Dosyalar

- `src/lib/demo-data.ts` — tüm demo verisi (üreticiler, ürünler, kumaşlar, siparişler).
  Seed (`prisma/seed.ts`) da buradan beslenir.
- `src/lib/matching/index.ts` — eşleştirme motoru (fiyat/termin/kapasite/fire/lojistik/puan).
- `src/app/api/chat/route.ts` — ana sayfa asistanı: Türkçe niyet çözümleme + slot doldurma
  (eşleştirme) + platform soruları. AI anahtarı varsa `src/lib/platform-qa.ts`'teki
  buildPlatformContext ile beslenen LLM her soruyu yanıtlar; anahtar yoksa aynı dosyadaki
  answerPlatformQuestion deterministik yanıt verir (puan/fiyat/üretici/sayı soruları).
- `src/components/product/cellular-shade-configurator.tsx` ve
  `roman-shade-configurator.tsx` — instablinds.com'dan birebir uyarlanmış kural motorlu
  konfigüratörler (ışık kontrolü → hücre tipi kısıtı / kumaş koleksiyonu / ayrı fiyat tablosu).
- `src/lib/pricing/cellular-grids.ts` — hücreli perdenin GERÇEK fiyat gridleri (Kaan'ın
  Eylül 2025 Excel listesi, USD; kaynak dosya adı içinde). 9 grid (ışık kontrolü × hücre ×
  renk grubu), inç kırılımlı, bir üst kırılıma yuvarlanır. Kur `USD_TRY = 46.8` tek yerden
  değişir. Mekanizma ek ücretleri lift+TDBU kombinasyon tutarı; 42" üzeri kargo farkı var.
  (Excel'deki Arch/Pleated sayfaları platformda ürün olmadığı için aktarılmadı.)
- `src/components/category-tile.tsx` — kategori görselleri: `public/categories/<ad>.jpg`
  varsa fotoğraf, yoksa SVG çizim (dosya adları dosyada listeli).
- `public/catalogs/` — üretici PDF katalogları (Carra Woods → LUMIA Cellular 2025).

## Alan Bilgisi

- "Carra Woods" = Kaan'ın üreticisi (LUMIA markası); listede 1. sırada, 4.9 puan,
  1050 yorum, satış 1250 (→ "1000+"), 2 ürün: hücreli perde + Roman perde.
- Roman perde koleksiyon eşlemesi (kullanıcı verdi, DEĞİŞTİRME):
  tül=Soho/Lucetta/Piero/Umberto · yarı geçirgen=Marlow/Lazuli/Carillo/Arrow/Periscope/Atmosphere ·
  ışık süzen=Outlander/Nomad · loşlaştıran=Hesperia · karartma=Obscura.
- Hücreli perde kısıtları: tül→sadece tek hücre · karartma→tek+çift · ışık süzen→üçü de.

## Sayfa Sayfa İnceleme Durumu (Kaan ile birlikte ilerliyor)

1. ✅ Ana sayfa (ChatGPT tarzı asistan) — ONAYLANDI
2. 🔄 Üreticiler — kategori kartları (fotoğraflı) + En İyi Performans (ürün/hizmet ayrı
   etiketli) + tek sütun liste yapıldı; Kaan kategori fotoğraflarını kendisi değiştirecek.
   Son onay bekleniyor.
3. ⏭️ Üretici detay (sıradaki) — yapı: Hakkında → Ürünler → Katalog (PDF) → Platform
   entegrasyonu (partner sayısı + kademeli satış)
4. Çalıştığım Üreticiler
5. Pazar Yeri
6. Siparişler
7. Ürün konfigüratörleri
8. Panel (Genel Bakış + AI Eşleştirme)

## Bilinen Eksikler / Sonraki İşler

- Roman Shades PDF katalogu diskte bulunamadı (Kaan konumunu verecek);
  Drapery 2026 katalogu mevcut: `~/Desktop/Desktop - Kaan's MacBook Pro (2)/CARRA/LUMIA/VISUAL BOOKS FOR LUMIA/`
- Konfigüratör "Sipariş talebi oluştur" henüz gerçek sipariş kaydı oluşturmuyor.
- Clerk/Stripe/Supabase/Maps bağlanmadı (env placeholder'lar hazır, README'de adımlar var).
