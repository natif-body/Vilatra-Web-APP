
import React from 'react';
import { AppState } from '../types';
import { Card, Badge } from '../components/UI';
import { TrophyIcon, CheckIcon } from '../components/Icons';

export const TrophyPage: React.FC<{ state: AppState, setState: any }> = ({ state }) => {
  const user = state.user!;
  const sessions = state.logs.filter(l => l.memberId === user.id).length;

  const milestones = [
    { title: "Débutant", target: 1, desc: "Première séance validée" },
    { title: "Régulier", target: 10, desc: "Le sport devient une habitude" },
    { title: "Déterminé", target: 25, desc: "Membre Fidèle du club" },
    { title: "Guerrier", target: 50, desc: "Statut VIP atteint" },
    { title: "Légende", target: 100, desc: "Inspiration pour tout le club" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-block p-4 bg-natif-warning/10 rounded-full">
           <TrophyIcon size={48} className="text-natif-warning" />
        </div>
        <h1 className="text-2xl font-black">Tableau des Trophées</h1>
        <p className="text-natif-textMuted text-sm">Validé {sessions} séances à ce jour</p>
      </div>

      <div className="space-y-4">
        {milestones.map((m, i) => {
          const unlocked = sessions >= m.target;
          return (
            <Card key={i} className={`flex items-center gap-4 ${!unlocked ? 'opacity-40 grayscale' : 'border-natif-warning'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${unlocked ? 'bg-natif-warning text-natif-bg' : 'bg-natif-bg border border-natif-border text-natif-textDark'}`}>
                {unlocked ? <CheckIcon size={24} /> : m.target}
              </div>
              <div className="flex-1">
                <div className="font-bold flex items-center gap-2">
                   {m.title} 
                   {unlocked && <Badge variant="orange">Débloqué</Badge>}
                </div>
                <div className="text-xs text-natif-textMuted">{m.desc}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
