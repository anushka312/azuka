import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { X, Activity, Camera, Heart, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'symptom' | 'workout' | 'food' | 'mood') => void;
}

export function QuickLogModal({ isOpen, onClose, onSelectType }: QuickLogModalProps) {
  const options = [
    {
      type: 'symptom' as const,
      icon: Heart,
      label: 'Log Symptoms',
      color: '#BB8585',
      description: 'Track pain, cravings, mood',
    },
    {
      type: 'workout' as const,
      icon: Activity,
      label: 'Log Workout',
      color: '#29555F',
      description: 'Record completed exercise',
    },
    {
      type: 'food' as const,
      icon: Camera,
      label: 'Scan Food',
      color: '#83965F',
      description: 'Capture meal with camera',
    },
    {
      type: 'mood' as const,
      icon: Heart,
      label: 'Log Mood',
      color: '#BB8585',
      description: 'Quick emotional check-in',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#1C3927]">Quick Log</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/50 transition-colors"
                >
                  <X className="w-5 h-5 text-[#83965F]" />
                </button>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-3">
                {options.map((option, i) => (
                  <motion.button
                    key={option.type}
                    onClick={() => {
                      onSelectType(option.type);
                      onClose();
                    }}
                    className="p-4 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/40 text-left hover:bg-white/70 transition-all"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${option.color}20` }}
                    >
                      <option.icon className="w-6 h-6" style={{ color: option.color }} />
                    </div>
                    <p className="font-medium text-[#1C3927] mb-1">{option.label}</p>
                    <p className="text-xs text-[#83965F]">{option.description}</p>
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
