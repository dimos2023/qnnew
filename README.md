# LEGACY MOTORS

موقع فاخر مستقل للعربيات (MAEXTRO S800 · YANGWANG U9 · YANGWANG U8L) — HTML/CSS/JS، بدون خطوة build.

## تشغيل محلي
محتاج Node.js متثبت. من داخل الفولدر ده:

```bash
node serve.mjs
```

بعدها افتح: **http://localhost:8900**

(السيرفر بيحاكي إعدادات `vercel.json` — الروابط النظيفة والـ rewrites — فالتجربة المحلية زي المرفوع بالظبط.)

## الصفحات
- `/` — الرئيسية (فيديو هيرو + الموديلات)
- `/models/maextro-s800` · `/models/yangwang-u9` · `/models/yangwang-u8l`
- `/concierge` · `/about` · `/join` · `/test-drive`

## نموذج التسجيل (كل الفورمات)
كل نماذج الموقع (`/join` · `/concierge` · `/test-drive` · ومودال عرض السعر في `/build`) بقت نفس نموذج التسجيل الواحد،
مبني من ملف واحد: `assets/js/registration.js` — الصفحة فيها `<form data-registration="…">` فاضي بس.

أربعة أقسام: بيانات التواصل · بيانات الشركة · سياراتك الحالية · تفضيلاتك.
الطلب بيتسجل بحالة `pending` لحد ما الإدارة توافق عليه من `/admin`، وكل الطلبات (القديمة والجديدة وطلبات عرض السعر) بتظهر في جدول واحد هناك.

مودال عرض السعر بيستدعي نفس الفورم عن طريق `window.QNRegistration.mount(form, 'quote', { extra, onSuccess })`،
وبيضيف التكوين اللي العميل عمله (الموديل والسعر والرقم المرجعي) لنفس السطر عشان الإدارة تقدر تعيد بناء الـ PDF من اللوحة.

قواعد التحقق: بريد إلكتروني صحيح · كل الحقول المطلوبة · سيارة واحدة على الأقل ·
ومنع تكرار نفس البريد لو عنده طلب معلّق أو مقبول.

### الباك إند (Google Apps Script)
الكود الكامل موجود في `apps-script/Code.gs`. للرفع:
1. افتح الـ Google Sheet ← **Extensions → Apps Script**.
2. الصق محتوى `apps-script/Code.gs` مكان الكود القديم.
3. غيّر `ADMIN_PASS` لرمز دخول لوحة الإدارة الحالي.
4. **Deploy → New deployment → Web app** — *Execute as: Me* · *Who has access: Anyone*.
5. لو اتغير رابط الـ `/exec`، حدّثه في `assets/js/registration.js` و `assets/js/config.js` و `admin.html`.

## اللغة
إنجليزي أساسي + عربي. اختيار الدولة من العلم فوق، أو ضيف `?country=eg` (أو `ae` / `sa` / `us`) لأي رابط.

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
