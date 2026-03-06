
import React from 'react';
import { AppState } from '../types';
import { Card, Badge } from '../components/UI';
import { HistoryIcon, DumbbellIcon, CalendarIcon } from '../components/Icons';

export const HistoryPage: React.FC<{ state: AppState; setState: any }> = ({ state }) => {
  const user = state.user!;
  const archives = user.role === 'coach' 
    ? state.archivedPrograms 
    : state.archivedPrograms.filter(p => p.memberId === user.id);

  return (
    <div className="space-y-6 page-transition">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white italic">Historique <span className="text-natif-accent">{state.studio?.name || 'VELATRA'}</span></h1>
          <p className="text-[10px] text-natif-textDark font-black uppercase tracking-[4px]">{archives.length} Cycles archivés</p>
        </div>
      </div>

      <div className="space-y-4">
        {archives.length === 0 ? (
          <Card className="py-20 text-center opacity-30 italic font-medium bg-transparent border-dashed border-white/10">
            Aucun programme archivé. Terminez un cycle de 7 semaines pour le voir ici.
          </Card>
        ) : (
          archives.map((prog) => {
            const member = state.users.find(u => u.id === prog.memberId);
            return (
              <Card key={prog.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5 bg-[#0a0a0a] hover:border-natif-accent/20 !p-8 group transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-natif-textDark group-hover:text-natif-accent transition-colors">
                    <HistoryIcon size={32} />
                  </div>
                  <div>
                    <div className="font-black text-xl text-white uppercase italic tracking-tighter">{prog.name}</div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-natif-textDark font-black uppercase tracking-widest mt-2">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon size={12} /> FINI LE : {new Date((prog as any).endDate || Date.now()).toLocaleDateString()}
                      </div>
                      {user.role === 'coach' && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-natif-accent">•</span> ATHLÈTE : {(prog as any).memberName || member?.name || 'Inconnu'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <Badge variant="success" className="!bg-emerald-500/10 !text-emerald-500 !border-emerald-500/20 italic">CYCLE 7 SEM. VALIDÉ</Badge>
                   <button className="text-[10px] font-black uppercase tracking-widest text-natif-textDark hover:text-white transition-colors">Détails</button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
