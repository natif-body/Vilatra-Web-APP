
import React, { useState } from 'react';
import { Card, Input, Button } from './UI';
import { ChevronLeftIcon, TargetIcon, InfoIcon } from './Icons';
import { Goal, Gender, User, Studio } from '../types';
import { GOALS } from '../constants';
import { auth, db, createUserWithEmailAndPassword, doc, setDoc, query, collection, where, getDocs } from '../firebase';

interface RegistrationFormProps {
  mode: 'create_studio' | 'join_studio';
  onRegister: () => void;
  onCancel: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ mode, onRegister, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studioName: "",
    studioCode: "",
    email: "",
    password: "",
    name: "",
    age: 25,
    weight: 70,
    height: 175,
    gender: "M" as Gender,
    objectifs: [] as Goal[],
    notes: ""
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || !formData.name) return;
    
    setLoading(true);
    try {
      let targetStudioId = "";

      if (mode === 'join_studio') {
        if (!formData.studioCode) {
          alert("Code d'invitation requis.");
          setLoading(false);
          return;
        }
        const q = query(collection(db, "studios"), where("code", "==", formData.studioCode));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          alert("Code d'invitation invalide.");
          setLoading(false);
          return;
        }
        targetStudioId = querySnapshot.docs[0].id;
      }

      // 1. Création du compte Auth
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      if (mode === 'create_studio') {
        targetStudioId = "studio_" + Date.now();
        const newStudio: Studio = {
          id: targetStudioId,
          name: formData.studioName,
          code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          adminId: user.uid,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "studios", targetStudioId), newStudio);
      }

      // 2. Création du profil Firestore
      const newUser: User = {
        id: Date.now(),
        studioId: targetStudioId,
        code: formData.email.split('@')[0],
        pwd: "", 
        name: formData.name,
        role: mode === 'create_studio' ? "studio_admin" : "member",
        avatar: formData.name.substring(0, 2).toUpperCase(),
        gender: formData.gender,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        objectifs: formData.objectifs,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        xp: 0,
        streak: 0,
        pointsFidelite: 0
      };
      
      await setDoc(doc(db, "users", user.uid), newUser);
      onRegister();
    } catch (error: any) {
      alert("Erreur lors de la création : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const toggleGoal = (goal: Goal) => {
    setFormData(prev => ({
      ...prev,
      objectifs: prev.objectifs.includes(goal) 
        ? prev.objectifs.filter(g => g !== goal)
        : [...prev.objectifs, goal]
    }));
  };

  return (
    <div className="max-w-[420px] mx-auto w-full page-transition py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={step === 1 ? onCancel : prevStep} className="p-2 text-natif-textDark hover:text-white transition-colors">
          <ChevronLeftIcon size={28} />
        </button>
        <div>
          <h2 className="text-2xl font-black tracking-tight">{mode === 'create_studio' ? 'Créer mon Studio' : 'Rejoindre un Studio'}</h2>
          <p className="text-[10px] uppercase tracking-[3px] text-natif-accent font-black">Étape {step} sur 3</p>
        </div>
      </div>

      <Card className="p-8 border-white/5 ring-1 ring-white/10 shadow-2xl">
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            {mode === 'create_studio' ? (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-natif-textDark tracking-widest ml-1">Nom du Studio</label>
                <Input placeholder="Ex: Velatra Fitness" value={formData.studioName} onChange={e => setFormData({...formData, studioName: e.target.value})} />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-natif-textDark tracking-widest ml-1">Code d'invitation du Studio</label>
                <Input placeholder="Ex: A1B2C3" value={formData.studioCode} onChange={e => setFormData({...formData, studioCode: e.target.value.toUpperCase()})} />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-natif-textDark tracking-widest ml-1">Votre Nom Complet</label>
              <Input placeholder="Jean Dupont" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-natif-textDark tracking-widest ml-1">Email</label>
              <Input type="email" placeholder="votre@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-natif-textDark tracking-widest ml-1">Choisir un mot de passe</label>
              <Input type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <Button fullWidth onClick={nextStep} className="!py-4" disabled={!formData.email || !formData.password || formData.password.length < 6 || !formData.name || (mode === 'create_studio' && !formData.studioName) || (mode === 'join_studio' && !formData.studioCode)}>CONTINUER</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-natif-textDark tracking-widest ml-1">Âge</label>
                <Input type="number" value={formData.age} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-natif-textDark tracking-widest ml-1">Genre</label>
                <div className="flex gap-2">
                  <button onClick={() => setFormData({...formData, gender: 'M'})} className={`flex-1 py-3.5 rounded-xl border font-black text-[10px] tracking-widest transition-all ${formData.gender === 'M' ? 'bg-natif-accent border-natif-accent text-white' : 'bg-white/5 border-white/10 text-natif-textDark'}`}>HOMME</button>
                  <button onClick={() => setFormData({...formData, gender: 'F'})} className={`flex-1 py-3.5 rounded-xl border font-black text-[10px] tracking-widest transition-all ${formData.gender === 'F' ? 'bg-natif-accent border-natif-accent text-white' : 'bg-white/5 border-white/10 text-natif-textDark'}`}>FEMME</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-natif-textDark tracking-widest ml-1">Poids (kg)</label>
                <Input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-natif-textDark tracking-widest ml-1">Taille (cm)</label>
                <Input type="number" value={formData.height} onChange={e => setFormData({...formData, height: parseInt(e.target.value)})} />
              </div>
            </div>
            <Button fullWidth onClick={nextStep} className="!py-4">CONTINUER</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-natif-textDark tracking-widest ml-1 flex items-center gap-2"><TargetIcon size={14} className="text-natif-accent" /> Mes Objectifs</label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map(goal => (
                  <button key={goal} onClick={() => toggleGoal(goal)} className={`px-3 py-2 rounded-xl text-[10px] font-black tracking-tighter border transition-all ${formData.objectifs.includes(goal) ? 'bg-natif-accent border-natif-accent text-white shadow-lg' : 'bg-white/5 border-white/10 text-natif-textDark'}`}>{goal}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-natif-textDark tracking-widest ml-1 flex items-center gap-2"><InfoIcon size={14} className="text-natif-accent" /> Antécédents / Santé</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-natif-accent h-24 resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Blessures, pathologies..." />
            </div>
            <Button fullWidth onClick={handleSubmit} variant="success" className="!py-4 shadow-xl shadow-emerald-500/20" disabled={loading}>
              {loading ? "CRÉATION EN COURS..." : (mode === 'create_studio' ? "CRÉER MON STUDIO" : "REJOINDRE LE STUDIO")}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
