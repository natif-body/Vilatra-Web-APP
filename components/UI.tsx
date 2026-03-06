
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`glass-card rounded-2xl p-5 transition-all duration-300 ${className} ${onClick ? 'cursor-pointer hover:border-natif-accent/50 hover:shadow-2xl hover:shadow-natif-accent/10 active:scale-[0.98]' : ''}`}
  >
    {children}
  </div>
);

export const StatBox: React.FC<{ label: string, value: string | number, className?: string, icon?: React.ReactNode, onClick?: () => void }> = ({ label, value, className = "", icon, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center transition-all ${onClick ? 'cursor-pointer hover:scale-105 hover:border-natif-accent/50' : ''} ${className}`}
  >
    {icon && <div className="text-natif-accent mb-2 opacity-80">{icon}</div>}
    <span className="text-[9px] uppercase tracking-[2px] font-extrabold text-natif-textDark mb-1">{label}</span>
    <span className="text-2xl font-black text-white tracking-tighter">{value}</span>
  </div>
);

export const Button: React.FC<{ 
  children: React.ReactNode, 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'blue' | 'glass',
  className?: string, 
  onClick?: () => void,
  disabled?: boolean,
  fullWidth?: boolean,
  type?: "button" | "submit" | "reset"
}> = ({ children, variant = 'primary', className = "", onClick, disabled, fullWidth, type = "button" }) => {
  const variants = {
    primary: 'bg-gradient-to-br from-natif-accent to-natif-accentDark text-white shadow-xl shadow-natif-accent/20 hover:brightness-110',
    secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 shadow-md',
    danger: 'bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700',
    success: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700',
    blue: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700',
    glass: 'glass text-white border-white/20 hover:bg-white/10',
    ghost: 'bg-transparent text-natif-textMuted hover:text-white hover:bg-white/5'
  };

  return (
    <button 
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        px-5 py-3.5 rounded-xl font-bold text-[13px] tracking-wide uppercase
        flex items-center justify-center transition-all duration-300
        disabled:opacity-30 disabled:cursor-not-allowed
        ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className={`
      w-full p-4 bg-white/5 border border-white/10 rounded-xl 
      text-white text-[15px] placeholder:text-natif-textDark
      focus:outline-none focus:border-natif-accent focus:ring-4 focus:ring-natif-accent/10 transition-all
      ${props.className || ''}
    `}
  />
);

export const Badge: React.FC<{ children: React.ReactNode, variant?: 'accent' | 'blue' | 'orange' | 'success' | 'dark', className?: string }> = ({ children, variant = 'accent', className = "" }) => {
  const colors = {
    accent: 'bg-natif-accent/15 text-natif-accent border-natif-accent/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dark: 'bg-black/40 text-natif-textDark border-white/5'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${colors[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const SessionDot: React.FC<{ isCoaching: boolean, size?: number }> = ({ isCoaching, size = 10 }) => (
  <div 
    className="rounded-full flex-shrink-0 animate-pulse" 
    style={{ 
      width: size, 
      height: size, 
      backgroundColor: isCoaching ? '#ef4444' : '#3b82f6',
      boxShadow: `0 0 15px ${isCoaching ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)'}`
    }} 
  />
);
