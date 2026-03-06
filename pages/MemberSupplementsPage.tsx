
import React, { useState } from 'react';
import { AppState, SupplementOrder, SupplementProduct } from '../types';
import { Card, Button, Input, Badge } from '../components/UI';
import { 
  PlusIcon, SearchIcon, ShoppingCartIcon, Trash2Icon, 
  CheckIcon, XIcon, InfoIcon, GiftIcon, RefreshCwIcon
} from '../components/Icons';
import { db, doc, setDoc } from '../firebase';

export const MemberSupplementsPage: React.FC<{ state: AppState, setState: any, showToast: any }> = ({ state, setState, showToast }) => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ productId: string, qty: number }[]>([]);
  const [showCart, setShowCart] = useState(false);

  const filteredProducts = state.supplementProducts.filter(p => 
    p.nom.toLowerCase().includes(search.toLowerCase())
  ).sort((a,b) => a.nom.localeCompare(b.nom));

  const handleAddToCart = (productId: string) => {
    const p = state.supplementProducts.find(sp => sp.id === productId)!;
    if (p.stock <= 0) {
      showToast("Rupture de stock", "error");
      return;
    }
    const existing = cart.find(c => c.productId === productId);
    if (existing) {
      if (existing.qty >= p.stock) {
        showToast("Stock maximum atteint", "error");
        return;
      }
      setCart(cart.map(c => c.productId === productId ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { productId, qty: 1 }]);
    }
    showToast(`${p.nom} ajouté au panier`);
  };

  const handleRequestOrder = async () => {
    if (cart.length === 0) return;
    
    const moisArr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const currentMonth = moisArr[new Date().getMonth()];
    
    let orderTotal = 0;
    const orderItems = cart.map(item => {
      const p = state.supplementProducts.find(sp => sp.id === item.productId)!;
      orderTotal += p.prixVente * item.qty;
      return { nom: p.nom, quantite: item.qty, prixUnitaire: p.prixVente };
    });

    const orderId = `REQ-${Date.now()}`;
    const newOrder: SupplementOrder = {
      id: orderId,
      studioId: state.user!.studioId,
      adherentId: state.user!.id,
      coachName: "En attente",
      date: new Date().toISOString(),
      mois: currentMonth,
      produits: orderItems,
      total: orderTotal,
      pointsGagnes: Math.floor(orderTotal),
      status: 'requested'
    };

    try {
      await setDoc(doc(db, "supplementOrders", orderId), newOrder);
      setCart([]);
      setShowCart(false);
      showToast("Demande envoyée au coach !");
    } catch (err) {
      showToast("Erreur lors de l'envoi", "error");
    }
  };

  const myRequests = state.supplementOrders.filter(o => o.adherentId === state.user!.id && o.status === 'requested');

  return (
    <div className="space-y-8 page-transition pb-24">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight text-white leading-none">Boutique <span className="text-natif-accent">NUTRIPURE</span></h1>
          <p className="text-[10px] text-natif-textDark font-black uppercase tracking-[4px] mt-2">Commande & Retrait Club</p>
        </div>
        <button 
          onClick={() => setShowCart(true)}
          className="relative w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white hover:bg-natif-accent transition-all group"
        >
          <ShoppingCartIcon size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-natif-accent text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-black">
              {cart.reduce((acc, c) => acc + c.qty, 0)}
            </span>
          )}
        </button>
      </div>

      {myRequests.length > 0 && (
        <Card className="bg-natif-accent/5 border-natif-accent/20 !p-6">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCwIcon size={18} className="text-natif-accent animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-natif-accent">Demandes en cours</span>
          </div>
          <div className="space-y-3">
            {myRequests.map(req => (
              <div key={req.id} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5">
                <div>
                  <div className="text-xs font-black text-white uppercase italic">{req.produits.length} Articles</div>
                  <div className="text-[9px] text-natif-textDark font-black uppercase tracking-widest mt-1">Total: {req.total.toFixed(2)}€</div>
                </div>
                <Badge variant="accent" className="italic">EN ATTENTE</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-natif-textDark" size={18} />
        <Input 
          placeholder="Rechercher un complément..." 
          className="pl-12 !bg-white/5 !border-white/5 !rounded-2xl !py-4" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(p => (
          <Card key={p.id} className="group border-none ring-1 ring-white/5 hover:ring-natif-accent/30 transition-all !p-6 bg-[#0a0a0a] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <Badge variant="dark" className="!bg-white/5 !text-[8px]">{p.cat}</Badge>
                {p.stock <= 3 && p.stock > 0 && <Badge variant="accent" className="!text-[8px]">STOCK BAS</Badge>}
                {p.stock <= 0 && <Badge variant="orange" className="!text-[8px]">RUPTURE</Badge>}
              </div>
              <h3 className="font-black text-lg text-white uppercase italic tracking-tight group-hover:text-natif-accent transition-colors leading-tight mb-2">{p.nom}</h3>
              <div className="text-2xl font-black text-white italic">{p.prixVente.toFixed(2)}€</div>
            </div>
            
            <div className="mt-6">
              <Button 
                variant={p.stock > 0 ? "primary" : "secondary"} 
                fullWidth 
                disabled={p.stock <= 0}
                onClick={() => handleAddToCart(p.id)}
                className="!py-3.5 !text-[10px] !rounded-xl font-black tracking-widest italic"
              >
                {p.stock > 0 ? "AJOUTER AU PANIER" : "INDISPONIBLE"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[600] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md !p-10 border-white/10 relative shadow-[0_0_100px_rgba(0,0,0,1)]">
            <button onClick={() => setShowCart(false)} className="absolute top-8 right-8 text-white/40 hover:text-white">
              <XIcon size={24} />
            </button>
            
            <h2 className="text-2xl font-black mb-1 uppercase italic">Mon Panier</h2>
            <p className="text-[10px] text-natif-accent font-black uppercase tracking-widest mb-8">Demande de commande Nutripure</p>

            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <ShoppingCartIcon size={48} className="mx-auto text-white/10" />
                <p className="text-natif-textDark italic font-black uppercase tracking-widest text-xs">Votre panier est vide</p>
                <Button variant="secondary" onClick={() => setShowCart(false)}>RETOUR BOUTIQUE</Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="max-h-64 overflow-y-auto space-y-4 no-scrollbar pr-2">
                  {cart.map(item => {
                    const p = state.supplementProducts.find(sp => sp.id === item.productId)!;
                    return (
                      <div key={item.productId} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex-1">
                          <div className="font-black text-white text-xs uppercase italic">{p.nom}</div>
                          <div className="text-[10px] text-natif-textDark font-black mt-1">{item.qty} x {p.prixVente.toFixed(2)}€</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="font-black text-white text-sm">{(item.qty * p.prixVente).toFixed(2)}€</div>
                          <button 
                            onClick={() => setCart(cart.filter(c => c.productId !== item.productId))}
                            className="text-red-500/40 hover:text-red-500 transition-colors"
                          >
                            <Trash2Icon size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-natif-textDark italic">TOTAL ESTIMÉ</span>
                    <span className="text-3xl font-black text-white">
                      {cart.reduce((sum, item) => {
                        const p = state.supplementProducts.find(sp => sp.id === item.productId)!;
                        return sum + (p.prixVente * item.qty);
                      }, 0).toFixed(2)}€
                    </span>
                  </div>
                  
                  <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl mb-6 flex gap-3">
                    <InfoIcon size={18} className="text-blue-400 shrink-0" />
                    <p className="text-[9px] text-blue-400 font-bold leading-relaxed uppercase italic">
                      Le coach traitera votre demande et vous facturera directement au club lors du retrait.
                    </p>
                  </div>

                  <Button variant="primary" fullWidth onClick={handleRequestOrder} className="!py-5 font-black text-base italic shadow-xl shadow-natif-accent/30">
                    ENVOYER LA DEMANDE
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
