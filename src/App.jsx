import React, { useState, useEffect } from 'react';
import { Zap, Terminal, Activity, Radar, Play, CheckCircle, XCircle } from 'lucide-react';

const AutonomousEngine = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [trends, setTrends] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [systemLogs, setSystemLogs] = useState([
    { time: new Date().toLocaleTimeString('id-ID'), msg: '✅ Ghost Engine siap mengudara.', type: 'info' }
  ]);

  const addLog = (message, type = 'info') => {
    setSystemLogs(prev => [{ time: new Date().toLocaleTimeString('id-ID'), msg: message, type }, ...prev].slice(0, 50));
  };

  // 1. Fungsi Menangkap Video Viral
  const scanViralTrends = async () => {
    setIsScanning(true);
    addLog('📡 Menyalakan Radar. Memindai algoritma YouTube & TikTok...', 'warn');
    
    try {
      const response = await fetch('/api/scan');
      const result = await response.json();
      
      if (result.ok) {
        setTrends(result.data);
        addLog(`✅ Ditemukan ${result.data.length} video dengan Velocity tinggi.`, 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      addLog(`❌ Gagal membaca radar: ${error.message}`, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  // 2. Fungsi Injeksi Distribusi (Otomatis potong 60s, 9:16, + watermark)
  const executePipeline = async (video) => {
    setProcessingId(video.id);
    addLog(`⚙️ MEMULAI PIPELINE: ${video.title} (Source: @${video.sourceUsername})`, 'warn');
    addLog(`🎬 Meneruskan ke FFmpeg (Crop 9:16, <60s, Placeholder watermark)...`, 'info');

    try {
      const response = await fetch('/api/force-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawVideoUrl: video.rawVideoUrl,
          sourceUsername: video.sourceUsername,
          title: video.title
        })
      });

      if (response.ok) {
        addLog(`✅ Pipeline sukses! MP4 telah di-render dan ditembakkan ke YouTube/Meta via HTTP Spoofing.`, 'success');
        // Tandai selesai di UI
        setTrends(prev => prev.map(t => t.id === video.id ? { ...t, status: 'DONE' } : t));
      } else {
        throw new Error(`Server menolak request (${response.status})`);
      }
    } catch (error) {
      addLog(`❌ Pipeline Gagal: ${error.message}`, 'error');
      setTrends(prev => prev.map(t => t.id === video.id ? { ...t, status: 'FAILED' } : t));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 p-6 font-mono text-sm">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Zap className="text-yellow-500 w-6 h-6" /> Ghost Distribution Engine
            </h1>
            <p className="text-slate-400 mt-1">Autonomous Discovery & In-Memory Transcoding</p>
          </div>
          <button 
            onClick={scanViralTrends}
            disabled={isScanning || processingId !== null}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
              isScanning 
                ? 'bg-amber-500/20 text-amber-500 cursor-not-allowed border border-amber-500/50' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
            }`}
          >
            {isScanning ? (
              <><Activity className="w-5 h-5 animate-pulse" /> SCANNING ALGORITHM...</>
            ) : (
              <><Radar className="w-5 h-5" /> SCAN VIRAL TRENDS</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KIRI: Viral Radar Results */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-green-500" /> Discovered Targets
            </h2>
            
            {trends.length === 0 && !isScanning && (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-10 text-center text-slate-500">
                Belum ada data. Klik "SCAN VIRAL TRENDS" untuk memindai FYP/Trending.
              </div>
            )}

            {trends.map(video => (
              <div key={video.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700 transition-all">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-emerald-500/20">
                      Score: {video.viralityScore}
                    </span>
                    <span className="text-slate-500 text-xs">| {video.platform}</span>
                  </div>
                  <h3 className="text-white font-bold text-base leading-tight mb-1">{video.title}</h3>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    Source Placeholder: <span className="text-blue-400 font-semibold">@{video.sourceUsername}</span>
                  </p>
                </div>
                
                <div className="shrink-0 w-full md:w-auto">
                  {video.status === 'DONE' ? (
                    <div className="flex items-center gap-2 text-green-500 font-bold px-4 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                      <CheckCircle className="w-5 h-5" /> INJECTED
                    </div>
                  ) : video.status === 'FAILED' ? (
                    <div className="flex items-center gap-2 text-red-500 font-bold px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
                      <XCircle className="w-5 h-5" /> FAILED
                    </div>
                  ) : (
                    <button 
                      onClick={() => executePipeline(video)}
                      disabled={processingId !== null}
                      className={`w-full md:w-auto px-5 py-2.5 rounded-lg font-bold flex justify-center items-center gap-2 transition-all ${
                        processingId === video.id
                          ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 cursor-wait'
                          : processingId !== null
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-100 hover:bg-white text-slate-900 shadow-lg'
                      }`}
                    >
                      {processingId === video.id ? (
                        <><Activity className="w-4 h-4 animate-spin" /> PROCESSING...</>
                      ) : (
                        <><Play className="w-4 h-4" /> EXECUTE</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* KANAN: Real-time Terminal */}
          <div className="bg-[#050505] rounded-xl p-5 border border-slate-800 h-[600px] flex flex-col">
            <h2 className="text-slate-500 mb-4 pb-2 border-b border-slate-800 flex justify-between">
              <span>SYSTEM_LOGS</span>
              <span>{systemLogs.length} entries</span>
            </h2>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
              {systemLogs.map((log, i) => (
                <div key={i} className="flex gap-3 py-1 border-b border-slate-800/40 last:border-0">
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
