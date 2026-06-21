'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useStore } from '../store';
import { 
  Car, Compass, Calendar, CreditCard, Key, ShieldAlert, Cpu, Sparkles, Plus,
  TrendingUp, BarChart3, Users, DollarSign, Layers, AlertCircle, Play, Square,
  Building, ToggleLeft, Activity, RefreshCw, Smartphone, QrCode, CheckCircle2, XCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function Dashboard() {
  const { activeRole, isSimulationRunning, toggleSimulation, notifications, setNotifications } = useStore();

  // Mock database states for simulation
  const [lots, setLots] = useState<any[]>([
    { id: '1', name: 'Downtown Smart Arena', address: '742 Evergreen Terrace', basePrice: 5.0, currentPrice: 6.8, capacity: 10, occupiedCount: 6, slotsCount: 10 },
    { id: '2', name: 'Metro Terminal Parking', address: '404 Airport Blvd', basePrice: 8.0, currentPrice: 8.0, capacity: 8, occupiedCount: 4, slotsCount: 8 },
    { id: '3', name: 'Tech District Hub', address: '1024 Silicon Parkway', basePrice: 4.0, currentPrice: 4.6, capacity: 12, occupiedCount: 3, slotsCount: 12 },
  ]);

  const [reservations, setReservations] = useState<any[]>([
    { id: 'res-921', lotName: 'Downtown Smart Arena', slotName: 'S-4', plate: 'KA-01-MJ-9999', status: 'ACTIVE', startTime: '14:00', endTime: '18:00', price: 27.2, qrCodeToken: '03abdf9e88d' },
    { id: 'res-883', lotName: 'Tech District Hub', slotName: 'S-1', plate: 'KA-01-MJ-9999', status: 'PENDING', startTime: '17:00', endTime: '20:00', price: 13.8, qrCodeToken: '9bcf8211de4' }
  ]);

  const [vehicles, setVehicles] = useState([
    { id: 'v-1', plate: 'KA-01-MJ-9999', model: 'Tesla Model S', color: 'Solid Black' }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'VEHICLE_CHECK_IN', details: 'Tesla Model S checked in at slot S-4, Downtown Arena', time: '10m ago' },
    { id: 2, action: 'RESERVATION_CREATED', details: 'User reserved S-1 at Tech District Hub', time: '15m ago' },
    { id: 3, action: 'PAYMENT_RECEIVED', details: 'Received $27.20 payment via Stripe for res-921', time: '20m ago' }
  ]);

  // Form states
  const [selectedLotId, setSelectedLotId] = useState('1');
  const [selectedSlotType, setSelectedSlotType] = useState('STANDARD');
  const [duration, setDuration] = useState(2);
  const [plate, setPlate] = useState('KA-01-MJ-9999');

  // Trigger automated vehicle flows in simulation
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      // Simulate random car checking in or checking out
      setLots(prevLots => {
        return prevLots.map(lot => {
          const isEntering = Math.random() > 0.5;
          let count = lot.occupiedCount;
          if (isEntering && count < lot.capacity) {
            count += 1;
            // add audit log
            setAuditLogs(prev => [
              { id: Date.now(), action: 'VEHICLE_CHECK_IN', details: `Automated simulator vehicle entered lot ${lot.name}`, time: 'Just now' },
              ...prev.slice(0, 8)
            ]);
          } else if (!isEntering && count > 0) {
            count -= 1;
            setAuditLogs(prev => [
              { id: Date.now(), action: 'VEHICLE_CHECK_OUT', details: `Automated simulator vehicle exited lot ${lot.name}`, time: 'Just now' },
              ...prev.slice(0, 8)
            ]);
          }
          
          // Recalculate dynamic pricing
          const occupancyRate = count / lot.capacity;
          const currentPrice = parseFloat((lot.basePrice * (1 + occupancyRate * 0.8)).toFixed(2));

          return { ...lot, occupiedCount: count, currentPrice };
        });
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [isSimulationRunning]);

  // Handle new booking
  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const lot = lots.find(l => l.id === selectedLotId) || lots[0];
    const newRes = {
      id: `res-${Math.floor(100 + Math.random() * 900)}`,
      lotName: lot.name,
      slotName: `S-${Math.floor(1 + Math.random() * lot.capacity)}`,
      plate,
      status: 'PENDING',
      startTime: '16:00',
      endTime: '18:00',
      price: lot.currentPrice * duration,
      qrCodeToken: Math.random().toString(36).substring(2, 12)
    };

    setReservations([newRes, ...reservations]);
    setAuditLogs([
      { id: Date.now(), action: 'RESERVATION_CREATED', details: `User reserved ${newRes.slotName} at ${newRes.lotName}`, time: 'Just now' },
      ...auditLogs
    ]);

    // Send notifications
    setNotifications([
      { id: Date.now(), title: 'Reservation Confirmed', message: `Slot ${newRes.slotName} reserved successfully at ${newRes.lotName}.`, time: 'Just now' },
      ...notifications
    ]);
  };

  // Simulate Check-In using QR Code
  const triggerCheckIn = (resId: string) => {
    setReservations(prev => prev.map(r => {
      if (r.id === resId) {
        // Increment slot occupancy on the matching lot
        setLots(lotsPrev => lotsPrev.map(l => {
          if (l.name === r.lotName) {
            const count = Math.min(l.occupiedCount + 1, l.capacity);
            const occupancyRate = count / l.capacity;
            const currentPrice = parseFloat((l.basePrice * (1 + occupancyRate * 0.8)).toFixed(2));
            return { ...l, occupiedCount: count, currentPrice };
          }
          return l;
        }));

        setAuditLogs(prevLogs => [
          { id: Date.now(), action: 'VEHICLE_CHECK_IN', details: `Vehicle ${r.plate} entered slot ${r.slotName} via QR gate check-in`, time: 'Just now' },
          ...prevLogs
        ]);

        return { ...r, status: 'ACTIVE' };
      }
      return r;
    }));
  };

  // Simulate Check-Out
  const triggerCheckOut = (resId: string) => {
    setReservations(prev => prev.map(r => {
      if (r.id === resId) {
        // Decrement slot occupancy
        setLots(lotsPrev => lotsPrev.map(l => {
          if (l.name === r.lotName) {
            const count = Math.max(l.occupiedCount - 1, 0);
            const occupancyRate = count / l.capacity;
            const currentPrice = parseFloat((l.basePrice * (1 + occupancyRate * 0.8)).toFixed(2));
            return { ...l, occupiedCount: count, currentPrice };
          }
          return l;
        }));

        setAuditLogs(prevLogs => [
          { id: Date.now(), action: 'VEHICLE_CHECK_OUT', details: `Vehicle ${r.plate} exited slot ${r.slotName} via QR gate check-out`, time: 'Just now' },
          ...prevLogs
        ]);

        return { ...r, status: 'COMPLETED' };
      }
      return r;
    }));
  };

  // Simulated chart data
  const revenueChartData = [
    { name: '08:00', Revenue: 400 },
    { name: '10:00', Revenue: 1100 },
    { name: '12:00', Revenue: 850 },
    { name: '14:00', Revenue: 950 },
    { name: '16:00', Revenue: 1400 },
    { name: '18:00', Revenue: 1800 },
    { name: '20:00', Revenue: 600 }
  ];

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Simulation Banner */}
        <div className="glass-panel p-4 rounded-xl border border-cyber-blue/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-cyber-blue/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-blue/10 flex items-center justify-center border border-cyber-blue/20">
              <Activity className="w-4 h-4 text-cyber-blue animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Dynamic City Simulator Sandbox</div>
              <div className="text-[10px] text-gray-400">Autonomous vehicles enter and leave slots automatically every 15s when active.</div>
            </div>
          </div>
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              isSimulationRunning 
                ? 'bg-cyber-blue/20 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/35' 
                : 'bg-white/5 border border-white/10 text-gray-400 hover:border-gray-500'
            }`}
          >
            {isSimulationRunning ? <Square className="w-3.5 h-3.5 fill-cyber-blue" /> : <Play className="w-3.5 h-3.5 fill-gray-400" />}
            <span>{isSimulationRunning ? 'Pause Simulator' : 'Activate Simulator'}</span>
          </button>
        </div>

        {/* DRIVER PORTAL */}
        {activeRole === 'DRIVER' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Book slot Form & Vehicles */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Reserve slot */}
              <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Calendar className="w-4 h-4 text-cyber-blue" />
                  <span>Reserve Smart Slot</span>
                </div>

                <form onSubmit={handleBookSlot} className="space-y-4 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">Select Parking Lot</label>
                    <select 
                      value={selectedLotId}
                      onChange={(e) => setSelectedLotId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white accent-cyber-blue outline-none"
                    >
                      {lots.map(l => (
                        <option key={l.id} value={l.id} className="bg-dark-bg text-white">
                          {l.name} (${l.currentPrice}/hr)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Slot Type</label>
                    <div className="flex gap-2">
                      {['STANDARD', 'EV', 'HANDICAP'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedSlotType(type)}
                          className={`flex-1 py-2 rounded-lg font-bold border transition-all ${
                            selectedSlotType === type 
                              ? 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue' 
                              : 'bg-white/5 border-white/10 text-gray-400'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 block mb-1">Duration (Hours)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="24"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Vehicle Plate</label>
                      <select 
                        value={plate}
                        onChange={(e) => setPlate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none"
                      >
                        {vehicles.map(v => (
                          <option key={v.id} value={v.plate} className="bg-dark-bg text-white">
                            {v.plate}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-90 font-bold text-white shadow-lg transition-all"
                  >
                    Confirm Reservation
                  </button>
                </form>
              </div>

              {/* Vehicle Management */}
              <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between text-white font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-cyber-purple" />
                    <span>My Vehicles</span>
                  </div>
                  <button className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-cyber-purple">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {vehicles.map((v) => (
                    <div key={v.id} className="p-3 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white">{v.plate}</div>
                        <div className="text-gray-400 text-[10px] mt-0.5">{v.model} ({v.color})</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-cyber-blue/10 border border-cyber-blue/20 text-[9px] font-bold text-cyber-blue">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Parking Lots Map & Active Reservations */}
            <div className="lg:col-span-8 space-y-6">
              {/* Nearby Lots list */}
              <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyber-blue" />
                  <span>Real-Time Smart Lots Feed</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {lots.map((lot) => {
                    const occRate = lot.occupiedCount / lot.capacity;
                    return (
                      <div key={lot.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-4 hover:border-cyber-blue/40 transition-all">
                        <div>
                          <div className="font-bold text-white text-xs">{lot.name}</div>
                          <div className="text-gray-500 text-[9px] mt-0.5">{lot.address}</div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                            <span>Occupancy</span>
                            <span>{lot.occupiedCount}/{lot.capacity} slots</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${occRate > 0.8 ? 'bg-cyber-pink' : 'bg-cyber-blue'}`}
                              style={{ width: `${occRate * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-[10px] text-gray-400">Surge Pricing</span>
                          <span className="text-sm font-extrabold text-cyber-blue">${lot.currentPrice.toFixed(2)}/hr</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Reservations with Gates Check-In Simulator */}
              <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyber-pink" />
                  <span>Active Tickets & Gate Simulators</span>
                </h3>

                <div className="space-y-4">
                  {reservations.length === 0 ? (
                    <p className="text-center text-xs text-gray-500 py-6">No reservations booked.</p>
                  ) : (
                    reservations.map((r) => (
                      <div key={r.id} className="p-4 rounded-xl bg-white/5 border border-white/5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-4 space-y-1">
                          <span className="text-[9px] uppercase tracking-widest text-cyber-pink font-bold">Ticket: {r.id}</span>
                          <div className="font-bold text-white text-xs">{r.lotName}</div>
                          <div className="text-gray-400 text-[10px]">Slot: {r.slotName} • Vehicle: {r.plate}</div>
                        </div>

                        <div className="md:col-span-3 space-y-1">
                          <div className="text-[10px] text-gray-400">Status</div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                            r.status === 'ACTIVE' 
                              ? 'bg-cyber-blue/10 border-cyber-blue text-cyber-blue'
                              : r.status === 'COMPLETED'
                              ? 'bg-green-500/10 border-green-500 text-green-500'
                              : 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                          }`}>
                            {r.status}
                          </span>
                        </div>

                        {/* Gate Simulation Buttons */}
                        <div className="md:col-span-5 flex items-center gap-3 justify-end">
                          <div className="flex flex-col items-center p-2 rounded bg-white/5 border border-white/10" title="QR Code Token">
                            <QrCode className="w-6 h-6 text-gray-300" />
                            <span className="text-[8px] font-mono text-gray-500 mt-1">{r.qrCodeToken}</span>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            {r.status === 'PENDING' && (
                              <button
                                onClick={() => triggerCheckIn(r.id)}
                                className="px-3 py-1.5 rounded bg-cyber-blue text-black font-extrabold text-[10px] transition-all hover:bg-opacity-90 flex items-center gap-1"
                              >
                                <Play className="w-3 h-3 fill-black" />
                                <span>Simulate Entry Gate</span>
                              </button>
                            )}
                            {r.status === 'ACTIVE' && (
                              <button
                                onClick={() => triggerCheckOut(r.id)}
                                className="px-3 py-1.5 rounded bg-cyber-pink text-white font-extrabold text-[10px] transition-all hover:bg-opacity-90 flex items-center gap-1"
                              >
                                <Square className="w-3 h-3 fill-white" />
                                <span>Simulate Exit Gate</span>
                              </button>
                            )}
                            {r.status === 'COMPLETED' && (
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PARKING OPERATOR PORTAL */}
        {activeRole === 'OPERATOR' && (
          <div className="space-y-6">
            {/* Operator Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><DollarSign className="w-12 h-12 text-cyber-blue" /></div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Revenue</div>
                <div className="text-3xl font-extrabold text-white">$4,850.50</div>
                <div className="text-[10px] text-cyber-blue font-semibold flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3" /> +14.2% from yesterday
                </div>
              </div>

              <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Users className="w-12 h-12 text-cyber-purple" /></div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Bookings</div>
                <div className="text-3xl font-extrabold text-white">42</div>
                <div className="text-[10px] text-gray-500 mt-2">Currently occupying slots</div>
              </div>

              <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Activity className="w-12 h-12 text-cyber-pink" /></div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Occupancy</div>
                <div className="text-3xl font-extrabold text-white">68.4%</div>
                <div className="text-[10px] text-cyber-pink font-semibold flex items-center gap-1 mt-2">
                  Dynamic Price surged to $6.80
                </div>
              </div>

              <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Layers className="w-12 h-12 text-gray-500" /></div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Municipal Tenant</div>
                <div className="text-xl font-extrabold text-white">Downtown-Grid-West</div>
                <div className="text-[10px] text-gray-500 mt-3">White-label: active</div>
              </div>
            </div>

            {/* Charts and Pricing Sliders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-8 glass-panel p-6 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyber-blue" />
                  <span>Revenue Over Day (AI Optimized Yield)</span>
                </h3>
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                      <YAxis stroke="#9ca3af" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0d111e', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                      <Area type="monotone" dataKey="Revenue" stroke="#00d2ff" fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Slot Management Slider & Lots override */}
              <div className="lg:col-span-4 glass-panel p-6 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyber-purple" />
                  <span>Lots Configurations</span>
                </h3>

                <div className="space-y-4">
                  {lots.map((lot) => (
                    <div key={lot.id} className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{lot.name}</span>
                        <span className="text-[10px] text-cyber-purple font-semibold">Active</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>Base Price</span>
                          <span>${lot.basePrice}/hr</span>
                        </div>
                        <input 
                          type="range"
                          min="1"
                          max="20"
                          value={lot.basePrice}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setLots(prev => prev.map(l => l.id === lot.id ? { ...l, basePrice: val, currentPrice: parseFloat((val * (1 + (l.occupiedCount/l.capacity) * 0.8)).toFixed(2)) } : l));
                          }}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyber-purple"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUPER ADMIN PORTAL */}
        {activeRole === 'SUPER_ADMIN' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SaaS isolations & configurations */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyber-blue" />
                  <span>SaaS Tenant isolation</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div>
                      <div className="font-bold text-white">Multi-Tenancy Mode</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">Isolate databases per tenant</div>
                    </div>
                    <button className="text-cyber-blue"><ToggleLeft className="w-8 h-8 rotate-180" /></button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div>
                      <div className="font-bold text-white">White Labeling Shield</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">Enable custom logos/themes</div>
                    </div>
                    <button className="text-cyber-blue"><ToggleLeft className="w-8 h-8 rotate-180" /></button>
                  </div>
                </div>
              </div>

              {/* Subscriptions metrics */}
              <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyber-pink" />
                  <span>SaaS Billing Plans</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-2 border-b border-white/5">
                    <span className="text-gray-300 font-semibold">Free Tier</span>
                    <span className="text-gray-500">12 tenants</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b border-white/5">
                    <span className="text-cyber-blue font-semibold">Professional Tier</span>
                    <span className="text-white font-bold">28 tenants</span>
                  </div>
                  <div className="flex justify-between items-center p-2">
                    <span className="text-cyber-purple font-semibold">Enterprise Tier</span>
                    <span className="text-white font-bold">6 tenants</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="lg:col-span-8 glass-panel p-6 rounded-xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-cyber-pink" />
                <span>Audit & Security Logs</span>
              </h3>

              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-xs hover:border-cyber-pink/20 transition-all">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold mr-3 ${
                        log.action.includes('PAYMENT') 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-gray-300">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CITY AUTHORITY PORTAL */}
        {activeRole === 'CITY_AUTHORITY' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Control Signals */}
            <div className="lg:col-span-4 glass-panel p-6 rounded-xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyber-blue" />
                <span>Override Signals</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 space-y-3">
                  <div className="font-bold text-red-400">Emergency Locking</div>
                  <p className="text-[10px] text-gray-400">Block all reservations city-wide in case of municipal emergencies.</p>
                  <button className="px-3 py-1.5 rounded bg-red-500 hover:bg-red-600 font-bold text-white text-[10px] transition-all">
                    TRIGGER GRID LOCKDOWN
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20 space-y-3">
                  <div className="font-bold text-cyber-blue">Evacuation Mode</div>
                  <p className="text-[10px] text-gray-400">Set all gate entry/exits status to open with zero fees.</p>
                  <button className="px-3 py-1.5 rounded bg-cyber-blue text-black font-extrabold text-[10px] transition-all">
                    ENABLE FREE FLOW
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Heatmaps Analytics */}
            <div className="lg:col-span-8 glass-panel p-6 rounded-xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-purple" />
                <span>Live Heatmap Analytics</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-300">
                <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-2">
                  <div className="font-bold text-white">Grid Zone Congestion</div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-b border-white/5">
                    <span>Zone Alpha (Business)</span>
                    <span className="text-cyber-pink font-bold">88.4% occupied</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-b border-white/5">
                    <span>Zone Beta (Retail)</span>
                    <span className="text-yellow-500 font-bold">62.1% occupied</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2">
                    <span>Zone Gamma (Tech)</span>
                    <span className="text-cyber-blue font-bold">34.8% occupied</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-2">
                  <div className="font-bold text-white">Dynamic Surge Metrics</div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-b border-white/5">
                    <span>Max Surge Price Cap</span>
                    <span className="text-white font-bold">$20.00/hr</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-b border-white/5">
                    <span>Active Congestion Toll</span>
                    <span className="text-white font-bold">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2">
                    <span>Price Cap override</span>
                    <span className="text-cyber-blue font-bold">Auto (AI Controlled)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
