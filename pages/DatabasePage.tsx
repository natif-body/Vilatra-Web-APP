
import React, { useState } from 'react';
import { AppState } from '../types';
import { Card, Button, Badge } from '../components/UI';
import { DownloadIcon, DatabaseIcon, Trash2Icon, RefreshCwIcon, UsersIcon, InfoIcon, CopyIcon, CheckIcon } from '../components/Icons';

export const DatabasePage: React.FC<{ state: AppState, setState: any, showToast: any }> = ({ state, setState, showToast }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const { studio } = state;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      showToast(`Code ${label} copié !`, 'success');
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleClearImages = () => {
    if (confirm("Voulez-vous supprimer toutes les images d'exercices ? Cela libérera de l'espace.")) {
      setState((s: AppState) => ({
        ...s,
        exercises: s.exercises.map(ex => ({ ...ex, photo: null }))
      }));
      showToast("Images supprimées", "success");
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-2xl font-black">Système & Paramètres</h1>

      {/* Codes d'invitation du studio */}
      {studio && (
        <Card className="space-y-5 border-natif-accent/20 bg-natif-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-natif-accent/10 rounded-xl text-natif-accent">
              <InfoIcon size={20} />
            </div>
            <div>
              <h2 className="font-black text-lg">Codes d'invitation</h2>
              <p className="text-[10px] uppercase tracking-widest text-natif-textDark font-black">Studio : {studio.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code Membres */}
            <div className="bg-black/40 rounded-2xl p-5 space-y-3 border border-white/10">
              <div className="flex items-center gap-2">
                <UsersIcon size={16} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Code Membres</span>
              </div>
              <div className="text-3xl font-black tracking-widest text-white">{studio.code}</div>
              <p className="text-[10px] text-natif-textDark leading-relaxed">
                Partagez ce code avec vos membres pour qu'ils créent leur compte.
              </p>
              <button
                onClick={() => copyToClipboard(studio.code, 'membre')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
              >
                {copied === 'membre' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                {copied === 'membre' ? 'COPIÉ !' : 'COPIER'}
              </button>
            </div>

            {/* Code Coachs */}
            <div className="bg-black/40 rounded-2xl p-5 space-y-3 border border-white/10">
              <div className="flex items-center gap-2">
                <DatabaseIcon size={16} className="text-natif-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-natif-accent">Code Coachs</span>
              </div>
              <div className="text-3xl font-black tracking-widest text-white">
                {studio.coachCode || <span className="text-natif-textDark text-base">Non défini</span>}
              </div>
              <p className="text-[10px] text-natif-textDark leading-relaxed">
                Partagez ce code uniquement avec vos coachs pour leur donner accès au tableau de bord.
              </p>
              {studio.coachCode && (
                <button
                  onClick={() => copyToClipboard(studio.coachCode!, 'coach')}
                  className="flex items-center gap-2 px-4 py-2 bg-natif-accent/10 text-natif-accent rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-natif-accent/20 transition-all"
                >
                  {copied === 'coach' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                  {copied === 'coach' ? 'COPIÉ !' : 'COPIER'}
                </button>
              )}
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-[10px] text-yellow-400 font-black uppercase tracking-widest mb-1">⚠ Confidentialité</p>
            <p className="text-[10px] text-natif-textDark leading-relaxed">
              Ne partagez jamais le code coach avec des membres. Ce code donne accès à la gestion complète du studio.
            </p>
          </div>
        </Card>
      )}

      {/* Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-4">
          <div className="flex items-center gap-2 font-bold">
            <RefreshCwIcon size={18} className="text-natif-accent" /> Nettoyage
          </div>
          <p className="text-xs text-natif-textMuted">Supprimez les images lourdes pour libérer de l'espace.</p>
          <Button variant="secondary" fullWidth onClick={handleClearImages} className="text-xs !py-2">
            Supprimer les images IA
          </Button>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2 font-bold">
            <DownloadIcon size={18} className="text-natif-success" /> Sauvegarde
          </div>
          <p className="text-xs text-natif-textMuted">Exportez les données de votre studio en Excel.</p>
          <Button variant="success" fullWidth onClick={() => (window as any).exportExcel?.()}>
            Exporter Excel
          </Button>
        </Card>
      </div>
    </div>
  );
};
