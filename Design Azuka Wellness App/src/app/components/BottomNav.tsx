import React from 'react';
import { Home, Dumbbell, Utensils, Brain, Plus } from 'lucide-react';
import { cn } from './ui/utils';

interface BottomNavProps {
  activeTab: 'home' | 'workout' | 'food' | 'mindset';
  onTabChange: (tab: 'home' | 'workout' | 'food' | 'mindset') => void;
  onQuickLog: () => void;
}

export function BottomNav({ activeTab, onTabChange, onQuickLog }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'workout' as const, label: 'Workout', icon: Dumbbell },
    { id: 'food' as const, label: 'Food', icon: Utensils },
    { id: 'mindset' as const, label: 'Mindset', icon: Brain },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4 pb-6">
        <div 
          className="relative rounded-3xl backdrop-blur-2xl bg-white/70 border border-white/50 shadow-[0_8px_32px_0_rgba(131,150,95,0.15)] p-2"
          style={{
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="flex items-center justify-around relative">
            {tabs.slice(0, 2).map((tab) => (
              <NavButton
                key={tab.id}
                {...tab}
                active={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
              />
            ))}
            
            {/* Floating center button */}
            <button
              onClick={onQuickLog}
              className="relative -mt-8 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#29555F] to-[#1C3927] text-white shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
            >
              <Plus className="w-7 h-7" />
            </button>
            
            {tabs.slice(2).map((tab) => (
              <NavButton
                key={tab.id}
                {...tab}
                active={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon: Icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-6 py-3 rounded-2xl transition-all duration-200",
        active 
          ? "text-[#29555F] bg-white/60" 
          : "text-[#83965F] hover:text-[#29555F] hover:bg-white/30"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
