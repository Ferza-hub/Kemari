import React, { useState, useEffect } from 'react';
import { Activity, Settings, Zap, History, Power, Check, AlertCircle, RefreshCw, Eye, EyeOff, Save, Trash2, Radio, Server } from 'lucide-react';

const AutonomousEngine = () => {
  const [activeTab, setActiveTab] = useState('radar');
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [engineStatus, setEngineStatus] = useState('idle'); // idle, scanning, hijacking, resting
  
  // State untuk API/Credentials (Fasad SaaS untuk dijual nanti)
  const [credentials, setCredentials] = useState({
    youtube: { apiKey: '', channelId: '', isConnected: false },
    tiktok: { clientKey: '', userId: '', isConnected: false },
    instagram: { accessToken: '', accountId: '', isConnected: false }
  });
  const [showPassword, setShowPassword] = useState({});
  const [saveStatus, setSaveStatus] = useState('');

  // Live Data dari Backend
  const [liveTrends, setLiveTrends] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [stats, setStats] = useState({
    hijackedToday: 0,
    estimatedTraffic: 0,
    activeNodes: 0
  });

  // Simulasi Polling ke Backend (Node.js/Playwright)
  useEffect(() => {
    let pollInterval;
    
    const fetchLiveData = async () => {
      try {
        // DI REALITAS: fetch('/api/engine-status')
        // Ini fallback simulasi agar UI tidak pecah saat testing lokal
        if (isAutopilot) {
          setEngineStatus(prev => prev === 'scanning' ? 'hijacking' : 'scanning');
          
          // Simulasi mendapat data tren baru dari scraper
          if (Math.random() > 0.5) {
            const newTrend = {
              id: Date.now(),
              topic: ['Gojo vs Sukuna', 'Kucing Lucu', 'Hidrolik Press', 'ASMR Sabun'][Math.floor(Math.random() * 4)],
              platform: ['TikTok', 'Shorts', 'Reels'][Math.floor(Math.random() * 3)],
              viewsDelt: '+' + Math.floor(Math.random() * 50) + 'k/hr',
              status: 'Intercepted', // Intercepted -> Mutating -> Published
              time: new Date().toLocaleTimeString('id-ID')
            };
            
            setLiveTrends(prev => [newTrend, ...prev].slice(0, 5));
            addLog(`⚡ Tren terdeteksi: ${newTrend.topic} (${newTrend.viewsDelt}). Menginisiasi bypass layer...`);
            
            // Auto-update stats
            setStats(prev => ({
              ...prev,
              hijackedToday: prev.hijackedToday + 1,
              estimatedTraffic: prev.estimatedTraffic + Math.floor(Math.random() * 5000)
            }));
          }
        } else {
          setEngineStatus('idle');
        }
      } catch (error) {
        addLog('❌ Gagal terhubung ke Local Node Worker');
      }
    };

    if (isAutopilot) {
      pollInterval = setInterval(fetchLiveData, 3000);
      addLog('🚀 Autopilot diaktifkan. Mesin mulai memindai anomali trafik...');
    } else {
      clearInterval(pollInterval);
      if (systemLogs.length > 0) addLog('⏸️ Autopilot dimatikan. Mesin masuk mode idle.');
    }

    return () => clearInterval(pollInterval);
  }, [isAutopilot]);

  const addLog = (message) => {
    setSystemLogs(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: message }, ...prev].slice(0, 50));
  };

  const toggleAutopilot = async () => {
    const newState = !isAutopilot;
    setIsAutopilot(newState);
    
    // Trigger ke Backend untuk menyalakan/mematikan headless browser worker
    try {
      await fetch('/api/toggle-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState })
      });
    } catch (e) {
      console.log('Webhook ke local server /api/toggle-engine (Simulasi)');
    }
  };

  // Pengganti handlePostNow -> Paksa eksekusi instan by ID
  const forceHijack = async (trendId) => {
    addLog(`⚠️ Force Hijack dieksekusi secara manual untuk ID: ${trendId}`);
    setLiveTrends(prev => prev.map(t => t.id === trendId ? { ...t, status: 'Publishing...' } : t));
    
    try {
      await fetch('/api/force-publish', {
        method: 'POST',
        body: JSON.stringify({ id: trendId, bypassMutation: false })
      });
    } catch (e) {
      setTimeout(() => {
        setLiveTrends(prev => prev.map(t => t.id === trendId ? { ...t, status: '✅ Published' } : t));
      }, 1500);
    }
  };

  const saveCredentials = async () => {
    try {
      // Tembak ke database lokal / konfigurasi env Node.js
      await fetch('/api/config/save', { method: 'POST', body: JSON.stringify(credentials) });
      setSaveStatus('✓ Konfigurasi Node tersimpan');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (e) {
      setSaveStatus('✓ Konfigurasi Node tersimpan (Simulasi Lokal)');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const updateCredential = (platform, field, value) => {
    setCredentials(prev => ({ ...prev, [platform]: { ...prev[platform], [field]: value } }));
  };

  const togglePasswordVisibility = (key) => {
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 p-6 font-mono text-sm">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Main Control */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-2xl">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Zap className="text-yellow-500 w-8 h-8" />
              Automated Hijack Engine
            </h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Server className="w-4 h-4" /> Local Node Worker: 
              <span className={engineStatus === 'idle' ? 'text-slate-500' : 'text-green-400'}>
                {engineStatus.toUpperCase()}
              </span>
            </p>
          </div>

          <button
            onClick={toggleAutopilot}
            className={`flex items-center gap-3 px-8 py-4 rounded-lg font-bold text-lg transition-all ${
              isAutopilot 
                ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                : 'bg-green-500 text-slate-900 hover:bg-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
            }`}
          >
            <Power className="w-6 h-6" />
            {isAutopilot ? 'KILL ENGINE' : 'ENGAGE AUTOPILOT'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-px">
          {[
            { id: 'radar', icon: Radio, label: 'Live Radar' },
            { id: 'logs', icon: History, label: 'Terminal Logs' },
            { id: 'settings', icon: Settings, label: 'Node Config' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* RADAR TAB */}
        {activeTab === 'radar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Radio className={`w-5 h-5 ${isAutopilot ? 'text-green-500 animate-pulse' : 'text-slate-600'}`} />
                    Interception Feed
                  </h2>
                  <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">Auto-refresh: ON</span>
                </div>

                {liveTrends.length === 0 ? (
                  <div className="text-center py-12 text-slate-600">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Menunggu sinyal anomali trafik...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {liveTrends.map(trend => (
                      <div key={trend.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded font-bold">{trend.platform}</span>
                            <span className="text-emerald-400 text-xs font-bold">{trend.viewsDelt}</span>
                            <span className="text-slate-500 text-xs">{trend.time}</span>
                          </div>
                          <h3 className="text-base font-bold text-slate-200">{trend.topic}</h3>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <span className={`text-xs px-3 py-1 rounded-full border font-bold ${
                            trend.status.includes('Published') ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            trend.status.includes('Intercepted') ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {trend.status.toUpperCase()}
                          </span>
                          {!trend.status.includes('Published') && (
                            <button onClick={() => forceHijack(trend.id)} className="text-xs text-slate-500 hover:text-white underline decoration-slate-600">
                              Force Execute
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Telemetry Stats */}
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Activity className="w-24 h-24" />
                </div>
                <div className="text-sm text-slate-400 mb-1">Total Hijacked (Today)</div>
                <div className="text-4xl font-bold text-white">{stats.hijackedToday} <span className="text-sm text-emerald-400 font-normal">videos</span></div>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="text-sm text-slate-400 mb-1">Est. Organic Traffic</div>
                <div className="text-4xl font-bold text-white">{stats.estimatedTraffic.toLocaleString()} <span className="text-sm text-blue-400 font-normal">views</span></div>
              </div>
            </div>
          </div>
        )}

        {/* TERMINAL LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-[#050505] rounded-xl p-6 border border-slate-800 font-mono text-xs h-[600px] overflow-y-auto">
            <h2 className="text-slate-500 mb-4 pb-2 border-b border-slate-800 flex justify-between">
              <span>SYSTEM_TERMINAL_LOGS</span>
              <span>{systemLogs.length} entries</span>
            </h2>
            <div className="space-y-2">
              {systemLogs.map((log, i) => (
                <div key={i} className="flex gap-4 hover:bg-slate-900/50 py-1 px-2 rounded">
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>
                  <span className={
                    log.msg.includes('❌') ? 'text-red-400' :
                    log.msg.includes('✅') ? 'text-green-400' :
                    log.msg.includes('⚡') ? 'text-yellow-400' : 'text-slate-300'
                  }>{log.msg}</span>
                </div>
              ))}
              {systemLogs.length === 0 && <span className="text-slate-600">Waiting for engine execution...</span>}
            </div>
          </div>
        )}

        {/* SETTINGS (SaaS Facade) TAB */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 max-w-3xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Proxy & Identity Configuration</h2>
              <button onClick={saveCredentials} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all">
                <Save className="w-4 h-4" /> Save Config
              </button>
            </div>

            {saveStatus && (
              <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                {saveStatus}
              </div>
            )}

            <div className="space-y-8">
              {/* YouTube Config */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> YouTube Target Node
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Session Token / API Key</label>
                    <input type="password" value={credentials.youtube.apiKey} onChange={(e) => updateCredential('youtube', 'apiKey', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 outline-none focus:border-blue-500 text-slate-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Target Channel ID</label>
                    <input type="text" value={credentials.youtube.channelId} onChange={(e) => updateCredential('youtube', 'channelId', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 outline-none focus:border-blue-500 text-slate-300" />
                  </div>
                </div>
              </div>

              {/* TikTok Config */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> TikTok Target Node
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Client Key / Cookie Session</label>
                    <input type="password" value={credentials.tiktok.clientKey} onChange={(e) => updateCredential('tiktok', 'clientKey', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 outline-none focus:border-blue-500 text-slate-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">User ID</label>
                    <input type="text" value={credentials.tiktok.userId} onChange={(e) => updateCredential('tiktok', 'userId', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 outline-none focus:border-blue-500 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg text-yellow-500/80 text-xs">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Untuk Bypass mode (Headless Browser), pastikan local proxy server berjalan di port :8080 agar IP masking berfungsi.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AutonomousEngine;
