
import React from 'react';
import { AppState } from '../types';
import { Card, Button, Badge } from '../components/UI';
import { PlayIcon, CalendarIcon } from '../components/Icons';

export const CalendarPage: React.FC<{ state: AppState, setState: any }> = ({ state, setState }) => {
  const user = state.user!;
  const program = state.programs.find(p => p.memberId === user.id);

  if (!program) {
    return (
      <div className="py-20 text-center opacity-50">
         Aucun programme actif. Contactez votre coach.
      </div>
    );
  }

  const startSession = (dayIdx: number) => {
    setState((s: AppState) => ({ 
      ...s, 
      workout: { ...program, currentDayIndex: dayIdx },
      workoutMember: user
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black">Mon Programme</h1>
        <Badge variant="blue">{program.name}</Badge>
      </div>

      <div className="space-y-4">
        {program.days.map((day, idx) => (
          <Card key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-natif-bg border border-natif-border flex items-center justify-center font-bold text-natif-textMuted group-hover:text-natif-accent group-hover:border-natif-accent transition-colors">
                {idx + 1}
              </div>
              <div>
                <div className="font-bold">{day.name}</div>
                <div className="text-[10px] text-natif-textMuted uppercase tracking-widest">
                  {day.exercises.length} Exercices • {day.isCoaching ? 'Coaching' : 'Autonome'}
                </div>
              </div>
            </div>
            <Button variant={day.isCoaching ? 'danger' : 'primary'} className="!p-3 !rounded-full" onClick={() => startSession(idx)}>
               <PlayIcon size={20} />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
