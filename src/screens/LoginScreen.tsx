import React, { useState, useEffect } from 'react';
import {
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Server,
  RefreshCw,
  CheckCircle2,
  Settings,
  X,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { ShopMasterLogo } from '../components/ShopMasterLogo';
import { getApiBaseUrl, setCustomApiUrl, resolveApiUrl } from '../services/api';

export const LoginScreen: React.FC = () => {
  const { loginWithCredentials, suspendedAlertMessage, sessionNoticeMessage, setSessionNoticeMessage } = usePos();
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Server health / URL configuration drawer
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [currentBaseUrl, setCurrentBaseUrl] = useState('');
  const [pingStatus, setPingStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');
  const [pingMessage, setPingMessage] = useState('');
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    const activeUrl = getApiBaseUrl();
    setCurrentBaseUrl(activeUrl);
    setCustomUrlInput(activeUrl);
  }, []);

  const handleTestConnection = async (targetUrl?: string) => {
    setPingStatus('checking');
    setPingMessage('সার্ভারে পিং পাঠানো হচ্ছে...');
    const urlToTest = (targetUrl !== undefined ? targetUrl : customUrlInput).trim();
    const endpoint = urlToTest ? `${urlToTest.replace(/\/$/, '')}/api/health` : resolveApiUrl('/api/health');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setPingStatus('online');
        setPingMessage(`সার্ভার সচল আছে! (${data.service || 'ShopPOS Backend OK'})`);
        setIsWakingUp(false);
      } else {
        setPingStatus('offline');
        setPingMessage(`সার্ভার রেসপন্স কোড: ${res.status}`);
      }
    } catch (err: any) {
      setPingStatus('offline');
      if (err?.name === 'AbortError') {
        setPingMessage('টাইমআউট হয়েছে। Render Free Tier সার্ভার ওয়েক-আপ হতে পারে (~40s)।');
      } else {
        setPingMessage('সংযোগ করা যায়নি। URL সঠিক কিনা বা ব্যাকএন্ড ডিপ্লয় হয়েছে কিনা যাচাই করুন।');
      }
    }
  };

  const handleSaveCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    setCustomApiUrl(trimmed);
    const newBase = getApiBaseUrl();
    setCurrentBaseUrl(newBase);
    handleTestConnection(trimmed);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSessionNoticeMessage(null);
    setIsWakingUp(false);

    const cleanNum = number.trim();
    if (!cleanNum) {
      setError('Please enter your mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await loginWithCredentials({ number: cleanNum, password });
    } catch (err: any) {
      const rawMsg = err?.message || 'Invalid mobile number or password.';
      const isNetworkErr =
        rawMsg.toLowerCase().includes('failed to fetch') ||
        rawMsg.toLowerCase().includes('networkerror') ||
        rawMsg.toLowerCase().includes('network request failed');

      if (isNetworkErr) {
        setIsWakingUp(true);
        setError(
          'সার্ভারের সাথে সংযোগ করা সম্ভব হয়নি (Failed to fetch)। Render Free Tier ব্যাকএন্ড স্লিপ মোডে থাকতে পারে অথবা ব্যাকএন্ড URL মিসিং।'
        );
        handleTestConnection();
      } else {
        setError(rawMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 selection:bg-blue-100 selection:text-blue-900 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand logo & title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center mx-auto shadow-md shadow-blue-500/10 p-2">
            <ShopMasterLogo size={52} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              ShopPOS
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cloud POS & Store Management
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {suspendedAlertMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-rose-900">Account Suspended</p>
                <p className="mt-0.5 text-rose-700 leading-relaxed">{suspendedAlertMessage}</p>
              </div>
            </div>
          )}

          {sessionNoticeMessage && !suspendedAlertMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Session Notice</p>
                <p className="mt-0.5 text-amber-700 leading-relaxed">{sessionNoticeMessage}</p>
              </div>
            </div>
          )}

          {error && !suspendedAlertMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
              {isWakingUp && (
                <div className="pt-1 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-rose-800 font-semibold">Render Free Tier সার্ভার?</span>
                  <button
                    type="button"
                    onClick={() => setShowServerConfig(true)}
                    className="text-blue-700 font-bold underline hover:text-blue-900 cursor-pointer"
                  >
                    সার্ভার লিংক সেট করুন
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoFocus
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Logging in...</span>
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Collapsible Server Settings */}
        <div className="pt-2 border-t border-slate-100">
          {!showServerConfig ? (
            <button
              type="button"
              onClick={() => setShowServerConfig(true)}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-blue-600 transition-colors py-1 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Backend Server Connection Settings</span>
            </button>
          ) : (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-150 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Server className="w-3.5 h-3.5 text-blue-600" />
                  <span>Backend Server URL</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowServerConfig(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Render-এ ডিপ্লয় করার পর আপনার ব্যাকএন্ড Web Service-এর URL দিন (যেমন:{' '}
                <span className="font-mono text-blue-600">https://shop-pos-backend.onrender.com</span>):
              </p>

              <div className="space-y-1.5">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://your-backend.onrender.com"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCustomUrl}
                    className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer transition-colors"
                  >
                    Save & Connect
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestConnection()}
                    disabled={pingStatus === 'checking'}
                    className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${pingStatus === 'checking' ? 'animate-spin' : ''}`} />
                    <span>Ping Test</span>
                  </button>
                </div>
              </div>

              {/* Ping Result Status */}
              {pingStatus !== 'idle' && (
                <div
                  className={`p-2.5 rounded-xl text-[11px] font-medium flex items-start gap-1.5 ${
                    pingStatus === 'online'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : pingStatus === 'checking'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {pingStatus === 'online' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                  {pingStatus === 'checking' && <RefreshCw className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5 animate-spin" />}
                  {pingStatus === 'offline' && <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                  <span className="leading-tight">{pingMessage}</span>
                </div>
              )}

              <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                <span>Active Target: {currentBaseUrl || '(Same-Origin / Relative)'}</span>
                {currentBaseUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomApiUrl(null);
                      setCustomUrlInput('');
                      setCurrentBaseUrl('');
                      setPingStatus('idle');
                    }}
                    className="text-rose-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
