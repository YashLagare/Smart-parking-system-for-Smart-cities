'use client';

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SmartCity3D from './components/SmartCity3D';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { 
  Cpu, Zap, Navigation, ShieldCheck, Map, CreditCard, Activity, ArrowRight,
  TrendingUp, Users, DollarSign, Clock, Check, Star, Mail, Globe, Terminal 
} from 'lucide-react';

const CinematicIntro = dynamic(() => import('./components/CinematicIntro'), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [selectedLot, setSelectedLot] = useState('Downtown Smart Arena');
  const [simTime, setSimTime] = useState(14); // 2 PM

  const features = [
    { icon: <Cpu className="w-5 h-5 text-cyber-blue" />, title: "Surge Dynamic Pricing", desc: "Pricing adjusts automatically to balance slot utilization based on real-time occupant density." },
    { icon: <Zap className="w-5 h-5 text-cyber-purple" />, title: "Precision Routing Engine", desc: "Autonomous vehicle coordination navigates drivers to their specific slots with zero search delay." },
    { icon: <ShieldCheck className="w-5 h-5 text-cyber-pink" />, title: "QR Key Verification", desc: "Instantly check in and out at gates using secure time-scoped cryptographically signed QR tickets." },
    { icon: <Map className="w-5 h-5 text-cyber-blue" />, title: "Smart City Heatmap", desc: "City authorities gain detailed maps tracking bottlenecks, traffic speeds, and lot volumes." },
  ];

  const lotsInfo = [
    { name: 'Downtown Smart Arena', basePrice: 5.0 },
    { name: 'Metro Terminal Parking', basePrice: 8.0 },
    { name: 'Tech District Hub', basePrice: 4.0 },
  ];

  const currentLot = lotsInfo.find(l => l.name === selectedLot) || lotsInfo[0];
  const simOccupancy = 0.3 + 0.5 * Math.sin(((simTime - 6) * Math.PI) / 12) * Math.sin(((simTime - 6) * Math.PI) / 12);
  const simPrice = currentLot.basePrice * (1 + simOccupancy * 0.8);

  if (showIntro) {
    return <CinematicIntro onComplete={() => {
      setShowIntro(false);
      router.push('/dashboard');
    }} />;
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <header className="relative w-full max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-grow">
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-ping" />
            <span className="text-[10px] font-bold text-cyber-blue tracking-wider uppercase">Next-Gen SaaS Launch</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Autonomous <span className="bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">Smart City</span> Parking Engine
          </h1>
          
          <p className="text-gray-400 text-sm md:text-base max-w-xl leading-relaxed">
            SmartPark AI orchestrates real-time lot occupancy, predicts busy hours, and uses dynamic surge rates to maximize parking efficiency for drivers and city operators.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-95 text-white font-bold text-xs px-6 py-3 rounded-lg shadow-lg shadow-cyber-blue/20 transition-all group"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#pricing"
              className="bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold text-xs px-6 py-3 rounded-lg transition-all"
            >
              View Enterprise Plans
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
            <div>
              <div className="text-2xl font-bold text-white">84.2%</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Occupancy Target</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyber-blue">-68%</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Search Latency</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyber-purple">+32%</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Operator Yield</div>
            </div>
          </div>
        </div>

        {/* Live Map Canvas Widget */}
        <div className="lg:col-span-6 h-[400px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Simulation Canvas</span>
            <div className="text-[10px] text-cyber-blue">Click Lots on Grid below to configure</div>
          </div>
          <div className="flex-grow h-0">
            <SmartCity3D selectedLotName={selectedLot} onSelectLot={setSelectedLot} />
          </div>
        </div>
      </header>

      {/* AI Predictions & Dynamic Pricing Simulator */}
      <section className="w-full bg-white/[0.01] border-y border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              AI Price Optimizations
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Watch how our dynamic algorithms calculate optimal pricing structures by sliding the time indicator. Rates increase automatically during commute surges and drop during low occupancy to pull drivers off congested streets.
            </p>
            
            <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2">Selected Lot: {selectedLot}</label>
                <div className="flex gap-2">
                  {lotsInfo.map((l) => (
                    <button
                      key={l.name}
                      onClick={() => setSelectedLot(l.name)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        selectedLot === l.name 
                          ? 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue' 
                          : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      {l.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2">
                  <span>Simulate Time: {simTime % 12 || 12} {simTime >= 12 ? 'PM' : 'AM'}</span>
                  <span>{simTime}:00 HRS</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="23" 
                  value={simTime}
                  onChange={(e) => setSimTime(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyber-blue" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest">Base Rate</div>
                  <div className="text-xl font-bold text-white">${currentLot.basePrice.toFixed(2)}/hr</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest text-cyber-blue">Surge Rate</div>
                  <div className="text-xl font-bold text-cyber-blue">${simPrice.toFixed(2)}/hr</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Metrics Visual */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <TrendingUp className="w-12 h-12 text-cyber-blue" />
              </div>
              <h3 className="text-sm font-extrabold text-white">Predictive Capacity</h3>
              <p className="text-gray-400 text-xs mt-2">Analyzes weather, event maps, and calendar databases to foresee occupancy 24 hours in advance.</p>
              <div className="mt-4 flex items-center justify-between text-xs text-cyber-blue font-mono">
                <span>Model: LSTM-Forecaster</span>
                <span>Conf: 94.6%</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <Activity className="w-12 h-12 text-cyber-purple" />
              </div>
              <h3 className="text-sm font-extrabold text-white">Dynamic Pricing Engine</h3>
              <p className="text-gray-400 text-xs mt-2">Adjusts pricing rules continuously inside milliseconds thresholds based on live lot queue depths.</p>
              <div className="mt-4 flex items-center justify-between text-xs text-cyber-purple font-mono">
                <span>Model: RL-Surge</span>
                <span>Latency: 8.4ms</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <Navigation className="w-12 h-12 text-cyber-pink" />
              </div>
              <h3 className="text-sm font-extrabold text-white">Vehicle Flow Router</h3>
              <p className="text-gray-400 text-xs mt-2">Assigns specific slot IDs based on battery capacity, handicap criteria, or proximity to elevator gates.</p>
              <div className="mt-4 flex items-center justify-between text-xs text-cyber-pink font-mono">
                <span>Model: Flow-Allocator</span>
                <span>Optimized: 100%</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <Terminal className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-sm font-extrabold text-white">API Integrations</h3>
              <p className="text-gray-400 text-xs mt-2">Standard JSON Webhooks alert operators when vehicle occupancy triggers over 95% capacity limits.</p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-400 font-mono">
                <span>Webhooks: 3 endpoints</span>
                <span>Type: Webhooks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Smart Solutions for Futuristic Cities
          </h2>
          <p className="text-gray-400 text-sm">
            Fully integrated IoT parking infrastructure, built with microservice performance, security logs, and payment gateways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, index) => (
            <div 
              key={index}
              className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col space-y-4 glass-panel-hover"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                {feat.icon}
              </div>
              <h3 className="text-sm font-bold text-white">{feat.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full bg-white/[0.01] border-t border-white/5 py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-white">SaaS Plans for Every Fleet</h2>
            <p className="text-gray-400 text-sm">Select the scaling option required for your smart community, office park, or metropolitan grid.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free/Starter */}
            <div className="glass-panel p-8 rounded-xl border border-white/5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Starter</div>
                <div className="text-3xl font-bold text-white">$49<span className="text-xs font-normal text-gray-400">/mo</span></div>
                <p className="text-gray-400 text-xs">Ideal for small office parking lots or private corporate yards.</p>
                <ul className="space-y-2 text-xs text-gray-300 pt-4 border-t border-white/5">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyber-blue" /> <span>Up to 50 active slots</span></li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyber-blue" /> <span>Basic real-time dashboard</span></li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyber-blue" /> <span>Email support channel</span></li>
                </ul>
              </div>
              <Link href="/dashboard" className="mt-8 w-full py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-center text-xs font-bold text-white transition-all">
                Get Started
              </Link>
            </div>

            {/* Professional */}
            <div className="glass-panel p-8 rounded-xl border-2 border-cyber-blue relative flex flex-col justify-between shadow-xl shadow-cyber-blue/10">
              <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-cyber-blue text-black font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                Most Popular
              </div>
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-cyber-blue">Professional</div>
                <div className="text-3xl font-bold text-white">$199<span className="text-xs font-normal text-gray-400">/mo</span></div>
                <p className="text-gray-400 text-xs">Perfect for commercial garages, airports, and mall venues.</p>
                <ul className="space-y-2 text-xs text-gray-300 pt-4 border-t border-white/5">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyber-blue" /> <span>Up to 500 active slots</span></li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyber-blue" /> <span>AI pricing surge optimization</span></li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyber-blue" /> <span>Stripe & Razorpay payment modules</span></li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyber-blue" /> <span>24/7 Premium SLA Support</span></li>
                </ul>
              </div>
              <Link href="/dashboard" className="mt-8 w-full py-2.5 rounded-lg bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-90 text-center text-xs font-bold text-white shadow-lg transition-all">
                Deploy Now
              </Link>
            </div>

            {/* Enterprise */}
            <div className="glass-panel p-8 rounded-xl border border-white/5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Enterprise</div>
                <div className="text-3xl font-bold text-white">Custom</div>
                <p className="text-gray-400 text-xs">Full municipal integrations for city-wide smart grid systems.</p>
                <ul className="space-y-2 text-xs text-gray-300 pt-4 border-t border-white/5">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyber-blue" /> <span>Unlimited slots & locations</span></li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyber-blue" /> <span>Multi-tenant white label controls</span></li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyber-blue" /> <span>Dedicated AI instance allocation</span></li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyber-blue" /> <span>On-premise / Hybrid Kubernetes</span></li>
                </ul>
              </div>
              <Link href="/dashboard" className="mt-8 w-full py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-center text-xs font-bold text-white transition-all">
                Contact Municipal Board
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold text-white">What Operators Say</h2>
          <p className="text-gray-400 text-sm">Feedback from municipalities and commercial facilities utilizing SmartPark AI.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-cyber-blue text-cyber-blue" />)}
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              "We decreased search congestion in our downtown core by over 45% in the first three months. The dynamic pricing optimization paid for the platform subscription within the first week."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyber-blue/20 flex items-center justify-center text-[10px] font-bold text-cyber-blue">SM</div>
              <div>
                <div className="text-xs font-bold text-white">Sarah Mercer</div>
                <div className="text-[9px] text-gray-500">Transportation Lead, Metro Transit</div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-cyber-blue text-cyber-blue" />)}
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              "Dynamic allocation of standard and EV slots simplified our garage operations. Drivers check in seamlessly using QR tickets, and pricing rules require zero manual overhead."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyber-purple/20 flex items-center justify-center text-[10px] font-bold text-cyber-purple">JH</div>
              <div>
                <div className="text-xs font-bold text-white">James Houston</div>
                <div className="text-[9px] text-gray-500">General Manager, Apex Garages</div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-cyber-blue text-cyber-blue" />)}
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              "The API architecture allowed us to integrate SmartPark directly into our autonomous delivery vehicles route planning. Zero waiting times for slots translates directly to higher logistics savings."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyber-pink/20 flex items-center justify-center text-[10px] font-bold text-cyber-pink">AL</div>
              <div>
                <div className="text-xs font-bold text-white">Arthur Lee</div>
                <div className="text-[9px] text-gray-500">Chief Architect, AutoCargo Logistics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-12 px-6 bg-dark-bg mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-cyber-blue to-cyber-purple flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-widest">SMARTPARK AI</span>
          </div>

          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-white transition-all">Privacy Agreement</a>
            <a href="#" className="hover:text-white transition-all">Municipal Webhooks SLA</a>
            <a href="#" className="hover:text-white transition-all">Security Shield Audit</a>
          </div>

          <div className="text-[10px] text-gray-600">
            © 2026 SmartPark AI Inc. All rights reserved. Cloud-Native Node Core v1.0.
          </div>
        </div>
      </footer>
    </div>
  );
}
