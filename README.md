# AVA — آوا

اپلیکیشن متن‌به‌گفتار فارسی (PWA)

## ویژگی‌ها
- تبدیل متن فارسی به گفتار با کیفیت بالا
- پشتیبانی از اعداد، ساعت و کسرهٔ اضافه
- رابط کاربری RTL با فونت وزیرمتن
- قابل نصب به عنوان Progressive Web App
- آماده تبدیل به APK اندروید

## اجرای محلی

```bash
npm install
npm run dev
```

آدرس: http://localhost:8080

## تبدیل به APK (Android)

این پروژه به صورت PWA آماده شده. برای ساخت فایل APK از یکی از روش‌های زیر استفاده کنید:

### روش ۱ — PWABuilder (ساده‌ترین)
1. پروژه را روی یک دامنه HTTPS دیپلوی کنید (مثلاً Vercel).
2. به سایت [PWABuilder](https://www.pwabuilder.com) بروید.
3. آدرس سایت را وارد کنید.
4. گزینه **Android** را انتخاب و Package ID را مثلاً `com.ava.tts` بگذارید.
5. فایل `.aab` یا `.apk` را دانلود کنید.

### روش ۲ — Bubblewrap (Google TWA)
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR-DOMAIN/manifest.webmanifest
bubblewrap build
```

### نکات مهم قبل از ساخت APK
- آیکون‌های PNG را در پوشه `public/icons/` قرار دهید:
  - `icon-192.png`
  - `icon-512.png`
  - نسخه‌های maskable هم توصیه می‌شود
- بعد از ساخت APK، fingerprint گواهی را در فایل `public/.well-known/assetlinks.json` قرار دهید تا Digital Asset Links درست کار کند.

## Stack
- TanStack Start + React 19
- Vite + Tailwind CSS 4
- Edge TTS
- PWA (manifest + Service Worker)
