# ⚖️ المنصة التعليمية القانونية

منصة تعليمية متكاملة لطلاب كلية الحقوق، مبنية بـ Next.js 15 + Firebase.

---

## 🚀 المميزات

- ✅ تسجيل وتسجيل دخول كامل بالعربية
- ✅ ربط الحساب بجهاز واحد فقط (Device Fingerprinting)
- ✅ لوحة تحكم الطالب بالكامل
- ✅ لوحة تحكم الأدمن الكاملة
- ✅ نظام مشاهدة المحاضرات عبر YouTube Unlisted
- ✅ علامة مائية متحركة بيانات الطالب
- ✅ حماية الفيديو (منع النقر اليمين، السحب، PiP)
- ✅ نظام الاشتراكات والمدفوعات
- ✅ كل شيء بالعربية RTL

---

## 📁 هيكل المشروع

```
src/
├── app/
│   ├── auth/
│   │   ├── login/         # صفحة تسجيل الدخول
│   │   └── register/      # صفحة إنشاء الحساب
│   ├── dashboard/         # لوحة الطالب
│   │   ├── page.tsx       # الفرق الدراسية والمحاضرات
│   │   ├── profile/       # الملف الشخصي
│   │   ├── subscription/  # الاشتراك والدفع
│   │   └── free-lectures/ # المحاضرات المجانية
│   └── admin/             # لوحة الأدمن
│       ├── page.tsx       # الإحصائيات
│       ├── requests/      # طلبات الاشتراك
│       ├── lectures/      # إدارة المحاضرات
│       └── students/      # إدارة الطلاب
├── components/
│   └── video/VideoPlayer  # مشغل الفيديو المحمي
├── lib/
│   ├── firebase.ts        # إعداد Firebase
│   ├── firestore.ts       # عمليات قاعدة البيانات
│   ├── authContext.tsx    # سياق المصادقة
│   ├── deviceFingerprint  # بصمة الجهاز
│   └── youtube.ts         # معالجة روابط يوتيوب
└── types/index.ts         # أنواع TypeScript
```

---

## ⚙️ التثبيت

```bash
# 1. تثبيت الحزم
npm install

# 2. إنشاء ملف البيئة
cp .env.local.example .env.local
# عدّل القيم بمعلومات Firebase

# 3. تشغيل محلي
npm run dev
```

---

## 🔥 إعداد Firebase

1. أنشئ مشروع على [Firebase Console](https://console.firebase.google.com)
2. فعّل Authentication (Email/Password)
3. أنشئ Firestore Database
4. انسخ بيانات الإعداد إلى `.env.local`
5. ارفع `firestore.rules` من Console → Firestore → Rules
6. أنشئ مجموعة `admins` وأضف UID الأدمن كـ document ID

---

## 🌐 النشر على Vercel

```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel --prod
```

أو اربط الـ repository مباشرة من [vercel.com](https://vercel.com) وأضف متغيرات البيئة.

---

## 🔒 الأمان

- كل حساب مرتبط بجهاز واحد فقط
- الطلاب يرون بياناتهم فقط
- المحاضرات المدفوعة للمشتركين فقط
- الأدمن له صلاحية كاملة
- Firestore Security Rules محكمة

---

## 📞 للتواصل

واتساب: **01017693700**
