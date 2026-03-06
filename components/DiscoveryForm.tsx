
import React, { useState } from 'react';
import { Prospect, Goal } from '../types';
import { Card, Button, Input } from './UI';
import { XIcon, TargetIcon } from './Icons';
import { GOALS } from '../constants';
import { db, doc, setDoc } from '../firebase';

export const DiscoveryForm: React.FC<{ onCancel: () => void, onSuccess: () => void }> = ({ onCancel, onSuccess }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [newProspect, setNewProspect] = useState<Partial<Prospect>>({
    name: "",
    email: "",
    phone: "",
    answers: {},
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);

  const progress = (step / totalSteps) * 100;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSaveProspect = async () => {
    if (!newProspect.name || !newProspect.email) {
      alert("Nom et Email requis");
      return;
    }

    setLoading(true);
    const id = Date.now();
    const prospect: Prospect = {
      id,
      name: newProspect.name!,
      email: newProspect.email!,
      phone: newProspect.phone || "",
      date: new Date().toISOString(),
      status: 'pending',
      answers: newProspect.answers || {},
      notes: "Rempli via formulaire public"
    };

    try {
      await setDoc(doc(db, "prospects", id.toString()), prospect);
      onSuccess();
    } catch (err) {
      alert("Erreur d'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col overflow-y-auto p-4 md:p-12">
      <div className="max-w-2xl mx-auto w-full space-y-8 py-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-natif-accent rounded-xl flex items-center justify-center rotate-3">
                <span className="font-black text-white text-xl">N</span>
              </div>
              <h1 className="text-2xl font-black uppercase italic">Fiche Découverte</h1>
            </div>
            <button onClick={onCancel} className="p-2 bg-white/5 rounded-full text-natif-textDark hover:text-white">
              <XIcon size={24} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-natif-textDark">
              <span>Étape {step} sur {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-natif-accent transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>

        <Card className="!p-8 space-y-6 bg-[#0a0a0a] border-white/5 shadow-2xl">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h3 className="text-sm font-black uppercase italic text-natif-accent">1. Votre Identité</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Nom Complet</label>
                  <Input 
                    value={newProspect.name} 
                    onChange={e => setNewProspect({...newProspect, name: e.target.value})}
                    placeholder="Ex: Jean Dupont"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Email</label>
                  <Input 
                    value={newProspect.email} 
                    onChange={e => setNewProspect({...newProspect, email: e.target.value})}
                    placeholder="jean@mail.com"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Téléphone</label>
                <Input 
                  value={newProspect.phone} 
                  onChange={e => setNewProspect({...newProspect, phone: e.target.value})}
                  placeholder="06..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Âge</label>
                  <Input type="number" value={newProspect.answers?.age || ""} onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, age: e.target.value}})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Profession</label>
                  <Input value={newProspect.answers?.job || ""} onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, job: e.target.value}})} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h3 className="text-sm font-black uppercase italic text-natif-accent">2. Morphologie & Santé</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Poids (kg)</label>
                  <Input type="number" value={newProspect.answers?.weight || ""} onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, weight: e.target.value}})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Taille (cm)</label>
                  <Input type="number" value={newProspect.answers?.height || ""} onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, height: e.target.value}})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Antécédents / Blessures / Douleurs</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-natif-accent outline-none h-24 resize-none"
                  value={newProspect.answers?.health || ""}
                  onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, health: e.target.value}})}
                  placeholder="Dos, genoux, opérations récentes..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Prenez-vous des médicaments ?</label>
                <Input value={newProspect.answers?.meds || ""} onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, meds: e.target.value}})} placeholder="Si oui, lesquels ?" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h3 className="text-sm font-black uppercase italic text-natif-accent flex items-center gap-2">
                <TargetIcon size={18} /> 3. Objectifs & Motivations
              </h3>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Quel est votre objectif n°1 ?</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-natif-accent outline-none"
                  value={newProspect.answers?.objectifs || ""}
                  onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, objectifs: e.target.value}})}
                >
                  <option value="">Sélectionner l'objectif prioritaire...</option>
                  {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Pourquoi est-ce crucial MAINTENANT ?</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-natif-accent outline-none h-20 resize-none"
                  value={newProspect.answers?.why_now || ""}
                  onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, why_now: e.target.value}})}
                  placeholder="Quel a été le déclic ?"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Vision à 6 mois (résultats)</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-natif-accent outline-none h-20 resize-none"
                  value={newProspect.answers?.vision || ""}
                  onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, vision: e.target.value}})}
                  placeholder="Qu'est-ce que cela change dans votre vie ?"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Détermination (1 à 10)</label>
                <div className="flex justify-between gap-1">
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewProspect({...newProspect, answers: {...newProspect.answers, motivation: num.toString()}})}
                      className={`flex-1 py-3 rounded-lg text-[10px] font-black transition-all ${newProspect.answers?.motivation === num.toString() ? 'bg-natif-accent text-white scale-110' : 'bg-white/5 text-natif-textDark hover:bg-white/10'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h3 className="text-sm font-black uppercase italic text-natif-accent">4. Lifestyle & Sport</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Sommeil (h/nuit)</label>
                  <Input type="number" value={newProspect.answers?.sleep || ""} onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, sleep: e.target.value}})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Stress (1-10)</label>
                  <Input type="number" value={newProspect.answers?.stress || ""} onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, stress: e.target.value}})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Tabac / Alcool</label>
                  <Input value={newProspect.answers?.habits || ""} onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, habits: e.target.value}})} placeholder="Fréquence ?" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Sport actuel</label>
                  <Input value={newProspect.answers?.current_sport || ""} onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, current_sport: e.target.value}})} placeholder="Quoi / Combien ?" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Alimentation / Grignotage</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-natif-accent outline-none h-20 resize-none"
                  value={newProspect.answers?.diet || ""}
                  onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, diet: e.target.value}})}
                  placeholder="Décrivez vos habitudes alimentaires..."
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h3 className="text-sm font-black uppercase italic text-natif-accent">5. Logistique</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Disponibilités (Jours/Heures)</label>
                <Input 
                  value={newProspect.answers?.avail || ""}
                  onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, avail: e.target.value}})}
                  placeholder="Ex: Lundi/Jeudi soir, Samedi matin..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Comment nous avez-vous connu ?</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-natif-accent outline-none"
                  value={newProspect.answers?.source || ""}
                  onChange={e => setNewProspect({...newProspect, answers: {...newProspect.answers, source: e.target.value}})}
                >
                  <option value="">Sélectionner...</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Google">Google</option>
                  <option value="Bouche à oreille">Bouche à oreille</option>
                  <option value="Passage devant le club">Passage devant le club</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="secondary" onClick={handleBack} className="flex-1">RETOUR</Button>
            )}
            {step < totalSteps ? (
              <Button variant="primary" onClick={handleNext} className="flex-1">SUIVANT</Button>
            ) : (
              <Button variant="primary" fullWidth onClick={handleSaveProspect} disabled={loading} className="flex-1">
                {loading ? "ENVOI EN COURS..." : "ENVOYER MA DEMANDE"}
              </Button>
            )}
          </div>
          
          <p className="text-[9px] text-natif-textDark text-center uppercase tracking-widest">
            {step === totalSteps ? "En envoyant ce formulaire, un coach vous contactera prochainement." : "Vos données sont sécurisées et traitées par nos coachs."}
          </p>
        </Card>
      </div>
    </div>
  );
};
