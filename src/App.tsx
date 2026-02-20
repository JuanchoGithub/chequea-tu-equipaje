/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Luggage, Briefcase, Backpack, Info, CheckCircle2, AlertCircle, ChevronDown, Ruler, Scale, PlaneTakeoff } from 'lucide-react';
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

  const totalLinear = length + width + height;
  const lengthUnit = unit === 'metric' ? 'cm' : 'in';
  const weightUnit = unit === 'metric' ? 'kg' : 'lb';

  // Validation Logic
  const getValidation = () => {
    if (length <= 0 || width <= 0 || height <= 0) return { status: 'idle', message: 'Ingresa las dimensiones de tu equipaje', dimStatus: 'idle', weightStatus: 'idle' };

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
      if (dimStatus === 'invalid' && weightStatus === 'invalid') message = 'Dimensiones y peso exceden el límite permitido.';
      else if (dimStatus === 'invalid') message = 'Las dimensiones exceden el límite permitido.';
      else message = 'El peso excede el límite permitido.';
    } else if (dimStatus === 'warning') {
      status = 'warning';
      message = 'Estás muy cerca del límite (62-63"). Algunas aerolíneas podrían aplicar cargos extra.';
    } else {
      status = 'valid';
      message = '¡Todo en orden! Tu equipaje cumple con las normativas.';
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
    <div className="min-h-screen bg-[#F4F4F5] text-[#18181B] font-sans selection:bg-black selection:text-white">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 p-2 rounded-xl">
              <PlaneTakeoff className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">PackCheck</span>
          </div>
          <button 
            onClick={toggleUnit}
            className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <Scale className="w-4 h-4" />
            {unit === 'metric' ? 'Métrico (cm/kg)' : 'Imperial (in/lb)'}
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs & Configuration */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Type Selector */}
            <section>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">1. Tipo de Equipaje</h2>
              <div className="grid grid-cols-3 gap-4">
                {LUGGAGE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isActive = luggageType.id === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setLuggageType(type)}
                      className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all duration-200 ${
                        isActive 
                          ? 'bg-white border-zinc-900 shadow-sm' 
                          : 'bg-white border-transparent hover:border-zinc-200 text-zinc-500 hover:text-zinc-900 shadow-sm'
                      }`}
                    >
                      {isActive && (
                        <motion.div layoutId="active-indicator" className="absolute top-3 right-3">
                          <div className="w-2 h-2 rounded-full bg-zinc-900" />
                        </motion.div>
                      )}
                      <Icon className={`w-8 h-8 ${isActive ? 'text-zinc-900' : ''}`} />
                      <span className={`text-xs font-semibold text-center leading-tight ${isActive ? 'text-zinc-900' : ''}`}>
                        {type.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Dimension Inputs */}
            <section>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                2. Medidas
              </h2>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5" /> Largo
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={length || ''} 
                        onChange={(e) => handleInputChange(setLength, e.target.value)}
                        placeholder="0"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xl font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">{lengthUnit}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5" /> Ancho
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={width || ''} 
                        onChange={(e) => handleInputChange(setWidth, e.target.value)}
                        placeholder="0"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xl font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">{lengthUnit}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5" /> Alto
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={height || ''} 
                        onChange={(e) => handleInputChange(setHeight, e.target.value)}
                        placeholder="0"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xl font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">{lengthUnit}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100">
                  <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5 mb-2">
                    <Scale className="w-3.5 h-3.5" /> Peso Total
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={weight || ''} 
                      onChange={(e) => handleInputChange(setWeight, e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-2xl font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">{weightUnit}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Results Panel */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-zinc-200 sticky top-24">
              <h2 className="text-lg font-semibold text-zinc-900 mb-6">Análisis de Equipaje</h2>
              
              <div className="space-y-8">
                {/* Destination Selector (Only for Checked) - MOVED HERE */}
                <AnimatePresence mode="wait">
                  {luggageType.isLinear && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 border-b border-zinc-100">
                        <label className="text-sm font-medium text-zinc-500 mb-2 block">Región / Aerolínea</label>
                        <div className="relative">
                          <select
                            value={destination.id}
                            onChange={(e) => setDestination(DESTINATIONS.find(d => d.id === e.target.value) || DESTINATIONS[0])}
                            className="w-full appearance-none bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                          >
                            {DESTINATIONS.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                        <p className="text-xs text-zinc-400 mt-2">{destination.description}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Size Status */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium text-zinc-500">{luggageType.isLinear ? 'Dimensión Lineal' : 'Dimensión Máxima'}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      validation.dimStatus === 'invalid' ? 'bg-red-100 text-red-700' : 
                      validation.dimStatus === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      Límite: {luggageType.isLinear ? (unit === 'metric' ? destination.checkedLimitCm : destination.checkedLimitIn) : (unit === 'metric' ? luggageType.maxDim!.cm[0] : luggageType.maxDim!.in[0])} {lengthUnit}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight text-zinc-900">
                      {luggageType.isLinear ? totalLinear.toFixed(1) : `${Math.max(length, width, height).toFixed(0)}`}
                    </span>
                    <span className="text-lg text-zinc-400 font-medium">{lengthUnit}</span>
                  </div>
                </div>

                {/* Weight Status */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium text-zinc-500">Peso Actual</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      validation.weightStatus === 'invalid' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      Límite: {unit === 'metric' ? luggageType.maxWeight.kg : luggageType.maxWeight.lb} {weightUnit}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight text-zinc-900">
                      {weight.toFixed(1)}
                    </span>
                    <span className="text-lg text-zinc-400 font-medium">{weightUnit}</span>
                  </div>
                </div>

                {/* Final Verdict Card */}
                <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                  totalLinear === 0 ? 'bg-zinc-50 border-zinc-200' :
                  validation.status === 'valid' ? 'bg-emerald-50 border-emerald-200' : 
                  validation.status === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {totalLinear === 0 ? <Info className="w-5 h-5 text-zinc-400" /> :
                       validation.status === 'valid' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : 
                       validation.status === 'warning' ? <AlertCircle className="w-5 h-5 text-amber-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold mb-1 ${
                        totalLinear === 0 ? 'text-zinc-700' :
                        validation.status === 'valid' ? 'text-emerald-800' : 
                        validation.status === 'warning' ? 'text-amber-800' : 'text-red-800'
                      }`}>
                        {totalLinear === 0 ? 'Esperando medidas' : 
                         validation.status === 'valid' ? 'Aprobado para viajar' : 
                         validation.status === 'warning' ? 'Precaución requerida' : 'Excede los límites'}
                      </h3>
                      <p className={`text-sm leading-relaxed ${
                        totalLinear === 0 ? 'text-zinc-500' :
                        validation.status === 'valid' ? 'text-emerald-700/80' : 
                        validation.status === 'warning' ? 'text-amber-700/80' : 'text-red-700/80'
                      }`}>
                        {validation.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100 flex items-start gap-2 text-zinc-400">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Los límites mostrados son referenciales. Las políticas pueden variar según la aerolínea, la tarifa o el nivel de viajero frecuente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


