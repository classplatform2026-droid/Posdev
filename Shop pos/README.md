# Shop POS - Multi-Tier Deployment Architecture (Render.com)

এই প্রজেক্টটি Render.com ক্লাউডে সহজে ডিপ্লয় করার জন্য প্রস্তুত করা হয়েছে:

```
Shop pos/
├── owner/      👉 Owner & Cashier POS Frontend (React Vite PWA)
├── backend/    👉 Node.js, Express, Socket.IO & MongoDB Web Service
├── admin/      👉 Admin Console Frontend Source
├── package.json 👉 Monorepo All-in-One Build Configuration
└── render.yaml 👉 Render.com 1-Click Blueprint Configuration
```

---

## 🛠️ "Failed to fetch" সমস্যার সমাধান (Fix for "Failed to fetch")

Render-এ আপলোড করার পর লগইনে **"Failed to fetch"** আসার ৩টি প্রধান কারণ থাকে:

1. **ব্যাকএন্ড URL সংযুক্ত ছিল না (Missing `VITE_API_URL`)**:
   - ওনার ফ্রন্টএন্ড স্ট্যাটিক সাইট হিসেবে চললে ব্যাকএন্ডের ডোমেইন লিংক প্রয়োজন হয়।
   - **সহজ সমাধান**: এখন লগইন স্ক্রিনে নিচে **"Backend Server Connection Settings"** দেওয়া হয়েছে। সেখানে আপনার ব্যাকএন্ড লিংকটি (যেমন: `https://shop-pos-backend.onrender.com`) পেস্ট করে **"Save & Connect"** চাপলেই মুহূর্তেই কাজ শুরু করবে—নতুন করে ডিপ্লয় করারও দরকার নেই!
2. **Render Free Tier সার্ভার স্লিপ মোড (Cold Start)**:
   - Render-এর ফ্রি সার্ভার ১৫ মিনিট নিষ্ক্রিয় থাকলে স্লিপে চলে যায়। প্রথম রিকোয়েস্টে ঘুম ভাঙতে ৩০-৫০ সেকেন্ড সময় নেয়। পিং টেস্ট বাটনে চাপ দিলে সার্ভার জেগে উঠবে।
3. **CORS ও প্রি-ফ্লাইট এরর**:
   - ব্যাকএন্ড সার্ভারে সর্বজনীন CORS ও OPTIONS হ্যান্ডলার যোগ করা হয়েছে, ফলে ব্রাউজার বা মোবাইলে কোনো ক্রস-অরিজিন রিকোয়েস্ট ব্লক হবে না।

---

## 🚀 Render.com এ ডিপ্লয় করার সহজ পদ্ধতিসমূহ

### পদ্ধতি ১: অল-ইন-ওয়ান সিঙ্গেল সার্ভিস (সবচেয়ে সহজ ও নির্ভরযোগ্য - কোনো CORS নেই)

২টি আলাদা সার্ভিস না বানিয়ে **একটি মাত্র Web Service**-এ সম্পূর্ণ POS এবং Backend চালানো যায়:

1. Render-এ যান > **New +** > **Web Service** চাপুন।
2. গিটহাব রিপোজিটরি সিলেক্ট করুন।
3. সেটিংস দিন:
   - **Name**: `shoppos`
   - **Root Directory**: `Shop pos` (অথবা খালি রাখুন যদি শুধু এই ফোল্ডার আপলোড করেন)
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `যেকোনো_সিক্রেট_কি`
   - `MONGODB_URI`: আপনার MongoDB Atlas লিংক (যেমন: `mongodb+srv://.../bdp?appName=Cluster0`)
5. **Create Web Service** চাপুন!
   - একটি ডোমেইনেই ওনার পিওএস (`/`), অ্যাডমিন প্যানেল (`/admin`), এবং সব API (`/api/*`) চলবে। কোনো কনফিগারেশন বা URL সেটিং লাগবে না!

---

### পদ্ধতি ২: আলাদা ফ্রন্টএন্ড ও ব্যাকএন্ড (২টি সার্ভিস)

#### ধাপ ১: ব্যাকএন্ড Web Service তৈরি করুন (`Shop pos/backend`)
1. Render-এ **New +** > **Web Service** ক্লিক করুন।
2. সেটিংস:
   - **Root Directory**: `Shop pos/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npx tsx server.ts`
3. Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `যেকোনো_সিক্রেট_কি`
   - `MONGODB_URI`: `mongodb+srv://...`
4. ডিপ্লয় হওয়ার পর ব্যাকএন্ড URL কপি করুন (যেমন: `https://shop-pos-backend.onrender.com`)।

#### ধাপ ২: ওনার ফ্রন্টএন্ড Static Site তৈরি করুন (`Shop pos/owner`)
1. Render-এ **New +** > **Static Site** ক্লিক করুন।
2. সেটিংস:
   - **Root Directory**: `Shop pos/owner`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://shop-pos-backend.onrender.com` *(ধাপ ১-এর ব্যাকএন্ড URL)*
4. ডিপ্লয় শেষে সাইটে ঢুকুন। যদি কোনো কারণে `VITE_API_URL` সেট করতে ভুলে যান, সরাসরি লগইন স্ক্রিনের **"Backend Server Connection Settings"**-এ ব্যাকএন্ড URL পেস্ট করে দিলেই চলবে!

---

## 🔑 ডিফল্ট লগইন ক্রেডেনশিয়াল (Default Credentials)
- **মোবাইল নম্বর**: `01915647290`
- **পাসওয়ার্ড**: `12345678`
- **POS পিন**: `1234`
