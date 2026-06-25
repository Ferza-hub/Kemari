import React, { useState } from 'react';
import { Zap, Terminal, Server, Send, AlertTriangle, FileVideo, User, Type, Activity } from 'lucide-react';

const AutonomousEngine = () => {
  const [activeTab, setActiveTab] = useState('injection');
  
  // State Input Form Asli
  const [payload, setPayload] = useState({
    rawVideoUrl: '',
    sourceUsername: '',
    title: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [systemLogs, setSystemLogs] = useState([
    { time: new Date().toLocaleTimeString('id-ID'), msg: '✅ UI Berhasil terhubung. Menunggu instruksi manual...', type: 'info' }
  ]);

  const addLog = (message, type = 'info') => {
    setSystemLogs(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: message, type }, ...prev].slice(0, 50));
  };

  const handleInputChange = (e) => {
    setPayload({ ...payload, [e.target.name]: e.target.value });
  };

  // Eksekusi Nyata ke Backend Fly.io
  const executeInjection = async (e) => {
    e.preventDefault();
    
    if (!payload.rawVideoUrl || !payload.sourceUsername || !payload.title) {
      addLog('❌ Parameter tidak lengkap. Isi URL, Username, dan Title.', 'error');
      return;
    }

    setIsProcessing(true);
    addLog(`⚠️ MEMULAI INJEKSI: ${payload.title}`, 'warn');
    addLog(`📡 Mengirim payload ke Server Node.js...`, 'info');

    try {
      const response = await fetch('/api/force-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        addLog(`✅ Server merespon! Proses Transcoding & HTTP Spoofing sedang berjalan di latar belakang.`, 'success');
        // Reset form setelah berhasil dikirim
        setPayload({ rawVideoUrl: '', sourceUsername: '', title: '' });
      } else {
        addLog(`❌ Server menolak request (Status: ${response.status})`, 'error');
      }
    } catch (error) {
      addLog(`❌ Gagal menghubungi API (Cek koneksi/port server): ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 p-6 font-mono text-sm">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-2xl">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Zap className="text-yellow-500 w-8 h-8" />
              Ghost Distribution Engine
            </h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Server className="w-4 h-4" /> Mode HTTP Spoofing & In-Memory Transcoding: 
              <span className="text-green-400">AKTIF</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg">
            <Activity className={`w-5 h-5 ${isProcessing ? 'text-yellow-500 animate-pulse' : 'text-slate-500'}`} />
            <span className={isProcessing ? 'text-yellow-500 font-bold' : 'text-slate-500'}>
              {isProcessing ? 'ENGINE RUNNING...' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-px">
          <button
            onClick={() => setActiveTab('injection')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'injection' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Send className="w-4 h-4" />
            MANUAL INJECTION
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'logs' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Terminal className="w-4 h-4" />
            SERVER LOGS
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* BAGIAN KIRI: Form Input (Hanya tampil di tab injection) */}
          {activeTab === 'injection' && (
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Target Payload
                </h2>

                <form onSubmit={executeInjection} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-2">
                      <FileVideo className="w-4 h-4" /> Raw Video URL (.mp4)
                    </label>
                    <input 
                      type="url" 
                      name="rawVideoUrl"
                      value={payload.rawVideoUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/video-mentah.mp4" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 outline-none focus:border-blue-500 text-slate-200 transition-all placeholder:text-slate-700"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-2">
                        <User className="w-4 h-4" /> Source Username
                      </label>
                      <input 
                        type="text" 
                        name="sourceUsername"
                        value={payload.sourceUsername}
                        onChange={handleInputChange}
                        placeholder="viral_indo" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 outline-none focus:border-blue-500 text-slate-200 transition-all placeholder:text-slate-700"
                        disabled={isProcessing}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-2">
                        <Type className="w-4 h-4" /> Video Title
                      </label>
                      <input 
                        type="text" 
                        name="title"
                        value={payload.title}
                        onChange={handleInputChange}
                        placeholder="Must watch! 🔥" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 outline-none focus:border-blue-500 text-slate-200 transition-all placeholder:text-slate-700"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <button 
                      type="submit" 
                      disabled={isProcessing}
                      className={`w-full py-4 rounded-lg font-bold text-lg flex justify-center items-center gap-2 transition-all ${
                        isProcessing 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                      }`}
                    >
                      {isProcessing ? (
                        <><Activity className="w-6 h-6 animate-spin" /> EXECUTING PAYLOAD...</>
                      ) : (
                        <><Send className="w-6 h-6" /> FIRE INJECTION</>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3 text-yellow-500/80 text-xs">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>Memastikan URL video mengarah langsung ke file media mentah. Engine akan memotong durasi hingga 59 detik dan merubah rasio ke 9:16 secara otomatis di latar belakang.</p>
                </div>
              </div>
            </div>
          )}

          {/* BAGIAN KANAN / TAB LOGS: Terminal Output */}
          <div className={`bg-[#050505] rounded-xl p-6 border border-slate-800 font-mono text-xs h-[600px] overflow-y-auto flex flex-col ${activeTab === 'logs' ? 'col-span-3' : 'col-span-1'}`}>
            <h2 className="text-slate-500 mb-4 pb-2 border-b border-slate-800 flex justify-between shrink-0">
              <span>LOCAL_TERMINAL</span>
              <span>{systemLogs.length} entries</span>
            </h2>
            <div className="space-y-2 flex-grow overflow-y-auto pr-2">
              {systemLogs.map((log, i) => (
                <div key={i} className="flex gap-3 py-1 border-b border-slate-800/50 last:border-0">
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>
                  <span className={`break-words ${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warn' ? 'text-yellow-400' : 
                    'text-slate-300'
                  }`}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AutonomousEngine;
