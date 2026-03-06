
import React from 'react';
import { AppState } from '../types';
import { Card, Button, Badge } from '../components/UI';
import { DownloadIcon, DatabaseIcon, Trash2Icon, RefreshCwIcon } from '../components/Icons';

export const DatabasePage: React.FC<{ state: AppState, setState: any, showToast: any }> = ({ state, setState, showToast }) => {
  
  const handleReset = () => {
    if (confirm("ATTENTION : Cela supprimera TOUTES les données de l'application. Continuer ?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleClearImages = () => {
    if (confirm("Voulez-vous supprimer toutes les images d'exercices générées par IA ? Cela libérera beaucoup d'espace.")) {
      setState((s: AppState) => ({
        ...s,
        exercises: s.exercises.map(ex => ({ ...ex, photo: null }))
      }));
      showToast("Images supprimées", "success");
    }
  };

  const handleClearLogs = () => {
    if (confirm("Voulez-vous supprimer tout l'historique des séances ?")) {
      setState((s: AppState) => ({
        ...s,
        logs: []
      }));
      showToast("Historique vidé", "success");
    }
  };

  const storageSize = Math.round(JSON.stringify(state).length / 1024);
  const isCritical = storageSize > 4000; // LocalStorage limit is usually ~5000KB

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Système & Maintenance</h1>
      
      <Card className={`${isCritical ? 'border-red-500 bg-red-500/10' : 'border-natif-border'} space-y-4`}>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold">
              <DatabaseIcon className={isCritical ? 'text-red-500' : 'text-natif-blue'} /> 
              État du stockage local
           </div>
           <Badge variant={isCritical ? 'accent' : 'blue'}>
             {storageSize} KB / 5000 KB
           </Badge>
        </div>
        <div className="h-2 bg-natif-bg rounded-full overflow-hidden border border-natif-border/50">
           <div 
             className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-natif-blue'}`} 
             style={{ width: `${Math.min(100, (storageSize / 5000) * 100)}%` }} 
           />
        </div>
        {isCritical && (
          <p className="text-xs text-red-400 font-bold">
            Attention : L'espace est presque saturé. L'application risque de ne plus pouvoir enregistrer vos progrès.
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-4">
           <div className="flex items-center gap-2 font-bold">
              <RefreshCwIcon size={18} className="text-natif-accent" /> Nettoyage ciblé
           </div>
           <p className="text-xs text-natif-textMuted">Supprimez les éléments lourds pour libérer de l'espace sans perdre vos membres.</p>
           <div className="space-y-2">
             <Button variant="secondary" fullWidth onClick={handleClearImages} className="text-xs !py-2">
                Supprimer les images IA
             </Button>
             <Button variant="secondary" fullWidth onClick={handleClearLogs} className="text-xs !py-2">
                Vider l'historique des séances
             </Button>
           </div>
        </Card>

        <Card className="space-y-4">
           <div className="flex items-center gap-2 font-bold">
              <DownloadIcon size={18} className="text-natif-success" /> Sauvegarde
           </div>
           <p className="text-xs text-natif-textMuted">Générez un fichier Excel contenant l'intégralité des données avant toute maintenance.</p>
           <Button variant="success" fullWidth onClick={() => (window as any).exportExcel?.()}>
              Exporter Excel
           </Button>
        </Card>
      </div>

      <Card className="bg-red-500/5 border-red-500/20 space-y-4 mt-8">
        <div className="flex items-center gap-3 text-red-500">
           <Trash2Icon size={24} />
           <div className="font-bold">Zone de danger</div>
        </div>
        <p className="text-xs text-natif-textMuted">
          Cette action est irréversible. Elle efface TOUT : membres, programmes, records et photos.
        </p>
        <Button variant="danger" fullWidth onClick={handleReset}>
           RÉINITIALISER TOUTE L'APP
        </Button>
      </Card>
    </div>
  );
};
