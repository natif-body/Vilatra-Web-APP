
import React, { useState } from 'react';
import { AppState, Message } from '../types';
import { Card, Button, Badge, Input } from '../components/UI';
import { MegaphoneIcon, MailIcon, MessageCircleIcon, ClipboardIcon, SendIcon, CheckIcon, CopyIcon, Trash2Icon, SparklesIcon } from '../components/Icons';
import { db, doc, setDoc, deleteDoc } from '../firebase';
import { GoogleGenAI, Type } from "@google/genai";

export const MarketingPage: React.FC<{ state: AppState, setState: any, showToast: any }> = ({ state, setState, showToast }) => {
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [newsletterTitle, setNewsletterTitle] = useState("");
  const [newsletterContent, setNewsletterContent] = useState("");
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      showToast("Veuillez décrire ce que vous souhaitez générer", "error");
      return;
    }
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Rédige une newsletter pour les adhérents du club de sport premium ${state.studio?.name || 'Velatra'}.
Sujet demandé : ${aiPrompt}

La réponse doit être au format JSON avec deux champs :
- "title": Le titre accrocheur de la newsletter.
- "content": Le contenu de la newsletter, rédigé en Markdown, avec un ton motivant, professionnel, et en tutoyant le lecteur. Si le sujet demande un sondage ou des questions, intègre-les de manière claire et engageante.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "content"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      if (data.title) setNewsletterTitle(data.title);
      if (data.content) setNewsletterContent(data.content);
      showToast("Brouillon généré avec succès !");
      setAiPrompt("");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la génération", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!newsletterTitle.trim() || !newsletterContent.trim()) {
      showToast("Veuillez remplir le titre et le contenu", "error");
      return;
    }
    if (!confirm("Voulez-vous envoyer cette newsletter à tous les adhérents ?")) return;

    setIsSendingNewsletter(true);
    try {
      const newNewsletter = {
        id: Date.now(),
        studioId: state.user!.studioId,
        title: newsletterTitle,
        content: newsletterContent,
        date: new Date().toISOString(),
        author: state.user?.name || `L'équipe ${state.studio?.name || 'Velatra'}`
      };
      await setDoc(doc(db, "newsletters", newNewsletter.id.toString()), newNewsletter);
      showToast("Newsletter envoyée avec succès !", "success");
      setNewsletterTitle("");
      setNewsletterContent("");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'envoi de la newsletter", "error");
    } finally {
      setIsSendingNewsletter(false);
    }
  };

  const handleDeleteNewsletter = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette newsletter ?")) return;
    try {
      await deleteDoc(doc(db, "newsletters", id.toString()));
      showToast("Newsletter supprimée");
    } catch (err) {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const surveyIntro = `Salut ! C'est l'équipe ${state.studio?.name || 'Velatra'}. 👋

On a remarqué que tu venais un peu moins souvent au club ces derniers temps et on aimerait comprendre pourquoi. Ton avis est précieux pour nous aider à améliorer l'ambiance et le coaching.

🎁 Pour te remercier, on organise un TIRAGE AU SORT : tente de gagner une SÉANCE DE COACHING PRIVÉ (valeur 70€) en répondant à notre enquête flash (moins de 2 min).

On compte sur toi ! 🔥`;

  const surveyQuestions = [
    "1. À quelle fréquence venez-vous au club actuellement ? (Plusieurs fois par semaine / 1 fois par semaine / Rarement / Plus du tout)",
    "2. Qu'est-ce qui vous empêche de venir plus souvent ? (Horaires / Manque de motivation / Vie pro-perso chargée / Ambiance / Autre)",
    "3. Comment évaluez-vous la qualité du coaching ? (Trop répétitif / Pas assez intense / Parfait / Manque de suivi personnalisé)",
    "4. Les créneaux horaires proposés correspondent-ils à vos besoins ? (Oui / Non, précisez lesquels)",
    "5. Que manque-t-il pour vous faire revenir à 100% ? (Nouveaux équipements / Nouveaux concepts de cours / Défis collectifs / Autre)",
    "6. Un dernier mot ou une suggestion pour l'équipe ?"
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSendToAll = async () => {
    if (!confirm("Voulez-vous envoyer ce message à TOUS vos adhérents actifs ?")) return;
    
    setIsSending(true);
    try {
      const members = state.users.filter(u => u.role === 'member');
      const promises = members.map(async (member) => {
        const messageId = Date.now() + Math.random();
        const newMessage: Message = {
          id: messageId,
          studioId: state.user!.studioId,
          from: 1, // Coach
          to: member.id,
          text: surveyIntro,
          date: new Date().toISOString(),
          read: false,
          file: null
        };
        return setDoc(doc(db, "messages", messageId.toString()), newMessage);
      });

      await Promise.all(promises);
      showToast(`Message envoyé à ${members.length} adhérents !`);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'envoi massif", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 page-transition pb-24">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-3xl font-black tracking-tighter leading-none mb-2 text-white uppercase italic">Marketing & <span className="text-natif-accent">Communication</span></h1>
          <p className="text-natif-textDark text-[10px] uppercase tracking-[4px] font-black">Fidélisation & Reconquête</p>
        </div>
        <div className="p-3 bg-natif-accent/10 rounded-2xl text-natif-accent">
          <MegaphoneIcon size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight text-white italic flex items-center gap-3">
                <MailIcon className="text-natif-accent" size={20} /> Enquête de Reconquête
              </h2>
              <Badge variant="accent">FLASH SURVEY</Badge>
            </div>
            
            <Card className="bg-white/[0.02] border-white/5 !p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[3px] text-natif-accent">Texte d'introduction (Email/WhatsApp)</h3>
                  <button 
                    onClick={() => handleCopy(surveyIntro, 'intro')}
                    className="text-natif-textDark hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase"
                  >
                    {copied === 'intro' ? <CheckIcon size={14} className="text-natif-success" /> : <CopyIcon size={14} />}
                    {copied === 'intro' ? 'Copié' : 'Copier'}
                  </button>
                </div>
                <div className="p-4 bg-black rounded-2xl border border-white/5 text-sm text-natif-textMuted leading-relaxed italic whitespace-pre-wrap">
                  {surveyIntro}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[3px] text-natif-accent">Questions optimisées (Google Forms / Typeform)</h3>
                  <button 
                    onClick={() => handleCopy(surveyQuestions.join('\n'), 'questions')}
                    className="text-natif-textDark hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase"
                  >
                    {copied === 'questions' ? <CheckIcon size={14} className="text-natif-success" /> : <CopyIcon size={14} />}
                    {copied === 'questions' ? 'Copié' : 'Copier'}
                  </button>
                </div>
                <div className="space-y-3">
                  {surveyQuestions.map((q, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-white font-medium">
                      {q}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Button 
                  variant="primary" 
                  fullWidth 
                  className="!py-4 shadow-xl shadow-natif-accent/20"
                  onClick={handleSendToAll}
                  disabled={isSending}
                >
                  <SendIcon size={18} className="mr-2" /> 
                  {isSending ? "ENVOI EN COURS..." : "DIFFUSER L'INTRO À TOUS LES ADHÉRENTS"}
                </Button>
                <p className="text-[9px] text-natif-textDark text-center mt-3 uppercase font-black tracking-widest">
                  L'envoi se fera via la messagerie interne de l'application.
                </p>
              </div>
            </Card>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-white italic flex items-center gap-3">
              <ClipboardIcon className="text-natif-accent" size={20} /> Stratégie Marketing
            </h2>
            <Card className="bg-natif-accent/5 border-natif-accent/20 !p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-black text-white uppercase italic">Pourquoi cette enquête ?</h4>
                <p className="text-[11px] text-natif-textMuted leading-relaxed">
                  L'objectif est de comprendre les freins réels (motivation, horaires, intensité) pour adapter votre offre et réduire le taux d'attrition (churn).
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-natif-accent/20 flex items-center justify-center text-natif-accent text-[10px] font-black shrink-0">1</div>
                  <p className="text-[10px] text-white font-bold">L'incitation (70€ de coaching) booste le taux de réponse de +40%.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-natif-accent/20 flex items-center justify-center text-natif-accent text-[10px] font-black shrink-0">2</div>
                  <p className="text-[10px] text-white font-bold">Le ton "Club" renforce le sentiment d'appartenance.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-natif-accent/20 flex items-center justify-center text-natif-accent text-[10px] font-black shrink-0">3</div>
                  <p className="text-[10px] text-white font-bold">Moins de 2 minutes : crucial pour ne pas perdre l'adhérent en route.</p>
                </div>
              </div>

              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-black text-natif-accent uppercase tracking-widest mb-2">Prochaines étapes conseillées</h4>
                <ul className="text-[10px] text-natif-textMuted space-y-2 list-disc pl-4">
                  <li>Analyser les réponses sous 7 jours.</li>
                  <li>Contacter personnellement les "déçus".</li>
                  <li>Annoncer le gagnant du tirage au sort publiquement.</li>
                </ul>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-white italic flex items-center gap-3">
              <MessageCircleIcon className="text-natif-accent" size={20} /> Newsletter {state.studio?.name || 'Velatra'}
            </h2>
            <Card className="bg-white/[0.02] border-white/5 !p-6 space-y-4">
              <div className="p-4 bg-natif-accent/10 border border-natif-accent/20 rounded-2xl space-y-3 mb-6">
                <div className="flex items-center gap-2 text-natif-accent font-black uppercase text-xs tracking-widest">
                  <SparklesIcon size={16} /> Générateur IA
                </div>
                <Input 
                  placeholder="Ex: Annonce du nouveau cours de yoga avec un petit sondage..." 
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  className="!bg-black !text-sm"
                />
                <Button 
                  variant="secondary" 
                  fullWidth 
                  disabled={isGenerating || !aiPrompt.trim()}
                  onClick={handleGenerateAI}
                  className="!py-2 !text-[10px]"
                >
                  {isGenerating ? "GÉNÉRATION EN COURS..." : "GÉNÉRER LE BROUILLON"}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Titre de la Newsletter</label>
                <Input 
                  placeholder="Ex: Nouveautés de la semaine..." 
                  value={newsletterTitle}
                  onChange={e => setNewsletterTitle(e.target.value)}
                  className="!bg-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-natif-textDark tracking-widest ml-1">Contenu (Markdown supporté)</label>
                <textarea 
                  placeholder="Écrivez votre message ici..." 
                  value={newsletterContent}
                  onChange={e => setNewsletterContent(e.target.value)}
                  className="w-full h-32 bg-black border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-natif-accent outline-none resize-none"
                />
              </div>
              <Button 
                variant="primary" 
                fullWidth 
                disabled={isSendingNewsletter || !newsletterTitle.trim() || !newsletterContent.trim()}
                onClick={handleSendNewsletter}
                className="!py-3"
              >
                <SendIcon size={16} className="mr-2" />
                {isSendingNewsletter ? "ENVOI..." : "PUBLIER LA NEWSLETTER"}
              </Button>
            </Card>

            {state.newsletters?.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-[10px] font-black text-natif-textDark uppercase tracking-widest ml-1">Newsletters envoyées</h3>
                {state.newsletters.map(nl => (
                  <div key={nl.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-start group">
                    <div>
                      <h4 className="text-sm font-black text-white italic">{nl.title}</h4>
                      <p className="text-[10px] text-natif-textDark uppercase tracking-widest mt-1">{new Date(nl.date).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteNewsletter(nl.id)}
                      className="text-natif-textDark hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                    >
                      <Trash2Icon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
