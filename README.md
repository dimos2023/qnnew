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
الطلب بيتسجل بحالة `pending` لحد ما الإدارة توافق عليه من `/admin`، وكل الطلبات (القديمة والجديدة) بتظهر في جدول واحد هناك، وطلبات عرض السعر في جدولها المستقل تحته بنفس الأعمدة وزرار إعادة بناء الـ PDF.

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

## التقرير اليومي (Google Analytics + Claude)
`apps-script/DailyReport.gs` بيشتغل مرة كل يوم الساعة 8 صباحاً: بيقرا أرقام GA4 لليوم اللي فات،
وبيعد طلبات الموقع من نفس الشيت، وبيبعتهم لـ Claude يكتب التحليل بالعربي، وبيرسل التقرير
على الإيميل (و تيليجرام لو متظبط).

### التجهيز (مرة واحدة)
1. في نفس مشروع Apps Script: **Services (+) → Google Analytics Data API** باسم `AnalyticsData`.
2. الصق `apps-script/DailyReport.gs` كملف جديد جنب `Code.gs` (محتاجه، بيستخدم `rows_()` منه).
3. **Project Settings → Script Properties** وضيف:
   - `GA4_PROPERTY_ID` — رقم الـ Property من GA4 (Admin → Property Settings)، مش `G-GQD8V39HTZ`.
   - `ANTHROPIC_API_KEY` — من console.anthropic.com
   - `REPORT_EMAIL` — الإيميل اللي يوصله التقرير
   - `TELEGRAM_BOT_TOKEN` و `TELEGRAM_CHAT_ID` — اختياري
4. شغّل `testReport()` مرة بالإيد ووافق على الصلاحيات، وبعدها `createDailyTrigger()`.

مفيش أي مفتاح مكتوب في الكود — كلهم في Script Properties، عشان الريبو عام.
واتساب جاهز في `sendWhatsApp_()`: تضيف `WHATSAPP_TOKEN` و `WHATSAPP_PHONE_ID` و `WHATSAPP_TO`
من WhatsApp Cloud API ويشتغل من غير أي تعديل تاني.

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
