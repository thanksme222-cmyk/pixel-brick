"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic"; // 1. Import dynamic

// 2. Load VoxelCanvas dynamically with SSR disabled
const VoxelCanvas = dynamic(() => import("~/components/VoxelCanvas"), { 
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-[#004643]">
      Initializing Engine...
    </div>
  )
});

const PRESET_COLORS = [
  { name: "Cyprus", hex: "#004643" },
  { name: "Brick", hex: "#b91c1c" },
  { name: "Sand", hex: "#F0EDE5" },
  { name: "Slate", hex: "#334155" },
];

const SHAPES = [
  { id: "box", label: "Cube" },
  { id: "sphere", label: "Sphere" },
  { id: "cylinder", label: "Cylinder" },
] as const; // Added 'as const' for better type safety

export default function HomePage() {
  const voxelRef = useRef<any>(null);
  
  const [brightness, setBrightness] = useState(1.5);
  const [scale, setScale] = useState(1.0);
  const [rotationSpeed, setRotationSpeed] = useState(0);
  const [color, setColor] = useState("#004643");
  const [shape, setShape] = useState<"box" | "sphere" | "cylinder">("box");
  const [textureUrl, setTextureUrl] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up old object URLs to prevent memory leaks
      if (textureUrl) URL.revokeObjectURL(textureUrl);
      const url = URL.createObjectURL(file);
      setTextureUrl(url);
    }
  };

  const handleAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAiAnalysis(`AI Diagnostic: Kinetic state ${rotationSpeed > 0 ? "Active" : "Static"}. Angular velocity: ${rotationSpeed.toFixed(1)} rad/s. Surface mapping confirmed.`);
      setIsAnalyzing(false);
    }, 800);
  };

  const handleSaveImage = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    // Ensure the preserveDrawingBuffer: true is set in VoxelCanvas.tsx for this to work!
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.setAttribute("download", `Studio-Export.png`);
    link.setAttribute("href", image);
    link.click();
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F0EDE5] text-[#004643]">
      <nav className="w-full flex justify-between items-center p-6 bg-white/50 backdrop-blur-md border-b border-[#004643]/10">
        <h1 className="text-2xl font-black tracking-tighter uppercase">Pixel & <span className="text-orange-600">Brick</span></h1>
        <Link href="/api/auth/signin" className="rounded-full bg-[#004643] px-6 py-2 text-sm font-bold text-white hover:bg-[#003330]">Login</Link>
      </nav>

      <div className="container flex flex-col lg:flex-row gap-8 px-4 py-8 flex-1">
        
        {/* VIEWPORT SECTION */}
        <div className="flex-[2] flex flex-col gap-4">
           <div className="relative h-[600px] w-full rounded-2xl border-2 border-[#004643]/20 bg-white shadow-2xl overflow-hidden">
              <VoxelCanvas 
                ref={voxelRef} 
                brightness={brightness} 
                color={color} 
                shape={shape} 
                textureUrl={textureUrl} 
                scale={scale} 
                rotationSpeed={rotationSpeed} 
              />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="bg-[#004643] text-white text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest w-fit">Engine 1.5</span>
                {rotationSpeed > 0 && <span className="bg-orange-600 text-white text-[9px] font-bold px-2 py-1 rounded-sm animate-pulse uppercase">Kinetic Render</span>}
              </div>
           </div>

           <div className="p-6 bg-white rounded-2xl border border-[#004643]/5 shadow-lg">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">AI Diagnostics</h3>
              <p className="text-sm font-medium">{isAnalyzing ? "Processing..." : aiAnalysis || "Ready."}</p>
           </div>
        </div>

        {/* CONTROLS SECTION */}
        <div className="flex-1 flex flex-col gap-6 p-8 bg-white rounded-3xl border border-[#004643]/5 shadow-2xl">
          <h2 className="text-2xl font-black uppercase tracking-tight">Studio Controls</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">1. Shape</label>
                  <select 
                    value={shape}
                    onChange={(e) => setShape(e.target.value as any)} 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-[10px] font-bold outline-none"
                  >
                     {SHAPES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">2. Texture</label>
                  <label className="block w-full text-center bg-slate-50 border border-slate-100 py-3 rounded-xl cursor-pointer text-[10px] font-bold hover:bg-slate-100 transition">
                     <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                     {textureUrl ? "Change" : "Upload"}
                  </label>
               </div>
            </div>

            {/* COLOR PRESETS (Added for better UX) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400">Color Palette</label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((c) => (
                  <button 
                    key={c.hex} 
                    onClick={() => setColor(c.hex)}
                    className={`h-8 w-8 rounded-full border-2 ${color === c.hex ? 'border-orange-600' : 'border-transparent'}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">3. Angular Velocity</label>
                <span className="text-xs font-mono font-bold text-orange-600">{rotationSpeed > 0 ? `${rotationSpeed.toFixed(1)} rad/s` : "Static"}</span>
              </div>
              <input 
                type="range" min="0" max="5" step="0.5" 
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-orange-600"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">4. Object Scale</label>
                <span className="text-xs font-mono font-bold text-[#004643]">{scale.toFixed(1)}m</span>
              </div>
              <input 
                type="range" min="0.2" max="2.5" step="0.1" 
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#004643]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">5. Lux Intensity</label>
                <span className="text-xs font-mono font-bold text-[#004643]">{brightness.toFixed(1)}x</span>
              </div>
              <input 
                type="range" min="0.5" max="4.0" step="0.1" 
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#004643]"
              />
            </div>

            <div className="flex flex-col gap-3 pt-6 border-t">
              <button onClick={handleAiAnalysis} className="w-full py-4 bg-[#004643] text-white text-xs font-bold uppercase rounded-2xl hover:bg-[#003330] transition">Analyze Kinetic Scene</button>
              <button onClick={handleSaveImage} className="w-full py-5 bg-orange-600 text-white text-sm font-black uppercase rounded-2xl shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition">Export Final Frame</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}