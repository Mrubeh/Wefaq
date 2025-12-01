
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  ViewState, 
  Gender, 
  SubscriptionPlan, 
  Message,
  Notification,
  Ticket,
  Pulse
} from './types';
import { MOCK_USERS, PRICING_PLANS, MOCK_TICKETS, MOCK_PULSES } from './constants';
import { generateBioSuggestion, checkCompatibility } from './services/geminiService';
import { 
  Heart, 
  MessageCircle, 
  User as UserIcon, 
  LogOut, 
  Search, 
  Lock, 
  CheckCircle, 
  Star,
  Sparkles,
  Menu,
  X,
  Scroll,
  Shield,
  Ban,
  Bell,
  AlertTriangle,
  Filter,
  LifeBuoy,
  CreditCard,
  Banknote,
  LayoutDashboard,
  Eye,
  Activity,
  PlusCircle,
  Send,
  Sun,
  Smile
} from 'lucide-react';

// --- Components ---

// Pulse Modal
const PulseModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (text: string) => void }) => {
    const [text, setText] = useState('');
    
    if (!isOpen) return null;

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const isOverLimit = wordCount > 300;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                <div className="bg-primary-600 px-4 py-3 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        أضف خاطرة جديدة
                    </h3>
                    <button onClick={onClose} className="hover:bg-primary-700 rounded-full p-1 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">شارك مجتمع وفاق بخواطرك ومشاعرك. (الحد الأقصى 300 كلمة)</p>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={6}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        placeholder="اكتب خاطرتك هنا..."
                    />
                    <div className="flex justify-between items-center mt-2">
                         <span className={`text-xs ${isOverLimit ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                             {wordCount} / 300 كلمة
                         </span>
                    </div>
                    <button 
                        disabled={!text.trim() || isOverLimit}
                        onClick={() => { onSubmit(text); onClose(); setText(''); }}
                        className="w-full mt-4 bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        نشر في النبض
                    </button>
                </div>
            </div>
        </div>
    );
};

// Pulse Bar (Ticker)
const PulseBar = ({ pulses, onAddClick }: { pulses: Pulse[], onAddClick: () => void }) => {
    return (
        <div className="bg-white border-b border-gray-200 h-12 flex items-center relative overflow-hidden shadow-sm z-40">
            {/* Label / Add Button */}
            <div className="absolute right-0 top-0 bottom-0 bg-white z-20 flex items-center px-4 shadow-[0_0_10px_rgba(0,0,0,0.1)] border-l border-gray-100">
                <div className="flex items-center gap-2 text-primary-700 font-bold">
                    <Activity className="w-5 h-5 animate-pulse" />
                    <span className="hidden sm:inline">النبض</span>
                </div>
                <button 
                    onClick={onAddClick}
                    className="mr-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-full p-1.5 transition flex items-center gap-1 text-xs px-3 font-medium border border-primary-200"
                >
                    <PlusCircle className="w-3 h-3" />
                    أضف خاطرة
                </button>
            </div>

            {/* Ticker Content */}
            <div className="flex-1 overflow-hidden h-full flex items-center mr-32 sm:mr-44">
                <div className="whitespace-nowrap flex items-center gap-12 animate-scroll-rtl hover:pause-animation">
                    {pulses.concat(pulses).map((pulse, idx) => ( // Duplicate for seamless loop
                        <div key={`${pulse.id}-${idx}`} className="inline-flex items-center gap-3 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 flex-shrink-0">
                            <img src={pulse.userPhoto} alt={pulse.userName} className="w-6 h-6 rounded-full object-cover border border-white shadow-sm" />
                            <span className="text-xs font-bold text-gray-800">{pulse.userName}:</span>
                            <span className="text-sm text-gray-600">{pulse.text.length > 80 ? pulse.text.substring(0, 80) + '...' : pulse.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Inline Styles for Animation (Left to Right) */}
            <style>{`
                @keyframes scrollLeftToRight {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-scroll-rtl {
                    animation: scrollLeftToRight 40s linear infinite;
                    /* Ensure content is laid out from left to right for the transform to work visually as entering from left */
                    flex-direction: row-reverse; 
                }
                .hover\\:pause-animation:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

// 1. Navbar
const Navbar = ({ 
  user, 
  onNavigate, 
  onLogout,
  notifications,
  onClearNotifications
}: { 
  user: User | null, 
  onNavigate: (view: ViewState) => void,
  onLogout: () => void,
  notifications: Notification[],
  onClearNotifications: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('HOME')}>
            <Heart className="h-8 w-8 text-primary-600 fill-current" />
            <span className="mr-2 text-2xl font-bold text-primary-900 tracking-tighter">وفاق</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <button onClick={() => onNavigate('BROWSE')} className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition">تصفح الأعضاء</button>
            
            {user?.role === 'ADMIN' && (
               <button onClick={() => onNavigate('ADMIN')} className="text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-md text-sm font-bold transition flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" />
                  لوحة التحكم
               </button>
            )}

            {user ? (
              <>
                <button onClick={() => onNavigate('MESSAGES')} className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  الرسائل
                </button>
                
                <button onClick={() => onNavigate('SUPPORT')} className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1">
                  <LifeBuoy className="w-4 h-4" />
                  الدعم الفني
                </button>

                {/* Notification Bell */}
                <div className="relative">
                  <button onClick={() => { setShowNotifications(!showNotifications); if(!showNotifications) onClearNotifications(); }} className="text-gray-600 hover:text-primary-600 p-2 rounded-full transition relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white"></span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute left-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 border border-gray-100 ring-1 ring-black ring-opacity-5 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-sm text-gray-700">التنبيهات</span>
                        <span className="text-xs text-gray-500">{notifications.length} جديد</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-400 text-sm">لا توجد تنبيهات جديدة</div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer">
                              <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1 text-left">{new Date(notif.timestamp).toLocaleTimeString('ar-SA')}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mr-4 border-r pr-4 border-gray-200">
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <p className={`text-xs ${user.subscription !== SubscriptionPlan.FREE ? 'text-amber-600 font-bold' : 'text-gray-500'}`}>
                      {user.subscription}
                    </p>
                  </div>
                   <img src={user.photoUrl} alt="Me" className="h-8 w-8 rounded-full object-cover border border-gray-200" />
                   <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition">
                    <LogOut className="w-5 h-5" />
                   </button>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => onNavigate('LOGIN')} className="text-gray-600 hover:text-primary-600 px-3 py-2 font-medium transition">دخول</button>
                <button onClick={() => onNavigate('REGISTER')} className="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition shadow-lg shadow-primary-200">تسجيل جديد</button>
              </>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button onClick={() => { onNavigate('BROWSE'); setIsOpen(false); }} className="block w-full text-right px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">تصفح الأعضاء</button>
            {user ? (
               <>
                {user.role === 'ADMIN' && <button onClick={() => { onNavigate('ADMIN'); setIsOpen(false); }} className="block w-full text-right px-3 py-2 text-base font-medium text-primary-700 hover:bg-primary-50 rounded-md">لوحة التحكم</button>}
                <button onClick={() => { onNavigate('MESSAGES'); setIsOpen(false); }} className="block w-full text-right px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">الرسائل</button>
                <button onClick={() => { onNavigate('SUPPORT'); setIsOpen(false); }} className="block w-full text-right px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">الدعم الفني</button>
                <button onClick={() => { onNavigate('SUBSCRIPTION'); setIsOpen(false); }} className="block w-full text-right px-3 py-2 text-base font-medium text-amber-600 hover:bg-amber-50 rounded-md">ترقية العضوية</button>
                <button onClick={onLogout} className="block w-full text-right px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md">تسجيل خروج</button>
               </>
            ) : (
              <>
                <button onClick={() => { onNavigate('LOGIN'); setIsOpen(false); }} className="block w-full text-right px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">دخول</button>
                <button onClick={() => { onNavigate('REGISTER'); setIsOpen(false); }} className="block w-full text-right px-3 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 rounded-md">تسجيل جديد</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// 2. Hero Section
const Hero = ({ onCta }: { onCta: () => void }) => (
  <div className="relative bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
        <svg className="hidden lg:block absolute left-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polygon points="50,0 100,0 50,100 0,100" />
        </svg>

        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
          <div className="sm:text-center lg:text-right">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">ابحث عن</span>{' '}
              <span className="block text-primary-600 xl:inline">شريك حياتك</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              منصة "وفاق" توفر لك بيئة آمنة وجادة للبحث عن النصف الآخر. خوارزميات ذكية وخصوصية تامة لضمان أفضل تجربة للتعارف والزواج.
            </p>
            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <button onClick={onCta} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10">
                  ابدأ البحث الآن
                </button>
              </div>
              <div className="mt-3 sm:mt-0 sm:mr-3">
                <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10">
                  قصص نجاح
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    <div className="lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2 bg-slate-100">
      <img
        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full opacity-90"
        src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
        alt="Wedding couple"
      />
      <div className="absolute inset-0 bg-primary-900 mix-blend-multiply opacity-20"></div>
    </div>
  </div>
);

// 3. User Card
const UserCard: React.FC<{ user: User; onClick: () => void }> = ({ user, onClick }) => (
  <div onClick={onClick} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 flex flex-col h-full transform hover:-translate-y-1">
    <div className="relative h-64 overflow-hidden">
      <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <h3 className="text-white text-xl font-bold">{user.name}, {user.age}</h3>
        <p className="text-white/90 text-sm flex items-center gap-1">
           <span className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
           {user.city}
        </p>
      </div>
      {user.subscription !== SubscriptionPlan.FREE && (
         <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
           <Star size={12} fill="currentColor" /> مميز
         </div>
      )}
    </div>
    <div className="p-4 flex-grow flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-medium">{user.maritalStatus}</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{user.bio}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">{user.job}</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">{user.religion} - {user.sect}</span>
          {user.zodiacSign && (
             <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                 <Sun size={10} />
                 {user.zodiacSign}
             </span>
          )}
          {user.mood && (
             <span className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                 <Smile size={10} />
                 {user.mood}
             </span>
          )}
        </div>
      </div>
      <button className="w-full mt-2 bg-primary-50 text-primary-700 py-2 rounded-lg font-medium hover:bg-primary-100 transition text-sm">
        عرض الملف الشخصي
      </button>
    </div>
  </div>
);

// Payment Modal Component
const PaymentModal = ({ plan, onClose, onConfirm }: { plan: SubscriptionPlan, onClose: () => void, onConfirm: () => void }) => {
    const [method, setMethod] = useState<'CARD' | 'BANK'>('CARD');
    const [loading, setLoading] = useState(false);

    const handlePayment = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onConfirm();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center gap-2">
                             <CreditCard className="w-5 h-5 text-primary-600" />
                             إتمام عملية الدفع: اشتراك {plan}
                        </h3>
                        
                        {/* Payment Method Tabs */}
                        <div className="flex gap-2 mb-6 border-b border-gray-200">
                            <button onClick={() => setMethod('CARD')} className={`pb-2 px-4 text-sm font-medium border-b-2 transition ${method === 'CARD' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                <div className="flex items-center gap-2"><CreditCard size={16}/> بطاقة ائتمان</div>
                            </button>
                            <button onClick={() => setMethod('BANK')} className={`pb-2 px-4 text-sm font-medium border-b-2 transition ${method === 'BANK' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                <div className="flex items-center gap-2"><Banknote size={16}/> تحويل بنكي</div>
                            </button>
                        </div>

                        {method === 'CARD' ? (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">الاسم على البطاقة</label>
                                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" placeholder="الاسم كما يظهر على البطاقة" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">رقم البطاقة</label>
                                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" placeholder="0000 0000 0000 0000" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">تاريخ الانتهاء</label>
                                        <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" placeholder="MM/YY" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">CVV</label>
                                        <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" placeholder="123" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in bg-gray-50 p-4 rounded-md">
                                <p className="text-sm text-gray-600 mb-2">يرجى التحويل إلى الحساب التالي:</p>
                                <div className="text-sm">
                                    <div className="flex justify-between py-1 border-b border-gray-200"><span>اسم البنك:</span> <span className="font-bold">بنك الإنماء</span></div>
                                    <div className="flex justify-between py-1 border-b border-gray-200"><span>الآيبان:</span> <span className="font-bold font-mono">SA00 0000 0000 0000 0000 0000</span></div>
                                    <div className="flex justify-between py-1"><span>اسم المستفيد:</span> <span className="font-bold">شركة وفاق للخدمات</span></div>
                                </div>
                                <div className="pt-4">
                                     <label className="block text-sm font-medium text-gray-700">إرفاق صورة الإيصال</label>
                                     <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-white">
                                        <div className="space-y-1 text-center">
                                            <Banknote className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                                <span>رفع ملف</span>
                                            </label>
                                            </div>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        )}

                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button 
                            type="button" 
                            disabled={loading}
                            onClick={handlePayment}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            {loading ? 'جاري المعالجة...' : 'تأكيد الدفع'}
                        </button>
                        <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 4. Subscription Modal / Page (Modified to open PaymentModal)
const SubscriptionView = ({ onSubscribeRequest, onCancel }: { onSubscribeRequest: (plan: SubscriptionPlan) => void, onCancel: () => void }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          اختر الباقة المناسبة لك
        </h2>
        <p className="mt-4 text-xl text-gray-500">
          تواصل مع من تحب وافتح كافة المميزات للوصول إلى شريك حياتك بشكل أسرع.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {PRICING_PLANS.map((plan) => (
          <div key={plan.id} className={`relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${plan.recommended ? 'border-primary-500 transform md:-translate-y-4' : 'border-gray-100'}`}>
            {plan.recommended && (
              <div className="absolute top-0 inset-x-0 bg-primary-500 text-white text-center text-sm font-bold py-1">
                الأكثر طلباً
              </div>
            )}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 text-center">{plan.name}</h3>
              <div className="mt-4 flex justify-center items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="mr-1 text-xl text-gray-500">{plan.currency}</span>
              </div>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 ml-3" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onSubscribeRequest(plan.type)}
                className={`mt-8 w-full block bg-primary-600 border border-transparent rounded-md py-3 text-sm font-semibold text-white text-center hover:bg-primary-700 transition ${plan.recommended ? 'shadow-lg shadow-primary-300' : ''}`}
              >
                اختر الباقة
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={onCancel} className="mt-8 text-gray-500 hover:text-gray-700 underline">
        العودة وتصفح الموقع مجاناً
      </button>
    </div>
  );
};

// 5. Chat Interface (Protected & Live)
const ChatInterface = ({ 
  currentUser, 
  partner, 
  onBack,
  onShowSubscription,
  connectionStatus,
  onRequestChat,
  onBlock,
  isBlocked
}: { 
  currentUser: User, 
  partner: User, 
  onBack: () => void,
  onShowSubscription: () => void,
  connectionStatus: 'NONE' | 'PENDING' | 'ACCEPTED',
  onRequestChat: () => void,
  onBlock: () => void,
  isBlocked: boolean
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<{score: number, advice: string} | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const isSubscriber = currentUser.subscription !== SubscriptionPlan.FREE || currentUser.role === 'ADMIN';
  const isSameGender = currentUser.gender === partner.gender;

  useEffect(() => {
    // If accepted or if user is ADMIN (Admins can see everything for debugging/moderation)
    if ((connectionStatus === 'ACCEPTED' && !isBlocked) || currentUser.role === 'ADMIN') {
      setMessages([
        { id: '1', senderId: partner.id, receiverId: currentUser.id, text: 'مرحباً، يسعدني قبول طلبك.', timestamp: Date.now() - 3600000 },
        { id: '2', senderId: currentUser.id, receiverId: partner.id, text: 'شكراً لك! تشرفت بك.', timestamp: Date.now() - 3500000 }
      ]);
    } else {
        setMessages([]);
    }
    
    // Check compatibility if subscriber
    if (isSubscriber && !isBlocked && !isSameGender) {
        checkCompatibility(currentUser.bio, partner.bio).then((res) => {
            try {
                const json = JSON.parse(res);
                setAiAnalysis(json);
            } catch (e) {
                // Ignore parsing errors for now
            }
        });
    }

  }, [partner.id, currentUser.id, currentUser.bio, partner.bio, isSubscriber, connectionStatus, isBlocked, currentUser.role, isSameGender]);

  const handleSend = () => {
    if (isBlocked) return;
    if (isSameGender && currentUser.role !== 'ADMIN') return;

    if (!isSubscriber) {
      onShowSubscription();
      return;
    }
    // Admins can read but usually shouldn't send in personal chats unless acting as support, but here we allow it for impersonation
    if (connectionStatus !== 'ACCEPTED' && currentUser.role !== 'ADMIN') return;
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: partner.id,
      text: inputText,
      timestamp: Date.now()
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Scroll to bottom
    setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 100);
  };

  // Guard against same-gender communication
  if (isSameGender && currentUser.role !== 'ADMIN') {
      return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-gray-50 text-center p-4">
              <Ban className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900">غير مسموح</h2>
              <p className="text-gray-600 mt-2 max-w-md">عذراً، التواصل مسموح فقط بين الجنسين المختلفين وفقاً لسياسة الموقع.</p>
              <button onClick={onBack} className="mt-6 bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-50 shadow-sm transition">
                  عودة
              </button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center">
          <button onClick={onBack} className="ml-3 p-2 hover:bg-gray-100 rounded-full">
             <span className="text-xl">→</span>
          </button>
          <img src={partner.photoUrl} alt={partner.name} className="w-10 h-10 rounded-full object-cover ml-3" />
          <div>
            <h3 className="font-bold text-gray-900">{partner.name}</h3>
            <span className={`text-xs flex items-center gap-1 ${partner.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
              {partner.isOnline ? 'متصل الآن' : 'غير متصل'}
              {partner.isOnline && <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>}
            </span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
            {aiAnalysis && !isBlocked && (
                <div className="hidden sm:flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full text-purple-700 text-xs border border-purple-100">
                    <Sparkles size={14} />
                    <span>توافق: {aiAnalysis.score}%</span>
                </div>
            )}
            <button onClick={onBlock} className={`p-2 rounded-full ${isBlocked ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-500'}`} title={isBlocked ? "إلغاء الحظر" : "حظر المستخدم"}>
                <Ban size={20} />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-slate-50" ref={scrollRef}>
        
        {/* State: Blocked */}
        {isBlocked && (
           <div className="absolute inset-0 z-20 bg-gray-100/90 flex flex-col items-center justify-center p-6 text-center">
             <Ban className="w-16 h-16 text-red-500 mb-4" />
             <h3 className="text-2xl font-bold text-gray-800 mb-2">المستخدم محظور</h3>
             <p className="text-gray-600 mb-6 max-w-md">لقد قمت بحظر هذا المستخدم. لا يمكنك إرسال أو استقبال الرسائل.</p>
             <button onClick={onBlock} className="text-red-600 underline text-sm hover:text-red-800">
               إلغاء الحظر
             </button>
           </div>
        )}

        {/* State: Not Subscribed */}
        {!isSubscriber && !isBlocked && (
           <div className="absolute inset-0 z-20 backdrop-blur-sm bg-white/30 flex flex-col items-center justify-center p-6 text-center">
             <Lock className="w-16 h-16 text-primary-500 mb-4" />
             <h3 className="text-2xl font-bold text-gray-800 mb-2">هذه الخاصية للمشتركين فقط</h3>
             <p className="text-gray-600 mb-6 max-w-md">للحفاظ على جدية التعارف، يقتصر التواصل المباشر على الأعضاء المشتركين. اشترك الآن وابدأ المحادثة.</p>
             <button onClick={onShowSubscription} className="bg-primary-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-primary-700 transition transform hover:scale-105">
               فتح المحادثات
             </button>
           </div>
        )}

        {/* State: Subscribed but No Request */}
        {isSubscriber && connectionStatus === 'NONE' && !isBlocked && currentUser.role !== 'ADMIN' && (
             <div className="absolute inset-0 z-20 bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
             <Shield className="w-16 h-16 text-gray-400 mb-4" />
             <h3 className="text-xl font-bold text-gray-800 mb-2">ابدأ بطلب التعارف</h3>
             <p className="text-gray-600 mb-6 max-w-md">لضمان خصوصية الأعضاء، يجب عليك إرسال طلب محادثة أولاً وانتظار قبول الطرف الآخر.</p>
             <button onClick={onRequestChat} className="bg-primary-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-primary-700 transition transform hover:scale-105 flex items-center gap-2">
               <MessageCircle size={18} />
               إرسال طلب محادثة
             </button>
           </div>
        )}

        {/* State: Request Pending */}
        {isSubscriber && connectionStatus === 'PENDING' && !isBlocked && currentUser.role !== 'ADMIN' && (
             <div className="absolute inset-0 z-20 bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
             <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-yellow-200 opacity-75"></div>
                <Scroll className="w-16 h-16 text-yellow-500 mb-4 relative z-10" />
             </div>
             <h3 className="text-xl font-bold text-gray-800 mb-2">تم إرسال الطلب</h3>
             <p className="text-gray-600 mb-6 max-w-md">طلبك في انتظار موافقة {partner.name}. سيتم إشعارك فور القبول.</p>
             <div className="text-xs text-gray-400">يرجى التحلي بالصبر...</div>
           </div>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMe ? 'bg-primary-600 text-white rounded-bl-none' : 'bg-white text-gray-800 shadow-sm rounded-br-none'}`}>
                <p>{msg.text}</p>
                <span className={`text-[10px] block mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                   {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={(!isSubscriber && currentUser.role !== 'ADMIN') || (connectionStatus !== 'ACCEPTED' && currentUser.role !== 'ADMIN') || isBlocked}
            placeholder={isBlocked ? "المستخدم محظور" : (connectionStatus === 'ACCEPTED' || currentUser.role === 'ADMIN') ? "اكتب رسالتك هنا..." : "الدردشة غير متاحة"}
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={(!isSubscriber && currentUser.role !== 'ADMIN') || !inputText.trim() || (connectionStatus !== 'ACCEPTED' && currentUser.role !== 'ADMIN') || isBlocked}
            className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 6. Registration Form
const RegisterForm = ({ onRegister, onLoginClick }: { onRegister: (u: Partial<User>) => void, onLoginClick: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: Gender.MALE,
    city: '',
    job: '',
    hobbies: '',
    bio: '',
    religion: 'مسلم',
    sect: 'سني',
    maritalStatus: 'أعزب',
    zodiacSign: 'الحمل',
    mood: 'متفائل'
  });
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAiBio = async () => {
    if (!formData.name || !formData.job) {
        alert("يرجى ملء الاسم والوظيفة أولاً");
        return;
    }
    setLoadingAi(true);
    const suggestion = await generateBioSuggestion(formData.name, Number(formData.age), formData.job, formData.hobbies);
    setFormData(prev => ({ ...prev, bio: suggestion }));
    setLoadingAi(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <Heart className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">إنشاء حساب جديد</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
           أو <button onClick={onLoginClick} className="font-medium text-primary-600 hover:text-primary-500">سجل دخولك الآن</button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">الاسم</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">العمر</label>
                    <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">الجنس</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500">
                        <option value={Gender.MALE}>رجل</option>
                        <option value={Gender.FEMALE}>امرأة</option>
                    </select>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">الحالة الاجتماعية</label>
              <select value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500">
                  <option value="أعزب">أعزب / عزباء</option>
                  <option value="مطلق">مطلق / مطلقة</option>
                  <option value="أرمل">أرمل / أرملة</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">البرج</label>
                    <select value={formData.zodiacSign} onChange={e => setFormData({...formData, zodiacSign: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500">
                        {['الحمل', 'الثور', 'الجوزاء', 'السرطان', 'الأسد', 'العذراء', 'الميزان', 'العقرب', 'القوس', 'الجدي', 'الدلو', 'الحوت'].map(sign => (
                            <option key={sign} value={sign}>{sign}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">الحالة المزاجية</label>
                    <select value={formData.mood} onChange={e => setFormData({...formData, mood: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500">
                        {['سعيد', 'هادئ', 'رومانسي', 'جاد', 'متفائل', 'نشيط', 'حالم'].map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">الديانة</label>
                    <select value={formData.religion} onChange={e => setFormData({...formData, religion: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500">
                        <option value="مسلم">مسلم</option>
                        <option value="مسيحي">مسيحي</option>
                        <option value="أخرى">أخرى</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">المذهب/الطائفة</label>
                    <input type="text" value={formData.sect} onChange={e => setFormData({...formData, sect: e.target.value})} placeholder="اختياري" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">المدينة</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">الوظيفة</label>
              <input type="text" value={formData.job} onChange={e => setFormData({...formData, job: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            
             <div>
              <label className="block text-sm font-medium text-gray-700">الهوايات</label>
              <input type="text" placeholder="مثال: القراءة، السفر، الطبخ" value={formData.hobbies} onChange={e => setFormData({...formData, hobbies: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">النبذة الشخصية</label>
                    <button onClick={handleAiBio} disabled={loadingAi} className="text-xs flex items-center gap-1 text-primary-600 hover:text-primary-800 disabled:text-gray-400">
                        <Sparkles size={12} />
                        {loadingAi ? 'جاري الكتابة...' : 'مساعدة من الذكاء الاصطناعي'}
                    </button>
                </div>
                <textarea rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500" placeholder="تحدث عن نفسك وما تبحث عنه..." />
            </div>

            <button onClick={() => onRegister(formData)} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              تسجيل حساب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. Login Form
const LoginForm = ({ onLogin, onLoginAdmin, onRegisterClick }: { onLogin: () => void, onLoginAdmin: () => void, onRegisterClick: () => void }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <Heart className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">تسجيل الدخول</h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
            <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <UserIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3 flex-1 md:flex md:justify-between">
                        <p className="text-sm text-blue-700">حساب تجريبي: اضغط دخول مباشرة</p>
                    </div>
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
              <input type="email" defaultValue="demo@wifaq.com" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
              <input type="password" defaultValue="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <button onClick={onLogin} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
              دخول كمستخدم
            </button>
            <button onClick={onLoginAdmin} className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              دخول كمسؤول النظام
            </button>
             <div className="text-center mt-4">
                 <button onClick={onRegisterClick} className="text-sm text-primary-600 hover:text-primary-500">ليس لديك حساب؟ سجل الآن</button>
             </div>
        </div>
      </div>
    </div>
);

// 8. Support Ticket System
const SupportView = ({ tickets, onAddTicket }: { tickets: Ticket[], onAddTicket: (subject: string, message: string, type: 'SUPPORT' | 'COMPLAINT') => void }) => {
    const [activeTab, setActiveTab] = useState<'NEW' | 'LIST'>('LIST');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'SUPPORT' | 'COMPLAINT'>('SUPPORT');

    const handleSubmit = () => {
        if(!subject || !message) return;
        onAddTicket(subject, message, type);
        setSubject('');
        setMessage('');
        setActiveTab('LIST');
        alert("تم إرسال تذكرتك بنجاح.");
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
             <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <LifeBuoy className="text-primary-600" />
                مركز الدعم والشكاوى
            </h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button onClick={() => setActiveTab('LIST')} className={`flex-1 py-4 text-center text-sm font-medium ${activeTab === 'LIST' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        تذاكري
                    </button>
                    <button onClick={() => setActiveTab('NEW')} className={`flex-1 py-4 text-center text-sm font-medium ${activeTab === 'NEW' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        تذكرة جديدة
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'LIST' ? (
                        <div className="space-y-4">
                            {tickets.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">لا توجد تذاكر حالياً.</p>
                            ) : (
                                tickets.map(ticket => (
                                    <div key={ticket.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${ticket.type === 'COMPLAINT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {ticket.type === 'COMPLAINT' ? 'شكوى' : 'دعم فني'}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded border ${ticket.status === 'OPEN' ? 'border-green-200 text-green-700 bg-green-50' : 'border-gray-200 text-gray-600'}`}>
                                                {ticket.status === 'OPEN' ? 'مفتوح' : ticket.status === 'PENDING' ? 'قيد المراجعة' : 'مغلق'}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-800">{ticket.subject}</h4>
                                        <p className="text-gray-600 text-sm mt-1">{ticket.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">{new Date(ticket.date).toLocaleDateString('ar-SA')}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-lg mx-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نوع التذكرة</label>
                                <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-500 focus:border-primary-500">
                                    <option value="SUPPORT">دعم فني</option>
                                    <option value="COMPLAINT">شكوى على عضو/خدمة</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الموضوع</label>
                                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">التفاصيل</label>
                                <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <button onClick={handleSubmit} className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition">
                                إرسال
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 9. Admin Dashboard
const AdminDashboard = ({ 
    users, 
    tickets, 
    onImpersonate 
}: { 
    users: User[], 
    tickets: Ticket[], 
    onImpersonate: (userId: string) => void 
}) => {
    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <LayoutDashboard className="text-primary-600" />
                لوحة تحكم المدير
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Users Management */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">إدارة المستخدمين</h3>
                        <span className="text-sm text-gray-500">{users.length} مستخدم</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستخدم</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.filter(u => u.role !== 'ADMIN').map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <img className="h-8 w-8 rounded-full" src={user.photoUrl} alt="" />
                                                </div>
                                                <div className="mr-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.city}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.subscription !== SubscriptionPlan.FREE ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {user.subscription}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                            <button onClick={() => onImpersonate(user.id)} className="text-primary-600 hover:text-primary-900 flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                دخول كعضو
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Tickets */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">آخر التذاكر والشكاوى</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                         {tickets.map(ticket => (
                            <div key={ticket.id} className="border border-gray-100 rounded p-3 bg-gray-50">
                                <div className="flex justify-between">
                                    <span className="text-sm font-bold text-gray-800">{ticket.subject}</span>
                                    <span className={`text-xs px-2 rounded ${ticket.type === 'COMPLAINT' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>{ticket.type}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">من: {ticket.userName}</p>
                                <p className="text-sm text-gray-700 mt-2">{ticket.message}</p>
                                <div className="mt-2 text-left">
                                    <button className="text-xs text-primary-600 hover:underline">عرض التفاصيل</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---

const App = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [originalAdmin, setOriginalAdmin] = useState<User | null>(null); // For impersonation
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [filters, setFilters] = useState<{
    gender?: Gender;
    city?: string;
    name?: string;
    minAge?: string;
    maxAge?: string;
    maritalStatus?: string;
    sect?: string;
  }>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  
  // Pulse State
  const [pulses, setPulses] = useState<Pulse[]>(MOCK_PULSES);
  const [showPulseModal, setShowPulseModal] = useState(false);

  // Chat permissions state
  const [chatRequests, setChatRequests] = useState<Record<string, 'PENDING' | 'ACCEPTED' | 'REJECTED'>>({});

  // Ticket State
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);

  // Authentication Logic
  const handleLogin = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2); 

    const user: User = {
      id: 'me',
      name: 'مستخدم تجريبي',
      age: 29,
      gender: Gender.MALE,
      city: 'الرياض',
      bio: 'أحب التقنية والرياضة، أبحث عن شريكة حياة.',
      photoUrl: 'https://ui-avatars.com/api/?name=User+Demo&background=random',
      job: 'مبرمج',
      isOnline: true,
      subscription: SubscriptionPlan.WEEKLY,
      joinedDate: new Date().toISOString(),
      religion: 'مسلم',
      sect: 'سني',
      maritalStatus: 'أعزب',
      blockedUserIds: [],
      subscriptionEndDate: d.toISOString(),
      role: 'USER',
      zodiacSign: 'العقرب',
      mood: 'نشيط'
    };
    setCurrentUser(user);
    setView('BROWSE');
  };
  
  const handleLoginAdmin = () => {
      const adminUser = MOCK_USERS.find(u => u.role === 'ADMIN');
      if(adminUser) {
          setCurrentUser(adminUser);
          setView('ADMIN');
      }
  };

  const handleRegister = (data: Partial<User>) => {
      const newUser: User = {
          id: 'me-new',
          name: data.name || 'عضو جديد',
          age: Number(data.age) || 25,
          gender: data.gender || Gender.MALE,
          city: data.city || 'الرياض',
          bio: data.bio || '',
          photoUrl: `https://ui-avatars.com/api/?name=${data.name}&background=random`,
          job: data.job || '',
          isOnline: true,
          subscription: SubscriptionPlan.FREE,
          joinedDate: new Date().toISOString(),
          religion: data.religion || 'مسلم',
          sect: data.sect || '',
          maritalStatus: data.maritalStatus || 'أعزب',
          blockedUserIds: [],
          role: 'USER',
          zodiacSign: data.zodiacSign || 'الحمل',
          mood: data.mood || 'سعيد'
      };
      setCurrentUser(newUser);
      setView('SUBSCRIPTION'); 
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setOriginalAdmin(null);
    setView('HOME');
    setNotifications([]);
    setShowExpiryWarning(false);
  };

  const initiateSubscribe = (plan: SubscriptionPlan) => {
      setSelectedPlanForPayment(plan);
      setShowPaymentModal(true);
  };

  const confirmSubscribe = () => {
    if (currentUser && selectedPlanForPayment) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); 
      setCurrentUser({ 
        ...currentUser, 
        subscription: selectedPlanForPayment,
        subscriptionEndDate: endDate.toISOString()
      });
      setShowExpiryWarning(false);
      setShowPaymentModal(false);
      alert(`مبروك! تم تفعيل اشتراكك الـ ${selectedPlanForPayment} بنجاح.`);
      setView('BROWSE');
    }
  };

  // Pulse Handler
  const handleAddPulse = (text: string) => {
    if (!currentUser) return;
    const newPulse: Pulse = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userPhoto: currentUser.photoUrl,
        text: text,
        timestamp: Date.now()
    };
    setPulses([newPulse, ...pulses]);
  };

  // Ticket Handler
  const handleAddTicket = (subject: string, message: string, type: 'SUPPORT' | 'COMPLAINT') => {
      if(!currentUser) return;
      const newTicket: Ticket = {
          id: Date.now().toString(),
          userId: currentUser.id,
          userName: currentUser.name,
          subject,
          message,
          type,
          status: 'OPEN',
          date: new Date().toISOString()
      };
      setTickets([newTicket, ...tickets]);
  };

  // Impersonation Handler
  const handleImpersonate = (userId: string) => {
      const targetUser = MOCK_USERS.find(u => u.id === userId);
      if(targetUser && currentUser?.role === 'ADMIN') {
          setOriginalAdmin(currentUser);
          setCurrentUser(targetUser);
          setView('BROWSE');
          alert(`أنت الآن تتصفح بصلاحيات المستخدم: ${targetUser.name}`);
      }
  };

  const handleExitImpersonation = () => {
      if(originalAdmin) {
          setCurrentUser(originalAdmin);
          setOriginalAdmin(null);
          setView('ADMIN');
      }
  };


  // Notification Helper
  const addNotification = useCallback((title: string, message: string) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      type: 'SYSTEM',
      title,
      message,
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const handleOpenChat = (user: User) => {
    setSelectedProfile(user);
    setView('MESSAGES');
  };

  const getChatStatus = (uid1: string, uid2: string): 'NONE' | 'PENDING' | 'ACCEPTED' => {
      const key = [uid1, uid2].sort().join('_');
      return chatRequests[key] || 'NONE';
  };

  const handleSendChatRequest = () => {
      if (!currentUser || !selectedProfile) return;
      const key = [currentUser.id, selectedProfile.id].sort().join('_');
      
      setChatRequests(prev => ({...prev, [key]: 'PENDING'}));

      setTimeout(() => {
          setChatRequests(prev => ({...prev, [key]: 'ACCEPTED'}));
          addNotification("تم قبول طلبك", `وافقت ${selectedProfile.name} على طلب المحادثة.`);
      }, 3000);
  };

  const handleBlockUser = () => {
    if (!currentUser || !selectedProfile) return;
    const isBlocked = currentUser.blockedUserIds.includes(selectedProfile.id);
    
    let updatedBlockedList;
    if (isBlocked) {
        updatedBlockedList = currentUser.blockedUserIds.filter(id => id !== selectedProfile.id);
    } else {
        updatedBlockedList = [...currentUser.blockedUserIds, selectedProfile.id];
    }
    
    setCurrentUser({...currentUser, blockedUserIds: updatedBlockedList});
  };

  const handleClearNotifications = () => {
      setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  useEffect(() => {
    if (currentUser?.subscriptionEndDate) {
        const end = new Date(currentUser.subscriptionEndDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3 && diffDays > 0) {
            setShowExpiryWarning(true);
        } else {
            setShowExpiryWarning(false);
        }
    }
  }, [currentUser]);


  const filteredUsers = MOCK_USERS.filter(u => {
    if (u.role === 'ADMIN') return false; // Hide admin from list
    if (currentUser?.blockedUserIds.includes(u.id)) return false;

    // If admin is impersonating, they can see everyone, otherwise filter by gender
    if (currentUser?.role !== 'ADMIN' && !originalAdmin) {
         if (currentUser) {
             // Strict enforcement for logged in users: Show opposite gender only
             if (u.gender === currentUser.gender) return false;
         }
    }
    
    // For Guests: Use gender filter if selected
    if (!currentUser && filters.gender) {
        if (u.gender !== filters.gender) return false;
    }
    
    if (filters.city && u.city !== filters.city) return false;
    if (filters.name && !u.name.toLowerCase().includes(filters.name.toLowerCase())) return false; 
    if (filters.minAge && u.age < Number(filters.minAge)) return false;
    if (filters.maxAge && u.age > Number(filters.maxAge)) return false;
    if (filters.maritalStatus && u.maritalStatus !== filters.maritalStatus) return false;
    if (filters.sect && u.sect !== filters.sect) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      <Navbar 
        user={currentUser} 
        onNavigate={setView} 
        onLogout={handleLogout} 
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
      />

      {/* Pulse Bar (Ticker) */}
      {currentUser && (
          <PulseBar pulses={pulses} onAddClick={() => setShowPulseModal(true)} />
      )}
      
      <PulseModal 
        isOpen={showPulseModal} 
        onClose={() => setShowPulseModal(false)} 
        onSubmit={handleAddPulse}
      />

      {/* Impersonation Banner */}
      {originalAdmin && (
          <div className="bg-red-600 text-white px-4 py-2 text-center fixed bottom-0 left-0 right-0 z-[100] flex justify-between items-center shadow-lg">
              <span className="font-bold mr-4">⚠️ وضع المسؤول: تتصفح حالياً باسم {currentUser?.name}</span>
              <button onClick={handleExitImpersonation} className="bg-white text-red-600 px-4 py-1 rounded-full text-sm font-bold hover:bg-red-50">
                  العودة للوحة التحكم
              </button>
          </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPlanForPayment && (
          <PaymentModal 
              plan={selectedPlanForPayment} 
              onClose={() => setShowPaymentModal(false)} 
              onConfirm={confirmSubscribe} 
          />
      )}

      {showExpiryWarning && currentUser && (
          <div className="bg-orange-100 border-b border-orange-200 text-orange-800 px-4 py-3 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">تنبيه: اشتراكك الحالي سينتهي قريباً. جدد الآن للاستمرار في التواصل.</span>
             </div>
             <button onClick={() => setView('SUBSCRIPTION')} className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded-full transition">
                 تجديد الاشتراك
             </button>
          </div>
      )}

      {view === 'HOME' && (
        <>
          <Hero onCta={() => setView(currentUser ? 'BROWSE' : 'REGISTER')} />
          <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold text-gray-900">لماذا تختار وفاق؟</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-6">
                     <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                       <Lock />
                     </div>
                     <h3 className="text-lg font-medium text-gray-900">خصوصية تامة</h3>
                     <p className="mt-2 text-base text-gray-500">بياناتك محمية، ولا يمكن لغير المشتركين التواصل معك، مما يضمن الجدية.</p>
                  </div>
                  <div className="text-center p-6">
                     <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                       <CheckCircle />
                     </div>
                     <h3 className="text-lg font-medium text-gray-900">أعضاء موثقين</h3>
                     <p className="mt-2 text-base text-gray-500">نقوم بمراجعة الملفات يدوياً وبواسطة الذكاء الاصطناعي لضمان بيئة آمنة.</p>
                  </div>
                  <div className="text-center p-6">
                     <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                       <Sparkles />
                     </div>
                     <h3 className="text-lg font-medium text-gray-900">توافق ذكي</h3>
                     <p className="mt-2 text-base text-gray-500">نستخدم الذكاء الاصطناعي لمساعدتك في كتابة ملفك وإيجاد الشريك الأنسب.</p>
                  </div>
               </div>
            </div>
          </div>
        </>
      )}

      {view === 'LOGIN' && <LoginForm onLogin={handleLogin} onLoginAdmin={handleLoginAdmin} onRegisterClick={() => setView('REGISTER')} />}
      
      {view === 'REGISTER' && <RegisterForm onRegister={handleRegister} onLoginClick={() => setView('LOGIN')} />}

      {view === 'SUBSCRIPTION' && (
        <SubscriptionView onSubscribeRequest={initiateSubscribe} onCancel={() => setView('BROWSE')} />
      )}

      {view === 'SUPPORT' && currentUser && (
        <SupportView tickets={tickets.filter(t => t.userId === currentUser.id)} onAddTicket={handleAddTicket} />
      )}

      {view === 'ADMIN' && currentUser?.role === 'ADMIN' && (
          <AdminDashboard users={MOCK_USERS} tickets={tickets} onImpersonate={handleImpersonate} />
      )}

      {view === 'BROWSE' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-6 h-6 text-primary-600" />
                اكتشف شريك حياتك
            </h2>
            
            {/* Advanced Search Bar */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Gender Filter (Guests Only) */}
                    {!currentUser && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">أبحث عن</label>
                            <select 
                                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={filters.gender || ''}
                                onChange={(e) => setFilters(prev => ({...prev, gender: e.target.value as Gender || undefined}))}
                            >
                                <option value="">الكل</option>
                                <option value={Gender.MALE}>زوج (رجال)</option>
                                <option value={Gender.FEMALE}>زوجة (نساء)</option>
                            </select>
                        </div>
                    )}

                    {/* Name Filter */}
                    <div className="relative">
                        <label className="block text-xs font-medium text-gray-500 mb-1">الاسم</label>
                        <input 
                            type="text"
                            placeholder="بحث بالاسم..."
                            className="w-full border border-gray-300 rounded-md py-2 pr-10 pl-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            value={filters.name || ''}
                            onChange={(e) => setFilters(prev => ({...prev, name: e.target.value}))}
                        />
                         <div className="absolute top-8 right-0 pr-3 flex items-center pointer-events-none">
                             <Search className="h-4 w-4 text-gray-400" />
                         </div>
                    </div>

                    {/* City Filter */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">المدينة</label>
                        <select 
                            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={filters.city || ''}
                            onChange={(e) => setFilters(prev => ({...prev, city: e.target.value || undefined}))}
                        >
                            <option value="">كل المدن</option>
                            <option value="الرياض">الرياض</option>
                            <option value="جدة">جدة</option>
                            <option value="دبي">دبي</option>
                            <option value="القاهرة">القاهرة</option>
                            <option value="الكويت">الكويت</option>
                            <option value="عمان">عمان</option>
                        </select>
                    </div>

                    {/* Marital Status Filter */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">الحالة الاجتماعية</label>
                        <select 
                            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={filters.maritalStatus || ''}
                            onChange={(e) => setFilters(prev => ({...prev, maritalStatus: e.target.value || undefined}))}
                        >
                            <option value="">الكل</option>
                            <option value="أعزب">أعزب / عزباء</option>
                            <option value="مطلق">مطلق / مطلقة</option>
                            <option value="أرمل">أرمل / أرملة</option>
                        </select>
                    </div>

                     {/* Sect Filter */}
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">المذهب</label>
                        <select 
                            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={filters.sect || ''}
                            onChange={(e) => setFilters(prev => ({...prev, sect: e.target.value || undefined}))}
                        >
                            <option value="">الكل</option>
                            <option value="سني">سني</option>
                            <option value="شيعي">شيعي</option>
                        </select>
                    </div>

                     {/* Age Range Filter */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">الفئة العمرية</label>
                        <div className="flex items-center gap-2">
                           <input 
                                type="number" 
                                placeholder="من" 
                                className="w-1/2 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={filters.minAge || ''}
                                onChange={(e) => setFilters(prev => ({...prev, minAge: e.target.value}))}
                           />
                           <span className="text-gray-400">-</span>
                           <input 
                                type="number" 
                                placeholder="إلى" 
                                className="w-1/2 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={filters.maxAge || ''}
                                onChange={(e) => setFilters(prev => ({...prev, maxAge: e.target.value}))}
                           />
                        </div>
                    </div>
                     
                    {/* Clear Filters Button */}
                     <div className="flex items-end">
                        <button 
                            onClick={() => setFilters({})}
                            className="w-full bg-gray-100 text-gray-600 hover:bg-gray-200 py-2 px-4 rounded-md text-sm font-medium transition"
                        >
                            مسح التصفية
                        </button>
                    </div>

                </div>
            </div>
          </div>

          {!currentUser && (
            <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 mb-6 rounded-md shadow-sm">
               <div className="flex">
                 <div className="flex-shrink-0">
                   <Lock className="h-5 w-5 text-yellow-400" />
                 </div>
                 <div className="mr-3">
                   <p className="text-sm text-yellow-700">
                     يجب عليك <button onClick={() => setView('LOGIN')} className="font-bold underline">تسجيل الدخول</button> لعرض تفاصيل الأعضاء وبدء المحادثات.
                   </p>
                 </div>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <UserCard 
                key={user.id} 
                user={user} 
                onClick={() => {
                  if(!currentUser) setView('LOGIN');
                  else handleOpenChat(user);
                }} 
              />
            ))}
            {filteredUsers.length === 0 && (
                <div className="col-span-full py-16 text-center">
                    <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">لا توجد نتائج</h3>
                    <p className="text-gray-500 mt-1">حاول تغيير خيارات البحث للعثور على أعضاء.</p>
                </div>
            )}
          </div>
        </div>
      )}

      {view === 'MESSAGES' && currentUser && (
        selectedProfile ? (
          <ChatInterface 
            currentUser={currentUser} 
            partner={selectedProfile} 
            onBack={() => setSelectedProfile(null)}
            onShowSubscription={() => setView('SUBSCRIPTION')}
            connectionStatus={getChatStatus(currentUser.id, selectedProfile.id)}
            onRequestChat={handleSendChatRequest}
            onBlock={handleBlockUser}
            isBlocked={currentUser.blockedUserIds.includes(selectedProfile.id)}
          />
        ) : (
          <div className="max-w-4xl mx-auto py-8 px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">الرسائل</h2>
            <div className="bg-white rounded-lg shadow p-12 flex flex-col items-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">لم تقم باختيار أي محادثة بعد.</p>
                <button onClick={() => setView('BROWSE')} className="mt-4 text-primary-600 font-medium hover:text-primary-800">تصفح الأعضاء لبدء محادثة</button>
            </div>
          </div>
        )
      )}

      {/* Footer */}
      {view !== 'MESSAGES' && (
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
             <div className="flex items-center">
                <Heart className="h-6 w-6 text-gray-400" />
                <span className="mr-2 text-gray-500 font-bold">وفاق &copy; 2024</span>
             </div>
             <div className="flex space-x-6 space-x-reverse text-gray-400 text-sm">
                <a href="#" className="hover:text-gray-500">سياسة الخصوصية</a>
                <a href="#" className="hover:text-gray-500">الشروط والأحكام</a>
                <a href="#" className="hover:text-gray-500">اتصل بنا</a>
             </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;