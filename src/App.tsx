/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Luggage, Plane, Info, CheckCircle2, AlertCircle, ChevronDown, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Predefined limits for different regions/airlines
const DESTINATIONS = [
  { id: 'standard', name: 'Estándar Internacional', limitCm: 158, limitIn: 62, description: 'Límite común para equipaje facturado.' },
  { id: 'europe', name: 'Europa (Low Cost)', limitCm: 156, limitIn: 61.4, description: 'Restricciones comunes en aerolíneas de bajo costo europeas.' },
  { id: 'usa', name: 'EE.UU. Doméstico', limitCm: 157, limitIn: 62, description: 'Límite estándar para vuelos nacionales en EE.UU.' },
  { id: 'asia', name: 'Asia / Pacífico', limitCm: 158, limitIn: 62, description: 'Suele seguir el estándar de 158cm.' },
];

type Unit = 'cm' | 'in';

export default function App() {
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [unit, setUnit] = useState<Unit>('cm');
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalLinear = length + width + height;
  const limit = unit === 'cm' ? destination.limitCm : destination.limitIn;
  const isWithinLimit = totalLinear <= limit && totalLinear > 0;
  const percentage = Math.min((totalLinear / limit) * 100, 100);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    const num = parseFloat(value);
    setter(isNaN(num) ? 0 : num);
  };

  const toggleUnit = () => {
    if (unit === 'cm') {
      setLength(prev => parseFloat((prev / 2.54).toFixed(1)));
      setWidth(prev => parseFloat((prev / 2.54).toFixed(1)));
      setHeight(prev => parseFloat((prev / 2.54).toFixed(1)));
      setUnit('in');
    } else {
      setLength(prev => parseFloat((prev * 2.54).toFixed(1)));
      setWidth(prev => parseFloat((prev * 2.54).toFixed(1)));
      setHeight(prev => parseFloat((prev * 2.54).toFixed(1)));
      setUnit('cm');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-xl">
              <Luggage className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">PackCheck</h1>
          </div>
          <button 
            onClick={toggleUnit}
            className="bg-white border border-black/5 shadow-sm px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Unidad: {unit.toUpperCase()}
          </button>
        </header>

        {/* Main Card */}
        <main className="bg-white rounded-[32px] shadow-sm border border-black/5 overflow-hidden">
          {/* Destination Selector */}
          <div className="p-6 border-bottom border-black/5 bg-gray-50/50">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-2 block">
              Destino / Regla
            </label>
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-white border border-black/10 rounded-2xl px-4 py-3 text-left hover:border-black/20 transition-all"
              >
                <div>
                  <span className="font-medium">{destination.name}</span>
                  <span className="text-gray-400 text-sm ml-2">({limit}{unit})</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 w-full mt-2 bg-white border border-black/10 rounded-2xl shadow-xl overflow-hidden"
                  >
                    {DESTINATIONS.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => {
                          setDestination(dest);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-black/5 last:border-0"
                      >
                        <div className="font-medium">{dest.name}</div>
                        <div className="text-xs text-gray-500">{dest.description}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Inputs */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">Largo ({unit})</label>
                <input 
                  type="number" 
                  value={length || ''} 
                  onChange={(e) => handleInputChange(setLength, e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-2xl font-light focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">Ancho ({unit})</label>
                <input 
                  type="number" 
                  value={width || ''} 
                  onChange={(e) => handleInputChange(setWidth, e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-2xl font-light focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">Alto ({unit})</label>
                <input 
                  type="number" 
                  value={height || ''} 
                  onChange={(e) => handleInputChange(setHeight, e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 text-2xl font-light focus:ring-2 focus:ring-black transition-all"
                />
              </div>
            </div>

            {/* Result Section */}
            <div className="bg-gray-50 rounded-[24px] p-6 space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Dimensión Lineal Total</div>
                  <div className="text-5xl font-light tracking-tighter">
                    {totalLinear.toFixed(1)} <span className="text-2xl text-gray-400">{unit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Límite</div>
                  <div className="text-xl font-medium">{limit} {unit}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  className={`absolute top-0 left-0 h-full rounded-full ${isWithinLimit ? 'bg-black' : 'bg-red-500'}`}
                />
              </div>

              {/* Status Message */}
              <AnimatePresence mode="wait">
                {totalLinear > 0 && (
                  <motion.div 
                    key={isWithinLimit ? 'valid' : 'invalid'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl ${isWithinLimit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                  >
                    {isWithinLimit ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">¡Tu equipaje cumple con las normas!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">Tu equipaje excede el límite permitido.</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Info Section */}
        <footer className="mt-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Info className="w-4 h-4" />
            <p>La dimensión lineal es la suma de Largo + Ancho + Alto.</p>
          </div>
          <div className="pt-8 border-t border-black/5">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Viaja con tranquilidad • PackCheck 2026</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
