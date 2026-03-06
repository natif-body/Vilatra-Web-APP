
import React from 'react';
import { Card, Button, Badge } from '../components/UI';
import { GiftIcon, MessageCircleIcon, CheckIcon } from '../components/Icons';

export const GiftPage: React.FC = () => {
  const referralCode = "VELATRA-" + Math.random().toString(36).substring(7).toUpperCase();

  const handleShare = () => {
    const text = `Salut ! Rejoins-moi. Avec mon code ${referralCode}, ta première séance de coaching est offerte ! 🏋️‍♂️`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex p-5 bg-natif-accent/10 rounded-full text-natif-accent animate-bounce">
          <GiftIcon size={48} />
        </div>
        <h1 className="text-3xl font-black">Offrir une séance</h1>
        <p className="text-natif-textMuted">
          Partagez l'expérience avec vos proches. Pour chaque parrainage validé, recevez un cadeau exclusif du club !
        </p>
      </div>

      <Card className="p-8 border-2 border-dashed border-natif-accent/30 bg-natif-accent/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
           <Badge variant="accent">Spécial</Badge>
        </div>
        
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-natif-textMuted">Votre Code Parrain</span>
            <div className="text-4xl font-black tracking-tighter text-white select-all cursor-pointer hover:text-natif-accent transition-colors">
              {referralCode}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Button onClick={handleShare} className="bg-[#25D366] hover:bg-[#128C7E] border-none shadow-xl">
              <MessageCircleIcon size={20} className="mr-2" />
              WhatsApp
            </Button>
            <Button variant="secondary" onClick={() => {
              navigator.clipboard.writeText(referralCode);
              alert("Code copié !");
            }}>
              Copier le code
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <CheckIcon />, title: "Parrainez", desc: "Envoyez le code" },
          { icon: <CheckIcon />, title: "Séance Offerte", desc: "Pour votre ami" },
          { icon: <CheckIcon />, title: "Récompense", desc: "Cadeau Exclusif" }
        ].map((item, i) => (
          <div key={i} className="text-center p-4">
             <div className="flex justify-center text-natif-success mb-2">{item.icon}</div>
             <div className="font-bold text-sm">{item.title}</div>
             <div className="text-[11px] text-natif-textMuted">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
