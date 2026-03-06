
import React, { useState } from 'react';
import { Card, Input, Button } from './UI';
import { RegistrationForm } from './RegistrationForm';
import { DiscoveryForm } from './DiscoveryForm';
import { 
  auth, googleProvider, 
  signInWithPopup, signInWithEmailAndPassword 
} from '../firebase';

const LogoVelatra = () => (
  <div className="flex flex-col items-center">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-natif-accent rounded-xl flex items-center justify-center rotate-3 shadow-xl shadow-natif-accent/20">
        <span className="font-black text-white text-2xl tracking-tighter">V</span>
      </div>
      <div className="font-black text-4xl tracking-tighter leading-none text-white italic">VELATRA</div>
    </div>
    <div className="text-[10px] tracking-[10px] text-natif-textDark font-black uppercase mt-3 opacity-80 pl-2">FITNESS SOFTWARE</div>
  </div>
);

export const Login: React.FC<{ onLogin: any, onRegister: any }> = () => {
  const [mode, setMode] = useState<'login' | 'create_studio' | 'join_studio' | 'discovery'>('login');
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pwd) return;
    
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, pwd);
    } catch (err: any) {
      setError("Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setError(`Domaine non autorisé. Ajoutez "${domain}" dans la console Firebase.`);
      } else {
        setError("Échec de la connexion Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'create_studio' || mode === 'join_studio') {
    return <RegistrationForm mode={mode} onRegister={() => setMode('login')} onCancel={() => setMode('login')} />;
  }

  if (mode === 'discovery') {
    return (
      <DiscoveryForm 
        onCancel={() => setMode('login')} 
        onSuccess={() => {
          alert("Votre demande a été envoyée ! Un coach vous contactera bientôt.");
          setMode('login');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#050505]">
      <div className="w-full max-w-[360px] space-y-12 py-12 animate-in fade-in duration-1000">
        <div className="text-center">
          <LogoVelatra />
          <p className="text-[10px] uppercase tracking-[6px] text-natif-accent font-black mt-8 opacity-100">
            AUTHENTIFICATION
          </p>
        </div>

        <Card className="p-8 space-y-6 border-white/5 ring-1 transition-all duration-500 ring-white/10">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-black text-natif-textDark ml-1">Email</label>
              <Input type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-black text-natif-textDark ml-1">Mot de passe</label>
              <Input type="password" placeholder="••••••••" value={pwd} onChange={e => setPwd(e.target.value)} required />
            </div>
            
            {error && <p className="text-[10px] text-natif-accent font-bold text-center bg-natif-accent/5 py-2 rounded-lg leading-snug">{error}</p>}
            
            <Button type="submit" fullWidth disabled={loading} className="!py-4 shadow-xl">
              {loading ? "VÉRIFICATION..." : "SE CONNECTER"}
            </Button>
          </form>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-black text-[10px] tracking-widest uppercase text-white"
          >
            Continuer avec Google
          </button>

          <div className="flex flex-col gap-5 text-center pt-2">
            <button onClick={() => setMode('create_studio')} className="w-full py-4 rounded-2xl border-2 border-natif-accent text-natif-accent font-black text-[10px] tracking-widest uppercase hover:bg-natif-accent hover:text-white transition-all">
              Créer un Studio
            </button>
            <button onClick={() => setMode('join_studio')} className="text-[9px] font-black text-natif-textDark hover:text-white transition-colors tracking-widest uppercase">
              Vous avez un code ? <span className="text-white underline ml-1">Rejoindre un Studio</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
