
import React from 'react';
import { User, Page, Studio } from '../types';
import { 
  HomeIcon, UsersIcon, LayersIcon, BarChartIcon, 
  DumbbellIcon, InfoIcon, LogOutIcon, GiftIcon, TargetIcon, CalendarIcon, HistoryIcon, DatabaseIcon, ShoppingCartIcon, TimerIcon, XIcon, MegaphoneIcon, BotIcon
} from './Icons';
import { Timber } from './Timber';

interface LayoutProps {
  user: User;
  studio: Studio | null;
  activePage: Page;
  onPageChange: (p: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const LogoVelatra = ({ studio }: { studio: Studio | null }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-natif-accent rounded-lg flex items-center justify-center rotate-3 shadow-lg shadow-natif-accent/20">
        <span className="font-black text-white text-xl tracking-tighter">{studio?.name ? studio.name.charAt(0).toUpperCase() : 'V'}</span>
      </div>
      <div className="font-black text-2xl tracking-tighter leading-none text-white italic">{studio?.name ? studio.name.toUpperCase() : 'VELATRA'}</div>
    </div>
    <div className="text-[8px] tracking-[6px] text-natif-textDark font-black uppercase mt-1 pl-10 opacity-80">PREMIUM CLUB</div>
  </div>
);

export const Layout: React.FC<LayoutProps> = ({ user, studio, activePage, onPageChange, onLogout, children }) => {
  const coachItems = [
    { id: 'home', icon: HomeIcon, label: 'Tableau' },
    { id: 'users', icon: UsersIcon, label: 'Membres' },
    { id: 'prospects', icon: TargetIcon, label: 'Prospects' },
    { id: 'presets', icon: LayersIcon, label: 'Modèles' },
    { id: 'supplements', icon: GiftIcon, label: 'Boutique' },
    { id: 'marketing', icon: MegaphoneIcon, label: 'Marketing' },
    { id: 'exercises', icon: DumbbellIcon, label: 'Exos' },
    { id: 'history', icon: HistoryIcon, label: 'Archives' },
    { id: 'about', icon: InfoIcon, label: 'Club' },
    { id: 'database', icon: DatabaseIcon, label: 'Système' },
  ];

  const memberItems = [
    { id: 'home', icon: HomeIcon, label: 'Espace' },
    { id: 'calendar', icon: CalendarIcon, label: 'Séance' },
    { id: 'performances', icon: BarChartIcon, label: 'Records' },
    { id: 'ai_coach', icon: BotIcon, label: 'Coach IA' },
    { id: 'supplements', icon: ShoppingCartIcon, label: 'Boutique' },
    { id: 'loyalty', icon: GiftIcon, label: 'Cadeaux' },
    { id: 'history', icon: HistoryIcon, label: 'Archives' },
    { id: 'about', icon: InfoIcon, label: 'Club' },
  ];

  const menuItems = user.role === 'coach' ? coachItems : memberItems;
  const [showTimber, setShowTimber] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505]">
      <aside className="hidden md:flex flex-col w-[280px] bg-[#0a0a0a] border-r border-white/5 h-screen fixed left-0 top-0 py-12 px-8 z-40">
        <div className="mb-12 px-2">
           <LogoVelatra studio={studio} />
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => onPageChange(item.id as Page)}
              className={`
                flex items-center gap-4 px-5 py-4 rounded-2xl w-full transition-all duration-300 group
                ${activePage === item.id ? 'bg-natif-accent text-white shadow-xl shadow-natif-accent/20 scale-[1.02]' : 'text-natif-textDark hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon size={20} strokeWidth={activePage === item.id ? 2.5 : 2} className={`${activePage === item.id ? '' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-white/5">
            <button 
              onClick={() => setShowTimber(!showTimber)}
              className={`
                flex items-center gap-4 px-5 py-4 rounded-2xl w-full transition-all duration-300 group
                ${showTimber ? 'bg-white/10 text-white' : 'text-natif-textDark hover:text-white hover:bg-white/5'}
              `}
            >
              <TimerIcon size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Timber</span>
            </button>
          </div>
        </nav>

        <button onClick={onLogout} className="mt-6 flex items-center gap-4 px-5 py-4 rounded-2xl w-full text-natif-textDark hover:text-red-500 transition-all hover:bg-red-500/5 group">
          <LogOutIcon size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Quitter</span>
        </button>
      </aside>

      <main className="flex-1 md:ml-[280px] min-h-screen relative">
        <div className="p-4 md:p-12 max-w-6xl mx-auto pb-32 md:pb-12">
          {children}
        </div>

        {showTimber && (
          <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[100] animate-in slide-in-from-bottom-10 duration-500">
            <div className="relative">
              <button 
                onClick={() => setShowTimber(false)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center z-10 shadow-lg hover:scale-110 transition-transform"
              >
                <XIcon size={12} />
              </button>
              <Timber />
            </div>
          </div>
        )}

        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] h-18 bg-[#111111]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] flex items-center justify-around z-50 px-3 shadow-2xl">
          {menuItems.slice(0, 4).map(item => (
            <button 
              key={item.id}
              onClick={() => onPageChange(item.id as Page)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative py-2 ${activePage === item.id ? 'text-natif-accent scale-110' : 'text-natif-textDark opacity-40'}`}
            >
              <item.icon size={22} strokeWidth={activePage === item.id ? 2.5 : 2} />
            </button>
          ))}
          <button 
            onClick={() => setShowTimber(!showTimber)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative py-2 ${showTimber ? 'text-natif-accent scale-110' : 'text-natif-textDark opacity-40'}`}
          >
            <TimerIcon size={22} />
          </button>
          <button onClick={onLogout} className="text-natif-textDark opacity-40 p-2"><LogOutIcon size={22}/></button>
        </nav>
      </main>
    </div>
  );
};
