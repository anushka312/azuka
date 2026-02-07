import React from 'react';
import { cn } from '../components/ui/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  glowColor?: string;
}

export function GlassCard({ children, className, glow = false, glowColor }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl backdrop-blur-xl bg-white/60 border border-white/40",
        "shadow-[0_8px_32px_0_rgba(131,150,95,0.1)]",
        glow && "before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:-z-10",
        glow && glowColor === 'rose' && "before:bg-gradient-to-br before:from-[#BB8585]/30 before:to-transparent",
        glow && glowColor === 'teal' && "before:bg-gradient-to-br before:from-[#29555F]/30 before:to-transparent",
        glow && glowColor === 'sage' && "before:bg-gradient-to-br before:from-[#83965F]/30 before:to-transparent",
        className
      )}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </div>
  );
}

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function GlassButton({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: GlassButtonProps) {
  return (
    <button
      className={cn(
        "relative rounded-full backdrop-blur-xl border transition-all duration-200",
        "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variant === 'primary' && "bg-[#29555F]/80 text-white border-[#29555F]/50 hover:bg-[#29555F]/90",
        variant === 'secondary' && "bg-white/60 text-[#1C3927] border-white/40 hover:bg-white/70",
        variant === 'ghost' && "bg-transparent text-[#1C3927] border-transparent hover:bg-white/30",
        size === 'sm' && "px-4 py-2 text-sm",
        size === 'md' && "px-6 py-3",
        size === 'lg' && "px-8 py-4 text-lg",
        className
      )}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      {...props}
    >
      {children}
    </button>
  );
}
