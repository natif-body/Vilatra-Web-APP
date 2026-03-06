
import React, { useState } from 'react';
import { AppState, Prospect, User, Goal } from '../types';
import { Card, Button, Input, Badge } from '../components/UI';
import { 
  TargetIcon, PlusIcon, Trash2Icon, CheckIcon, XIcon, 
  SearchIcon, CalendarIcon, PhoneIcon, MailIcon, UserIcon,
  ChevronRightIcon, ClipboardIcon, SparklesIcon
} from '../components/Icons';
import { db, doc, setDoc, deleteDoc, updateDoc } from '../firebase';
import { GOALS } from '../constants';
import { DiscoveryForm } from '../components/DiscoveryForm';

export const ProspectsPage: React.FC<{ state: AppState, setState: any, showToast: any }> = ({ state, setState, showToast }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  // Form State
  const [newProspect, setNewProspect] = useState<Partial<Prospect>>({
    name: "",
    email: "",
    phone: "",
    answers: {},
    status: 'pending'
  });

  const handleSaveProspect = async () => {
    if (!newProspect.name || !newProspect.email) {
      showToast("Nom et Email requis", "error");
      return;
    }

    const id = Date.now();
    const prospect: Prospect = {
      id,
      studioId: state.user!.studioId,
      name: newProspect.name!,
      email: newProspect.email!,
      phone: newProspect.phone || "",
      date: new Date().toISOString(),
      status: 'pending',
      answers: newProspect.answers || {},
      notes: newProspect.notes || ""
    };

    try {
      await setDoc(doc(db, "prospects", id.toString()), prospect);
      showToast("Prospect enregistré !");
      setShowForm(false);
      setNewProspect({ name: "", email: "", phone: "", answers: {}, status: 'pending' });
    } catch (err) {
      showToast("Erreur d'enregistrement", "error");
    }
  };

  const handleDeleteProspect = async (id: number) => {
    if (confirm("Supprimer ce prospect ?")) {
      try {
        await deleteDoc(doc(db, "prospects", id.toString()));
        showToast("Prospect supprimé");
        if (selectedProspect?.id === id) setSelectedProspect(null);
      } catch (err) {
        showToast("Erreur", "error");
      }
    }
  };

  const handleConvertToMember = async (prospect: Prospect) => {
    if (confirm(`Convertir ${prospect.name} en adhérent ?`)) {
      const userId = Date.now();
      const newUser: User = {
        id: userId,
        code: prospect.email.split('@')[0],
        pwd: "velatra" + Math.floor(Math.random() * 1000),
        name: prospect.name,
        role: "member",
        avatar: prospect.name.substring(0, 2).toUpperCase(),
        gender: "M", // Default
        age: 25,
        weight: 70,
        height: 175,
        objectifs: (prospect.answers.objectifs ? [prospect.answers.objectifs as Goal] : []),
        notes: `Ancien prospect. Notes: ${prospect.notes || ""}. Réponses: ${JSON.stringify(prospect.answers)}`,
        createdAt: new Date().toISOString(),
        xp: 0,
        streak: 0,
        pointsFidelite: 0
      };

      try {
        await setDoc(doc(db, "users", userId.toString()), newUser);
        await updateDoc(doc(db, "prospects", prospect.id.toString()), { status: 'converted' });
        showToast(`${prospect.name} est maintenant adhérent !`);
        setSelectedProspect(null);
      } catch (err) {
        showToast("Erreur de conversion", "error");
      }
    }
  };

  const filteredProspects = state.prospects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (showForm) {
    return (
      <DiscoveryForm 
        onCancel={() => setShowForm(false)} 
        onSuccess={() => {
          showToast("Prospect enregistré !");
          setShowForm(false);
        }} 
      />
    );
  }

  return (
    <div className="space-y-8 page-transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2">Gestion <span className="text-natif-accent">Prospects</span></h1>
          <p className="text-natif-textDark text-[10px] uppercase tracking-[4px] font-black">Séances Découverte & Conversion</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)} className="!rounded-2xl !py-3">
          <PlusIcon size={18} className="mr-2" /> NOUVEAU PROSPECT
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LISTE */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-natif-textDark" size={16} />
            <Input 
              placeholder="Chercher un prospect..." 
              className="pl-12 !bg-white/5" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
            {filteredProspects.map(p => (
              <Card 
                key={p.id} 
                onClick={() => setSelectedProspect(p)}
                className={`!p-4 border border-white/5 transition-all cursor-pointer ${selectedProspect?.id === p.id ? 'bg-natif-accent/10 border-natif-accent' : 'bg-white/[0.02] hover:bg-white/5'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${p.status === 'converted' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-natif-accent/20 text-natif-accent'}`}>
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white uppercase italic">{p.name}</div>
                      <div className="text-[9px] text-natif-textDark font-black uppercase tracking-widest mt-0.5">
                        {new Date(p.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={p.status === 'converted' ? 'success' : 'accent'}>
                    {p.status === 'converted' ? 'ADHERENT' : 'PROSPECT'}
                  </Badge>
                </div>
              </Card>
            ))}
            {filteredProspects.length === 0 && (
              <div className="text-center py-12 text-natif-textDark italic text-sm">Aucun prospect trouvé</div>
            )}
          </div>
        </div>

        {/* DETAILS */}
        <div className="lg:col-span-7">
          {selectedProspect ? (
            <Card className="!p-8 space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-natif-accent to-natif-accentDark flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-natif-accent/20">
                    {selectedProspect.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase italic text-white leading-none">{selectedProspect.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                       <div className="flex items-center gap-1 text-[10px] text-natif-textDark font-black uppercase tracking-widest">
                          <CalendarIcon size={12} /> {new Date(selectedProspect.date).toLocaleDateString()}
                       </div>
                       <div className="w-1 h-1 bg-white/10 rounded-full" />
                       <Badge variant={selectedProspect.status === 'converted' ? 'success' : 'accent'}>
                          {selectedProspect.status === 'converted' ? 'CONVERTI' : 'EN ATTENTE'}
                       </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleDeleteProspect(selectedProspect.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 transition-all hover:text-white">
                      <Trash2Icon size={20} />
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                    <MailIcon size={18} className="text-natif-accent" />
                    <div className="text-xs font-bold text-white truncate">{selectedProspect.email}</div>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                    <PhoneIcon size={18} className="text-natif-accent" />
                    <div className="text-xs font-bold text-white">{selectedProspect.phone || "Non renseigné"}</div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-sm font-black uppercase italic text-natif-accent flex items-center gap-2">
                    <SparklesIcon size={18} className="text-blue-400" /> Stratégie de Conversion
                 </h3>
                 <div className="p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/5 border border-blue-500/20 rounded-2xl space-y-4">
                    <div className="flex items-start gap-3">
                       <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                          <span className="text-[10px] font-black">1</span>
                       </div>
                       <p className="text-xs text-white/80 leading-relaxed">
                          <span className="font-bold text-blue-400">Levier émotionnel :</span> Appuyez sur sa vision : <span className="italic">"{selectedProspect.answers.vision || "..."}"</span>. Rappelez-lui pourquoi il/elle a besoin de changer <span className="font-bold underline">maintenant</span>.
                       </p>
                    </div>
                    <div className="flex items-start gap-3">
                       <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                          <span className="text-[10px] font-black">2</span>
                       </div>
                       <p className="text-xs text-white/80 leading-relaxed">
                          <span className="font-bold text-blue-400">Solution {state.studio?.name || 'Velatra'} :</span> Montrez comment vous allez lever son frein principal : <span className="italic">"{selectedProspect.answers.pain_points || "..."}"</span>.
                       </p>
                    </div>
                    <div className="flex items-start gap-3">
                       <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                          <span className="text-[10px] font-black">3</span>
                       </div>
                       <p className="text-xs text-white/80 leading-relaxed">
                          <span className="font-bold text-blue-400">Engagement :</span> Sa motivation est de <span className="font-bold text-natif-accent">{selectedProspect.answers.motivation || "?"}/10</span>. S'il/elle hésite, demandez-lui ce qu'il manque pour passer à 10.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-sm font-black uppercase italic text-natif-accent flex items-center gap-2">
                    <ClipboardIcon size={18} /> Réponses Questionnaire
                 </h3>
                 <div className="grid grid-cols-1 gap-3">
                    {Object.entries(selectedProspect.answers).map(([key, val]) => (
                      <div key={key} className="p-4 bg-black border border-white/5 rounded-2xl">
                         <div className="text-[8px] font-black uppercase text-natif-textDark tracking-widest mb-1">{key}</div>
                         <div className="text-xs font-bold text-white italic">{val || "Non renseigné"}</div>
                      </div>
                    ))}
                 </div>
              </div>

              {selectedProspect.status !== 'converted' && (
                <div className="pt-6 border-t border-white/5 flex gap-4">
                   <Button variant="success" fullWidth onClick={() => handleConvertToMember(selectedProspect)} className="!py-4 font-black italic">
                      <CheckIcon size={20} className="mr-2" /> CONVERTIR EN ADHÉRENT
                   </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/[0.02] rounded-[32px] border border-dashed border-white/10">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-natif-textDark mb-6">
                  <UserIcon size={40} />
               </div>
               <h3 className="text-lg font-black uppercase italic text-white mb-2">Sélectionnez un prospect</h3>
               <p className="text-xs text-natif-textDark font-bold max-w-xs">Consultez les réponses au questionnaire et convertissez-les en adhérents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
