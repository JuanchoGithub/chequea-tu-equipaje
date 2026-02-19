/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Luggage, Briefcase, Backpack, Info, CheckCircle2, AlertCircle, ChevronDown, Weight, Ruler, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Predefined limits for different regions/airlines
const DESTINATIONS = [
  { id: 'standard', name: 'Estándar Internacional', checkedLimitCm: 158, checkedLimitIn: 62, description: 'Límite común para equipaje facturado.' },
  { id: 'europe', name: 'Europa (Low Cost)', checkedLimitCm: 156, checkedLimitIn: 61.4, description: 'Restricciones comunes en aerolíneas de bajo costo europeas.' },
  { id: 'usa', name: 'EE.UU. Doméstico', checkedLimitCm: 157, checkedLimitIn: 62, description: 'Límite estándar para vuelos nacionales en EE.UU.' },
];

const LUGGAGE_TYPES = [
  { 
    id: 'personal', 
    name: 'Artículo Personal', 
    icon: Briefcase,
    maxDim: { cm: [40, 30, 20], in: [16, 12, 8] },
    maxWeight: { kg: 5, lb: 11 },
    description: 'Debajo del asiento.'
  },
  { 
    id: 'carryon', 
    name: 'Equipaje de Mano', 
    icon: Backpack,
    maxDim: { cm: [55, 40, 23], in: [22, 16, 9] },
    maxWeight: { kg: 10, lb: 22 },
    description: 'Compartimento superior.'
  },
  { 
    id: 'checked', 
    name: 'Equipaje Facturado', 
    icon: Luggage,
    isLinear: true,
    maxWeight: { kg: 23, lb: 50 },
    description: 'Bodega del avión.'
  }
];

type Unit = 'metric' | 'imperial'; // cm/kg vs in/lb

export default function App() {
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [unit, setUnit] = useState<Unit>('metric');
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [luggageType, setLuggageType] = useState(LUGGAGE_TYPES[2]); // Default to Checked
  const [isDestDropdownOpen, setIsDestDropdownOpen] = useState(false);

  const totalLinear = length + width + height;
  const lengthUnit = unit === 'metric' ? 'cm' : 'in';
  const weightUnit = unit === 'metric' ? 'kg' : 'lb';

  // Validation Logic
  const getValidation = () => {
    if (length <= 0 || width <= 0 || height <= 0) return { status: 'idle', message: 'Ingresa dimensiones', dimStatus: 'idle', weightStatus: 'idle' };

    let dimStatus: 'valid' | 'warning' | 'invalid' = 'valid';
    let weightStatus: 'valid' | 'invalid' = weight <= (unit === 'metric' ? luggageType.maxWeight.kg : luggageType.maxWeight.lb) ? 'valid' : 'invalid';
    
    if (luggageType.isLinear) {
      const limit = unit === 'metric' ? destination.checkedLimitCm : destination.checkedLimitIn;
      const warningLimit = unit === 'metric' ? 160 : 63; // 63 inches warning
      
      if (totalLinear <= limit) {
        dimStatus = 'valid';
      } else if (totalLinear <= warningLimit) {
        dimStatus = 'warning';
      } else {
        dimStatus = 'invalid';
      }
    } else {
      const limits = unit === 'metric' ? luggageType.maxDim!.cm : luggageType.maxDim!.in;
      const inputs = [length, width, height].sort((a, b) => b - a);
      const sortedLimits = [...limits].sort((a, b) => b - a);
      dimStatus = inputs.every((val, i) => val <= sortedLimits[i]) ? 'valid' : 'invalid';
    }

    let status: 'valid' | 'warning' | 'invalid' = 'valid';
    let message = '';

    if (dimStatus === 'invalid' || weightStatus === 'invalid') {
      status = 'invalid';
      if (dimStatus === 'invalid' && weightStatus === 'invalid') message = 'Dimensiones y peso excedidos';
      else if (dimStatus === 'invalid') message = 'Dimensiones excedidas';
      else message = 'Peso excedido';
    } else if (dimStatus === 'warning') {
      status = 'warning';
      message = 'Cerca del límite (62-63"). Podría aplicar cargo extra.';
    } else {
      status = 'valid';
      message = '¡Todo en orden!';
    }

    return { status, message, dimStatus, weightStatus };
  };

  const validation = getValidation();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    const num = parseFloat(value);
    setter(isNaN(num) ? 0 : num);
  };

  const toggleUnit = () => {
    if (unit === 'metric') {
      setLength(prev => parseFloat((prev / 2.54).toFixed(1)));
      setWidth(prev => parseFloat((prev / 2.54).toFixed(1)));
      setHeight(prev => parseFloat((prev / 2.54).toFixed(1)));
      setWeight(prev => parseFloat((prev * 2.20462).toFixed(1)));
      setUnit('imperial');
    } else {
      setLength(prev => parseFloat((prev * 2.54).toFixed(1)));
      setWidth(prev => parseFloat((prev * 2.54).toFixed(1)));
      setHeight(prev => parseFloat((prev * 2.54).toFixed(1)));
      setWeight(prev => parseFloat((prev / 2.20462).toFixed(1)));
      setUnit('metric');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] font-sans p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2.5 rounded-2xl shadow-lg shadow-black/10">
              <Luggage className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">PackCheck</h1>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Calculadora Pro</p>
            </div>
          </div>
          <button 
            onClick={toggleUnit}
            className="bg-white border border-black/5 shadow-sm px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-95"
          >
            {unit === 'metric' ? 'MÉTRICO (CM/KG)' : 'IMPERIAL (IN/LB)'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-8 space-y-6">
            <main className="bg-white rounded-[32px] shadow-sm border border-black/5 overflow-hidden">
              {/* Type Selector */}
              <div className="p-6 bg-gray-50/50 border-b border-black/5">
                <label className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-4 block">Tipo de Equipaje</label>
                <div className="grid grid-cols-3 gap-3">
                  {LUGGAGE_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isActive = luggageType.id === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setLuggageType(type)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-[24px] border-2 transition-all ${
                          isActive 
                            ? 'bg-black border-black text-white shadow-xl shadow-black/10' 
                            : 'bg-white border-transparent text-gray-400 hover:border-black/10'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-tight text-center leading-tight">{type.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Destination Selector (Only for Checked) */}
              {luggageType.isLinear && (
                <div className="p-6 border-b border-black/5 bg-white">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2 block">Destino / Aerolínea</label>
                  <div className="relative">
                    <button 
                      onClick={() => setIsDestDropdownOpen(!isDestDropdownOpen)}
                      className="w-full flex items-center justify-between bg-gray-50 border border-black/5 rounded-2xl px-4 py-3 text-left hover:border-black/10 transition-all"
                    >
                      <span className="font-semibold text-sm">{destination.name}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDestDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isDestDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-20 w-full mt-2 bg-white border border-black/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                          {DESTINATIONS.map((dest) => (
                            <button
                              key={dest.id}
                              onClick={() => {
                                setDestination(dest);
                                setIsDestDropdownOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-black/5 last:border-0"
                            >
                              <div className="font-bold text-sm">{dest.name}</div>
                              <div className="text-[10px] text-gray-400 uppercase font-medium">{dest.description}</div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Dimension Inputs */}
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block flex items-center gap-1">
                      <Ruler className="w-3 h-3" /> Largo ({lengthUnit})
                    </label>
                    <input 
                      type="number" 
                      value={length || ''} 
                      onChange={(e) => handleInputChange(setLength, e.target.value)}
                      placeholder="0"
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-4 text-2xl font-bold focus:bg-white focus:border-black transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block flex items-center gap-1">
                      <Ruler className="w-3 h-3" /> Ancho ({lengthUnit})
                    </label>
                    <input 
                      type="number" 
                      value={width || ''} 
                      onChange={(e) => handleInputChange(setWidth, e.target.value)}
                      placeholder="0"
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-4 text-2xl font-bold focus:bg-white focus:border-black transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block flex items-center gap-1">
                      <Ruler className="w-3 h-3" /> Alto ({lengthUnit})
                    </label>
                    <input 
                      type="number" 
                      value={height || ''} 
                      onChange={(e) => handleInputChange(setHeight, e.target.value)}
                      placeholder="0"
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-4 text-2xl font-bold focus:bg-white focus:border-black transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Weight Input */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block flex items-center gap-1">
                    <Scale className="w-3 h-3" /> Peso ({weightUnit})
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={weight || ''} 
                      onChange={(e) => handleInputChange(setWeight, e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-4 text-3xl font-bold focus:bg-white focus:border-black transition-all outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xl">{weightUnit}</div>
                  </div>
                </div>
              </div>
            </main>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 sticky top-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Resumen de Viaje</h2>
              
              <div className="space-y-8">
                {/* Linear/Dim Status */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tamaño</span>
                    <span className="text-xs font-bold">{luggageType.isLinear ? 'Lineal' : 'Dimensiones'}</span>
                  </div>
                  <div className="text-3xl font-bold tracking-tight">
                    {luggageType.isLinear ? totalLinear.toFixed(1) : `${Math.max(length, width, height).toFixed(0)} max`}
                    <span className="text-sm text-gray-300 ml-1">{lengthUnit}</span>
                  </div>
                  <div className={`text-[10px] font-bold mt-1 ${
                    validation.dimStatus === 'invalid' ? 'text-red-500' : 
                    validation.dimStatus === 'warning' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    Límite: {luggageType.isLinear ? (unit === 'metric' ? destination.checkedLimitCm : destination.checkedLimitIn) : (unit === 'metric' ? luggageType.maxDim!.cm[0] : luggageType.maxDim!.in[0])} {lengthUnit}
                  </div>
                </div>

                {/* Weight Status */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Peso</span>
                    <span className="text-xs font-bold">{weightUnit.toUpperCase()}</span>
                  </div>
                  <div className="text-3xl font-bold tracking-tight">
                    {weight.toFixed(1)}
                    <span className="text-sm text-gray-300 ml-1">{weightUnit}</span>
                  </div>
                  <div className={`text-[10px] font-bold mt-1 ${validation.weightStatus === 'invalid' ? 'text-red-500' : 'text-emerald-500'}`}>
                    Límite: {unit === 'metric' ? luggageType.maxWeight.kg : luggageType.maxWeight.lb} {weightUnit}
                  </div>
                </div>

                {/* Final Verdict */}
                <div className={`p-6 rounded-[24px] border-2 transition-all ${
                  totalLinear === 0 ? 'bg-gray-50 border-transparent' :
                  validation.status === 'valid' ? 'bg-emerald-50 border-emerald-100' : 
                  validation.status === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    {totalLinear === 0 ? <Info className="w-5 h-5 text-gray-300" /> :
                     validation.status === 'valid' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
                     validation.status === 'warning' ? <AlertCircle className="w-5 h-5 text-amber-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      totalLinear === 0 ? 'text-gray-400' :
                      validation.status === 'valid' ? 'text-emerald-700' : 
                      validation.status === 'warning' ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {totalLinear === 0 ? 'Esperando datos' : 
                       validation.status === 'valid' ? 'Aprobado' : 
                       validation.status === 'warning' ? 'Advertencia' : 'Rechazado'}
                    </span>
                  </div>
                  <p className={`text-sm font-bold leading-tight ${
                    totalLinear === 0 ? 'text-gray-300' :
                    validation.status === 'valid' ? 'text-emerald-900' : 
                    validation.status === 'warning' ? 'text-amber-900' : 'text-red-900'
                  }`}>
                    {validation.message}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-black/5">
                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                  * Los límites son referenciales. Verifica siempre con tu aerolínea específica antes de viajar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-[10px] text-gray-300 uppercase tracking-[0.2em] font-bold">PackCheck Pro • 2026 Edition</p>
        </footer>
      </div>
    </div>
  );
}

