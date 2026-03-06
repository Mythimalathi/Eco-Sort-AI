import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Camera, 
  Trophy, 
  User, 
  Leaf, 
  ArrowRight, 
  LogOut, 
  ChevronRight, 
  Star, 
  Zap, 
  Recycle, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Truck,
  Calendar,
  MapPin,
  Phone,
  Weight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { identifyWaste, findNearbyBanks } from './services/geminiService';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type Section = 'home' | 'store' | 'scan' | 'rank' | 'profile' | 'pickup' | 'banks';
type WasteType = 'Plastic' | 'Organic' | 'Paper' | 'Metal' | 'Glass' | 'Other';

interface UserData {
  name: string;
  email: string;
  points: number;
  level: string;
  avatar: string;
  stats: Record<string, number>;
  history: Array<{ id: string; type: string; points: number; date: string }>;
}

const AVATAR_OPTIONS = [
  { id: 'nature1', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=200', category: 'Nature' },
  { id: 'nature2', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=200', category: 'Nature' },
  { id: 'nature3', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=200', category: 'Nature' },
  { id: 'nature4', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=200', category: 'Nature' },
  { id: 'eco1', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=200', category: 'Eco' },
  { id: 'eco2', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=200', category: 'Eco' },
  { id: 'animal1', url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=200', category: 'Animal' },
  { id: 'animal2', url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=200', category: 'Animal' },
];

const ECO_LEVELS = [
  { name: 'Beginner', min: 0, max: 50 },
  { name: 'Recycler', min: 51, max: 150 },
  { name: 'Eco Hero', min: 151, max: 300 },
  { name: 'Green Champion', min: 301, max: Infinity },
];

const ECO_TIPS = [
  "Carry a reusable water bottle to reduce plastic waste.",
  "Compost organic waste to create nutrient-rich soil.",
  "Rinse containers before recycling to avoid contamination.",
  "Use cloth bags instead of plastic ones for shopping.",
  "Turn off lights when leaving a room to save energy.",
  "Recycle old electronics at designated collection points.",
];

// --- Components ---

const WelcomeScreen = ({ onStart }: { onStart: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cover bg-center text-white"
    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560")' }}
  >
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="relative z-10 text-center px-6"
    >
      <div className="mb-4 flex justify-center">
        <div className="p-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50">
          <Leaf size={48} className="text-white" />
        </div>
      </div>
      <h1 className="text-5xl font-bold mb-2 tracking-tight">EcoSort AI</h1>
      <p className="text-xl text-emerald-50 mb-12 font-light">Smart Waste Sorting for a Greener Planet</p>
      
      <button 
        onClick={onStart}
        className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-emerald-600 rounded-full hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 shadow-xl"
      >
        Get Started
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  </motion.div>
);

const AuthPage = ({ onLogin }: { onLogin: (name: string, email: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email.split('@')[0], email);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-emerald-100">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-100 rounded-2xl mb-4">
            <Leaf className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500">Join the movement for a cleaner earth</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="hello@ecosort.ai"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            Login
          </button>
        </form>

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or continue with</span></div>
        </div>

        <button 
          onClick={() => onLogin('Eco Warrior', 'warrior@earth.com')}
          className="mt-6 w-full py-4 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Google
        </button>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [step, setStep] = useState<'welcome' | 'auth' | 'app'>('welcome');
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [user, setUser] = useState<UserData>({
    name: 'Alex Green',
    email: 'alex@earth.com',
    points: 120,
    level: 'Recycler',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    stats: { Plastic: 12, Organic: 45, Paper: 28, Metal: 5 },
    history: [
      { id: '1', type: 'Plastic', points: 10, date: '2024-05-20' },
      { id: '2', type: 'Organic', points: 6, date: '2024-05-19' },
    ]
  });

  const [dailyTip, setDailyTip] = useState('');
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);

  useEffect(() => {
    setDailyTip(ECO_TIPS[Math.floor(Math.random() * ECO_TIPS.length)]);
  }, []);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setShowKeyPrompt(!hasKey);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setShowKeyPrompt(false);
    }
  };

  const handleLogin = (name: string, email: string) => {
    setUser(prev => ({ ...prev, name, email }));
    setStep('app');
  };

  const addPoints = (amount: number, type: string) => {
    setUser(prev => {
      const newPoints = prev.points + amount;
      const newLevel = ECO_LEVELS.find(l => newPoints >= l.min && newPoints <= l.max)?.name || prev.level;
      return {
        ...prev,
        points: newPoints,
        level: newLevel,
        stats: { ...prev.stats, [type]: (prev.stats[type] || 0) + 1 },
        history: [{ id: Date.now().toString(), type, points: amount, date: new Date().toISOString().split('T')[0] }, ...prev.history]
      };
    });
  };

  if (step === 'welcome') return <WelcomeScreen onStart={() => setStep('auth')} />;
  if (step === 'auth') return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-bottom border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <Leaf className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">EcoSort AI</span>
        </div>
        <div className="flex items-center gap-3">
          {showKeyPrompt && (
            <button 
              onClick={handleOpenKeySelector}
              className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold animate-pulse"
            >
              <AlertCircle size={14} />
              Set API Key
            </button>
          )}
          <div className="bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Zap size={16} className="text-emerald-600 fill-emerald-600" />
            <span className="text-emerald-700 font-bold text-sm">{user.points}</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-6">
        <AnimatePresence mode="wait">
          {activeSection === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-800">Hello, {user.name}! 👋</h2>
                <p className="text-slate-500">Ready to save the planet today?</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Recycle size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Plastic</p>
                    <p className="text-xl font-bold text-slate-800">{user.stats.Plastic || 0}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
                  <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Organic</p>
                    <p className="text-xl font-bold text-slate-800">{user.stats.Organic || 0}</p>
                  </div>
                </div>
              </div>

              {/* Daily Tip */}
              <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Leaf size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={16} className="fill-white" />
                    <span className="text-xs font-bold uppercase tracking-widest">Daily Eco Tip</span>
                  </div>
                  <p className="text-lg font-medium leading-relaxed">{dailyTip}</p>
                </div>
              </div>

              {/* Schedule Pickup Action */}
              <button 
                onClick={() => setActiveSection('pickup')}
                className="w-full bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Truck size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-800">Schedule Trash Pickup</h3>
                    <p className="text-xs text-slate-500">Minimum 5kg of waste required</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </button>

              {/* Nearby Banks Action */}
              <button 
                onClick={() => setActiveSection('banks')}
                className="w-full bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <MapPin size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-800">Nearby Trash Banks</h3>
                    <p className="text-xs text-slate-500">Find recycling centers near you</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>

              {/* Recent Activity */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Recent Activity</h3>
                  <button className="text-emerald-600 text-sm font-semibold">View All</button>
                </div>
                <div className="space-y-3">
                  {user.history.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                          <Recycle size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{item.type} Waste</p>
                          <p className="text-xs text-slate-400">{item.date}</p>
                        </div>
                      </div>
                      <div className="text-emerald-600 font-bold">+{item.points} pts</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'scan' && (
            <ScanSection onResult={addPoints} />
          )}

          {activeSection === 'rank' && (
            <RankSection user={user} />
          )}

          {activeSection === 'store' && (
            <StoreSection points={user.points} />
          )}

          {activeSection === 'pickup' && (
            <PickupSection onComplete={() => setActiveSection('home')} />
          )}

          {activeSection === 'banks' && (
            <BanksSection />
          )}

          {activeSection === 'profile' && (
            <ProfileSection 
              user={user} 
              onLogout={() => setStep('welcome')} 
              onUpdateAvatar={(url) => setUser(prev => ({ ...prev, avatar: url }))}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 pb-8 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <NavButton active={activeSection === 'home'} onClick={() => setActiveSection('home')} icon={<Home size={24} />} label="Home" />
          <NavButton active={activeSection === 'banks'} onClick={() => setActiveSection('banks')} icon={<MapPin size={24} />} label="Banks" />
          <div className="relative -top-6">
            <button 
              onClick={() => setActiveSection('scan')}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300",
                activeSection === 'scan' ? "bg-emerald-600 text-white scale-110" : "bg-emerald-500 text-white hover:bg-emerald-600"
              )}
            >
              <Camera size={28} />
            </button>
          </div>
          <NavButton active={activeSection === 'rank'} onClick={() => setActiveSection('rank')} icon={<Trophy size={24} />} label="Rank" />
          <NavButton active={activeSection === 'profile'} onClick={() => setActiveSection('profile')} icon={<User size={24} />} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 transition-colors",
      active ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
    )}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

// --- Sub-Sections ---

const ScanSection = ({ onResult }: { onResult: (pts: number, type: string) => void }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setError(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser does not support camera access. Please try uploading a photo instead.");
      return;
    }

    setIsLive(true);
    
    // We need to wait for the next tick to ensure videoRef is available after setIsLive(true)
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure it plays
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.error("Error playing video:", playErr);
          }
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError("Camera permission denied. Please enable camera access in your browser settings.");
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError("No camera found on this device.");
        } else {
          setError(`Camera error: ${err.message || "Unknown error"}. Please try again or upload a file.`);
        }
        setIsLive(false);
      }
    }, 100);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsLive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        setImage(base64);
        stopCamera();
        processImage(base64);
      }
    }
  };

  const processImage = async (base64: string) => {
    setIsScanning(true);
    try {
      const data = await identifyWaste(base64);
      setResult(data);
      onResult(data.points || 0, data.type || 'Other');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to identify waste. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">AI Waste Scanner</h2>
        <p className="text-slate-500">Scan your waste to see how to recycle it</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          {error.includes("Camera") && (
            <button 
              onClick={startCamera}
              className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              Retry Camera Access
            </button>
          )}
          {error.includes("Quota exceeded") && (
            <button 
              onClick={async () => {
                if (window.aistudio) {
                  await window.aistudio.openSelectKey();
                  setError(null);
                }
              }}
              className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              Set My API Key Now
            </button>
          )}
        </div>
      )}

      {!image && !isLive ? (
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={startCamera}
            className="aspect-[4/3] w-full border-4 border-dashed border-emerald-100 rounded-[40px] flex flex-col items-center justify-center gap-4 bg-emerald-50/30 cursor-pointer hover:bg-emerald-50 transition-colors"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <Camera size={40} />
            </div>
            <p className="font-bold text-emerald-700">Open Live Camera</p>
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-400"><span className="px-4 bg-slate-50">Or</span></div>
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-600 font-bold hover:bg-white transition-colors"
          >
            <Plus size={20} />
            Upload from Gallery
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
      ) : isLive ? (
        <div className="space-y-6">
          <div className="relative aspect-square w-full rounded-[40px] overflow-hidden shadow-2xl bg-black">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-white/30 rounded-[40px] pointer-events-none m-8 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-emerald-400/50 rounded-3xl" />
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={stopCamera}
              className="flex-1 py-4 bg-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={captureImage}
              className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              <Camera size={20} />
              Capture Waste
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative aspect-square w-full rounded-[40px] overflow-hidden shadow-2xl">
            <img src={image!} className="w-full h-full object-cover" alt="Scan" />
            {isScanning && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-bold text-xl">Analyzing Waste...</p>
              </div>
            )}
          </div>

          {result && !isScanning && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-6 shadow-xl border border-emerald-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Detected</p>
                    <h3 className="text-xl font-bold text-slate-800">{result.type}</h3>
                  </div>
                </div>
                <div className="bg-emerald-600 text-white px-4 py-2 rounded-2xl font-bold">
                  +{result.points} pts
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">How to Recycle</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{result.howToRecycle}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl">
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Impact</p>
                  <p className="text-emerald-800 text-sm leading-relaxed">{result.impact}</p>
                </div>
                {result.deliveryMethod && (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Recommended Delivery Method</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <p className="text-blue-800 text-sm font-semibold">{result.deliveryMethod}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Complete</p>
                    <p className="text-sm font-medium">Points added to your wallet</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-400">+{result.points}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Points</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setImage(null); setResult(null); }}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-[0.98]"
              >
                Scan Another Item
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

const RankSection = ({ user }: { user: UserData }) => {
  const currentLevel = ECO_LEVELS.find(l => user.points >= l.min && user.points <= l.max) || ECO_LEVELS[0];
  const progress = Math.min(100, (user.points / (currentLevel.max === Infinity ? 1000 : currentLevel.max)) * 100);

  const leaderboard = [
    { name: 'Mythili', points: 450, level: 'Green Champion' },
    { name: 'Deepika', points: 380, level: 'Green Champion' },
    { name: 'Logapriya', points: 310, level: 'Green Champion' },
    { name: 'You', points: user.points, level: user.level, isUser: true },
    { name: 'Manopriya', points: 95, level: 'Recycler' },
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Current Level</p>
            <h3 className="text-2xl font-bold text-emerald-600">{user.level}</h3>
          </div>
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <Trophy size={32} />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-500">{user.points} pts</span>
            <span className="text-emerald-600">{currentLevel.max === Infinity ? 'MAX' : `${currentLevel.max} pts`}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-lg">Leaderboard</h3>
        <div className="space-y-2">
          {leaderboard.map((player, idx) => (
            <div 
              key={player.name} 
              className={cn(
                "p-4 rounded-2xl flex items-center justify-between transition-all",
                player.isUser ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-[1.02]" : "bg-white border border-slate-100"
              )}
            >
              <div className="flex items-center gap-4">
                <span className={cn("font-bold text-lg w-6", player.isUser ? "text-emerald-100" : "text-slate-300")}>
                  {idx + 1}
                </span>
                <div>
                  <p className="font-bold">{player.name}</p>
                  <p className={cn("text-xs", player.isUser ? "text-emerald-100" : "text-slate-400")}>{player.level}</p>
                </div>
              </div>
              <div className="font-bold">{player.points} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StoreSection = ({ points }: { points: number }) => {
  const products = [
    { id: 1, name: 'Reusable Cotton Bag', price: 50, img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400' },
    { id: 2, name: 'Bamboo Toothbrush', price: 30, img: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=400' },
    { id: 3, name: 'Steel Water Bottle', price: 120, img: 'https://images.unsplash.com/photo-1602143393494-721d002d3502?auto=format&fit=crop&q=80&w=400' },
    { id: 4, name: 'Compost Bin', price: 200, img: 'https://images.unsplash.com/photo-1591193113735-5260d2392658?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Eco Store</h2>
        <div className="bg-emerald-50 px-3 py-1 rounded-full text-emerald-600 font-bold text-sm">
          {points} available
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col">
            <div className="aspect-square relative">
              <img src={product.img} className="w-full h-full object-cover" alt={product.name} />
            </div>
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm leading-tight">{product.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <Zap size={12} className="text-emerald-600 fill-emerald-600" />
                  <span className="text-emerald-600 font-bold text-sm">{product.price} pts</span>
                </div>
              </div>
              <button 
                disabled={points < product.price}
                className={cn(
                  "w-full py-2 rounded-xl text-xs font-bold transition-colors",
                  points >= product.price ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                )}
              >
                Redeem
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileSection = ({ user, onLogout, onUpdateAvatar }: { user: UserData, onLogout: () => void, onUpdateAvatar: (url: string) => void }) => {
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-emerald-100 p-1 overflow-hidden">
            <img 
              src={user.avatar} 
              className="w-full h-full rounded-full bg-emerald-50 object-cover" 
              alt="Avatar" 
            />
          </div>
          <button 
            onClick={() => setIsPickingAvatar(true)}
            className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full border-4 border-white hover:bg-emerald-700 transition-colors shadow-lg"
          >
            <Camera size={16} />
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
          <p className="text-slate-500">{user.email}</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full font-bold text-sm">
          <Trophy size={16} />
          {user.level}
        </div>
      </div>

      <AnimatePresence>
        {isPickingAvatar && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[32px] p-6 shadow-xl border border-emerald-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Choose Profile Image</h3>
              <button onClick={() => setIsPickingAvatar(false)} className="text-slate-400 hover:text-slate-600">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_OPTIONS.map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => {
                    onUpdateAvatar(opt.url);
                    setIsPickingAvatar(false);
                  }}
                  className={cn(
                    "aspect-square rounded-2xl overflow-hidden border-2 transition-all",
                    user.avatar === opt.url ? "border-emerald-500 scale-105 shadow-md" : "border-transparent hover:border-emerald-200"
                  )}
                >
                  <img src={opt.url} className="w-full h-full object-cover" alt={opt.category} referrerPolicy="no-referrer" />
                </button>
              ))}
              <button 
                onClick={() => {
                  onUpdateAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`);
                  setIsPickingAvatar(false);
                }}
                className="aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <Plus size={20} />
                <span className="text-[8px] font-bold uppercase">Random</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
        <button 
          onClick={async () => {
            if (window.aistudio) {
              await window.aistudio.openSelectKey();
            }
          }}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors text-amber-600">
              <Zap size={20} />
            </div>
            <span className="font-bold text-slate-700">Gemini API Settings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Quota Fix</span>
            <ChevronRight size={20} className="text-slate-300" />
          </div>
        </button>
        <ProfileLink icon={<User size={20} />} label="Edit Profile" />
        <ProfileLink icon={<AlertCircle size={20} />} label="Help & Support" />
        <ProfileLink icon={<ShoppingBag size={20} />} label="My Rewards" />
        <button 
          onClick={onLogout}
          className="w-full p-5 flex items-center justify-between hover:bg-red-50 transition-colors text-red-500 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
              <LogOut size={20} />
            </div>
            <span className="font-bold">Logout</span>
          </div>
          <ChevronRight size={20} className="text-red-200" />
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">EcoSort AI v1.0.0</p>
      </div>
    </div>
  );
};

const ProfileLink = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
    <div className="flex items-center gap-4">
      <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors text-slate-600">
        {icon}
      </div>
      <span className="font-bold text-slate-700">{label}</span>
    </div>
    <ChevronRight size={20} className="text-slate-300" />
  </button>
);

const BanksSection = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setLoading(true);
        // Try to get user location
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const data = await findNearbyBanks(pos.coords.latitude, pos.coords.longitude);
            setBanks(data.banks);
            setLoading(false);
          },
          async () => {
            // Fallback if geolocation fails
            const data = await findNearbyBanks();
            setBanks(data.banks);
            setLoading(false);
          }
        );
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to find nearby banks.");
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Nearby Trash Banks</h2>
        <p className="text-slate-500">Find the closest recycling centers</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
          <p className="font-bold text-slate-400">Locating Banks...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-3xl text-center space-y-4 border border-red-100">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <p className="text-red-600 font-bold text-sm">{error}</p>
          {error.includes("Quota exceeded") && (
            <button 
              onClick={async () => {
                if (window.aistudio) {
                  await window.aistudio.openSelectKey();
                  setError(null);
                  window.location.reload(); // Reload to retry
                }
              }}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
            >
              Set API Key & Retry
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mock Visual Map */}
          <div className="aspect-video w-full bg-slate-100 rounded-[32px] border border-slate-200 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            {banks.map((bank, i) => (
              <motion.div 
                key={bank.name}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="absolute"
                style={{ 
                  left: `${20 + (i * 15)}%`, 
                  top: `${30 + (Math.sin(i) * 20)}%` 
                }}
              >
                <div className="relative group">
                  <div className="bg-emerald-500 p-2 rounded-full text-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <MapPin size={16} />
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {bank.name}
                  </div>
                </div>
              </motion.div>
            ))}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_0_8px_rgba(59,130,246,0.2)]" />
            </div>
          </div>

          <div className="space-y-3">
            {banks.map((bank, i) => (
              <motion.div 
                key={bank.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <MapPin size={18} />
                  </div>
                  <div className="max-w-[200px]">
                    <p className="font-bold text-slate-800 truncate">{bank.name}</p>
                    <p className="text-xs text-slate-400 truncate">{bank.address}</p>
                  </div>
                </div>
                {bank.url && (
                  <a 
                    href={bank.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                  >
                    <ChevronRight size={20} />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const PickupSection = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState(5);
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <button onClick={onComplete} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronRight className="rotate-180 text-slate-400" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Schedule Pickup</h2>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= i ? "bg-emerald-500" : "bg-slate-200")} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                <Weight size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">Waste Weight</h3>
                <p className="text-sm text-slate-500">Minimum 5kg required for pickup</p>
              </div>
              
              <div className="flex items-center justify-center gap-8">
                <button 
                  onClick={() => setWeight(w => Math.max(5, w - 1))}
                  className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="text-5xl font-black text-slate-800">{weight}</span>
                  <span className="text-xl font-bold text-slate-400 ml-1">kg</span>
                </div>
                <button 
                  onClick={() => setWeight(w => w + 1)}
                  className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                >
                  +
                </button>
              </div>

              {weight < 5 && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 justify-center">
                  <AlertCircle size={14} />
                  Minimum 5kg required
                </div>
              )}
            </div>
            <button 
              disabled={weight < 5}
              onClick={nextStep}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="text-emerald-600" size={20} />
                Select Pickup Day
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {days.map(day => (
                  <button 
                    key={day}
                    onClick={() => setDate(day)}
                    className={cn(
                      "p-4 rounded-2xl border-2 text-left font-bold transition-all",
                      date === day ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-white text-slate-600 hover:border-emerald-200"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Back</button>
              <button 
                disabled={!date}
                onClick={nextStep}
                className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="text-emerald-600" size={20} />
                  Pickup Address
                </h3>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address..."
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none min-h-[100px] transition-all"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Phone className="text-emerald-600" size={20} />
                  Contact Information
                </h3>
                <input 
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Phone number..."
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Back</button>
              <button 
                disabled={!address || !contact}
                onClick={nextStep}
                className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                Schedule Now
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-12"
          >
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-xl shadow-emerald-100">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-800">Scheduled!</h3>
              <p className="text-slate-500">Our team will arrive on <span className="font-bold text-emerald-600">{date}</span></p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Weight:</span>
                <span className="font-bold text-slate-800">{weight}kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Address:</span>
                <span className="font-bold text-slate-800 text-right max-w-[150px] truncate">{address}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Contact:</span>
                <span className="font-bold text-slate-800">{contact}</span>
              </div>
            </div>
            <button 
              onClick={onComplete}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
