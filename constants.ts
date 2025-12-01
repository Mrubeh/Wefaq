
import { Gender, SubscriptionPlan, User, Ticket, Pulse } from './types';

// Helper to set a date in the future
const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'سارة محمد',
    age: 26,
    gender: Gender.FEMALE,
    city: 'الرياض',
    bio: 'أبحث عن شريك طموح ويقدر الحياة الزوجية. أحب القراءة والسفر.',
    photoUrl: 'https://picsum.photos/400/400?random=1',
    job: 'مهندسة برمجيات',
    isOnline: true,
    subscription: SubscriptionPlan.FREE,
    joinedDate: '2023-10-15',
    religion: 'مسلمة',
    sect: 'سني',
    maritalStatus: 'عزباء',
    blockedUserIds: [],
    role: 'USER',
    zodiacSign: 'الميزان',
    mood: 'متفائل'
  },
  {
    id: 'u2',
    name: 'أحمد علي',
    age: 30,
    gender: Gender.MALE,
    city: 'جدة',
    bio: 'رجل أعمال، أبحث عن الاستقرار وتكوين أسرة سعيدة.',
    photoUrl: 'https://picsum.photos/400/400?random=2',
    job: 'رائد أعمال',
    isOnline: false,
    subscription: SubscriptionPlan.MONTHLY,
    joinedDate: '2023-11-01',
    religion: 'مسلم',
    sect: 'سني',
    maritalStatus: 'أعزب',
    blockedUserIds: [],
    subscriptionEndDate: daysFromNow(20),
    role: 'USER',
    zodiacSign: 'الأسد',
    mood: 'جاد'
  },
  {
    id: 'u3',
    name: 'ليلى خالد',
    age: 24,
    gender: Gender.FEMALE,
    city: 'دبي',
    bio: 'طبيبة، هادئة الطباع، أحب الطبيعة والهدوء.',
    photoUrl: 'https://picsum.photos/400/400?random=3',
    job: 'طبيبة أطفال',
    isOnline: true,
    subscription: SubscriptionPlan.WEEKLY,
    joinedDate: '2024-01-20',
    religion: 'مسلمة',
    sect: 'شيعي',
    maritalStatus: 'عزباء',
    blockedUserIds: [],
    subscriptionEndDate: daysFromNow(5),
    role: 'USER',
    zodiacSign: 'العذراء',
    mood: 'هادئ'
  },
  {
    id: 'u4',
    name: 'خالد عمر',
    age: 33,
    gender: Gender.MALE,
    city: 'القاهرة',
    bio: 'مهندس مدني، جاد في موضوع الزواج، أقدر الصراحة.',
    photoUrl: 'https://picsum.photos/400/400?random=4',
    job: 'مهندس مدني',
    isOnline: true,
    subscription: SubscriptionPlan.FREE,
    joinedDate: '2023-12-05',
    religion: 'مسلم',
    sect: 'سني',
    maritalStatus: 'مطلق',
    blockedUserIds: [],
    role: 'USER',
    zodiacSign: 'الجدي',
    mood: 'عملي'
  },
  {
    id: 'u5',
    name: 'نورة عبدالله',
    age: 28,
    gender: Gender.FEMALE,
    city: 'عمان',
    bio: 'معلمة، أحب الأطفال والطبخ والقراءة.',
    photoUrl: 'https://picsum.photos/400/400?random=5',
    job: 'معلمة لغة عربية',
    isOnline: false,
    subscription: SubscriptionPlan.FREE,
    joinedDate: '2024-02-10',
    religion: 'مسلمة',
    sect: 'سني',
    maritalStatus: 'أرملة',
    blockedUserIds: [],
    role: 'USER',
    zodiacSign: 'الحوت',
    mood: 'رومانسي'
  },
   {
    id: 'u6',
    name: 'فهد السالم',
    age: 35,
    gender: Gender.MALE,
    city: 'الكويت',
    bio: 'مستشار مالي، رياضي، أبحث عن شريكة حياة متفهمة.',
    photoUrl: 'https://picsum.photos/400/400?random=6',
    job: 'مستشار مالي',
    isOnline: true,
    subscription: SubscriptionPlan.MONTHLY,
    joinedDate: '2024-03-01',
    religion: 'مسلم',
    sect: 'سني',
    maritalStatus: 'أعزب',
    blockedUserIds: [],
    subscriptionEndDate: daysFromNow(25),
    role: 'USER',
    zodiacSign: 'القوس',
    mood: 'نشيط'
  },
  {
    id: 'admin1',
    name: 'مدير النظام',
    age: 40,
    gender: Gender.MALE,
    city: 'الإدارة',
    bio: 'حساب إدارة النظام',
    photoUrl: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff',
    job: 'مدير',
    isOnline: true,
    subscription: SubscriptionPlan.MONTHLY, // Admins have access
    joinedDate: '2020-01-01',
    religion: '-',
    sect: '-',
    maritalStatus: '-',
    blockedUserIds: [],
    role: 'ADMIN',
    zodiacSign: '-',
    mood: '-'
  }
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    userId: 'u1',
    userName: 'سارة محمد',
    subject: 'مشكلة في رفع الصور',
    message: 'لا أستطيع رفع صورة البروفايل، يظهر لي خطأ في الخادم.',
    status: 'OPEN',
    date: new Date().toISOString(),
    type: 'SUPPORT'
  },
  {
    id: 't2',
    userId: 'u4',
    userName: 'خالد عمر',
    subject: 'بلاغ عن مستخدم',
    message: 'المستخدم u5 يقوم بإرسال رسائل مزعجة.',
    status: 'PENDING',
    date: daysFromNow(-1),
    type: 'COMPLAINT'
  }
];

export const MOCK_PULSES: Pulse[] = [
  {
    id: 'p1',
    userId: 'u1',
    userName: 'سارة محمد',
    userPhoto: 'https://picsum.photos/400/400?random=1',
    text: 'التفاؤل هو المفتاح الحقيقي للسعادة، صباح الخير جميعاً 🌸',
    timestamp: Date.now() - 3600000
  },
  {
    id: 'p2',
    userId: 'u2',
    userName: 'أحمد علي',
    userPhoto: 'https://picsum.photos/400/400?random=2',
    text: 'أبحث عن شريكة تقدر الحياة العملية والعائلية.. الله يكتب اللي فيه الخير.',
    timestamp: Date.now() - 7200000
  },
  {
    id: 'p3',
    userId: 'u6',
    userName: 'فهد السالم',
    userPhoto: 'https://picsum.photos/400/400?random=6',
    text: 'من أجمل الصفات الصدق والوضوح في التعامل.',
    timestamp: Date.now() - 10000000
  }
];

export const PRICING_PLANS = [
  {
    id: 'weekly',
    name: 'اشتراك أسبوعي',
    price: '١٩',
    currency: 'ريال',
    features: ['محادثات غير محدودة', 'مشاهدة من زار بروفايلك', 'أولوية في الظهور'],
    type: SubscriptionPlan.WEEKLY
  },
  {
    id: 'monthly',
    name: 'اشتراك شهري',
    price: '٥٩',
    currency: 'ريال',
    features: ['كل مميزات الأسبوعي', 'شارة العضو المميز', 'دعم فني خاص', 'خصم ٣٠٪'],
    type: SubscriptionPlan.MONTHLY,
    recommended: true
  }
];