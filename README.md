# LEGACY MOTORS

موقع فاخر مستقل للعربيات (MAEXTRO S800 · YANGWANG U9 · YANGWANG U8L) — HTML/CSS/JS، بدون خطوة build.

## تشغيل محلي
محتاج Node.js متثبّت. من داخل الفولدر ده:

```bash
node serve.mjs
```

بعدها افتح: **http://localhost:8900**

(السيرفر بيحاكي إعدادات `vercel.json` — الروابط النظيفة والـ rewrites — فالتجربة المحلية زي المرفوع بالظبط.)

## الصفحات
- `/` — الرئيسية (فيديو هيرو + الموديلات)
- `/models/maextro-s800` · `/models/yangwang-u9` · `/models/yangwang-u8l`
- `/concierge` · `/about` · `/join` · `/test-drive`

## اللغة
إنجليزي أساسي + عربي. زرار **ع** فوق، أو ضيف `?lang=ar` لأي رابط.

## الرفع (Vercel)
الفولدر جاهز للرفع كما هو (`vercel.json` موجود):
- ارفع الفولدر ده كمشروع Vercel جديد (Root Directory = هذا الفولدر).
- من غير build command — موقع ثابت.

## البنية
```
index.html            الرئيسية
models/               صفحات الموديلات
assets/css            التصاميم
assets/js             i18n (اللغة) + التفاعلات
assets/video          فيديوهات الهيرو
assets/models         صور الموديلات
vercel.json           الروابط النظيفة + الهيدرز + الكاش
serve.mjs             سيرفر التطوير المحلي
```
