import React, { useState } from 'react';
import { sound } from '../utils/soundEngine';
import { Coffee, X, Heart, Check, Plane } from 'lucide-react';

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight: boolean;
}

export const CoffeeModal: React.FC<CoffeeModalProps> = ({ isOpen, onClose, isLight }) => {
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [tipped, setTipped] = useState(false);

  if (!isOpen) return null;

  const handleSupport = () => {
    sound.playBoardingChime();
    setTipped(true);
    setTimeout(() => {
      setTipped(false);
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-sm rounded-2xl border overflow-hidden shadow-2xl ${
          isLight
            ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
            : 'bg-neutral-950 border-neutral-800 text-neutral-100'
        }`}
      >
        {/* Boarding Pass Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/40">
          <div className="flex items-center gap-2">
            <Coffee size={18} className="text-amber-400" />
            <span className="font-mono text-xs font-bold tracking-widest uppercase">
              COFFEE BOARDING PASS
            </span>
          </div>
          <button
            onClick={() => {
              sound.playDroplet();
              onClose();
            }}
            className="p-1 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Coffee size={28} />
          </div>

          <h3 className="font-mono font-bold text-base mb-1">Fuel the Matrix Flight Deck</h3>
          <p className="font-mono text-xs text-neutral-400 mb-6">
            If Airport Matrix Time helped you keep sync across world timezones or stay focused,
            consider fueling our ongoing independent development!
          </p>

          {/* Amount Options */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {[
              { amount: 3, label: 'Espresso', seat: 'ECON' },
              { amount: 5, label: 'Cappuccino', seat: 'BIZ' },
              { amount: 10, label: 'First Class', seat: 'FIRST' },
            ].map((tier) => (
              <button
                key={tier.amount}
                onClick={() => {
                  sound.playDroplet();
                  setSelectedAmount(tier.amount);
                }}
                className={`py-2.5 px-2 rounded-xl border font-mono transition-all cursor-pointer ${
                  selectedAmount === tier.amount
                    ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="text-sm">${tier.amount}</div>
                <div className="text-[10px] uppercase opacity-80">{tier.label}</div>
              </button>
            ))}
          </div>

          {/* Action */}
          <button
            onClick={handleSupport}
            disabled={tipped}
            className={`w-full py-3 rounded-xl font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tipped
                ? 'bg-emerald-500 text-black'
                : 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/20'
            }`}
          >
            {tipped ? (
              <>
                <Check size={16} />
                <span>THANK YOU FOR BOARDING!</span>
              </>
            ) : (
              <>
                <Heart size={16} className="fill-current text-black" />
                <span>BUY A COFFEE (${selectedAmount})</span>
              </>
            )}
          </button>

          {/* Boarding pass ticket punch simulation footer */}
          <div className="mt-6 pt-4 border-t border-dashed border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-500">
            <span className="flex items-center gap-1">
              <Plane size={11} className="text-neutral-500" />
              FLIGHT NO. COFFEE-01
            </span>
            <span>GATE OPEN // AIRPORT MATRIX</span>
          </div>
        </div>
      </div>
    </div>
  );
};
