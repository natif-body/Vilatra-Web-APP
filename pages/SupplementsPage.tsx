
import React, { useState, useEffect } from 'react';
import { AppState, SupplementOrder, SupplementProduct, User, FixedCost, CommissionPayment } from '../types';
import { Card, Button, Input, Badge, StatBox } from '../components/UI';
import { 
  PlusIcon, SearchIcon, Trash2Icon, GiftIcon, 
  RefreshCwIcon, ShoppingCartIcon, BarChartIcon, SettingsIcon, UserIcon, TargetIcon,
  CheckIcon, XIcon, FlameIcon, DatabaseIcon, Edit2Icon, SaveIcon
} from '../components/Icons';
import { db, doc, setDoc, updateDoc, collection, deleteDoc } from '../firebase';
import { COMMISSION_THRESHOLD, INIT_SUPPLEMENTS } from '../constants';

export const SupplementsPage: React.FC<{ state: AppState, setState: any, showToast: any }> = ({ state, setState, showToast }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'stock' | 'commissions' | 'manager'>('orders');
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ productId: string, qty: number }[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isManagerAuthorized, setIsManagerAuthorized] = useState(false);
  const [pwd, setPwd] = useState("");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const moisArr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const currentMonth = moisArr[new Date().getMonth()];
  const displayMonth = moisArr[selectedMonth];

  useEffect(() => {
    const syncDatabase = async () => {
      for (const p of INIT_SUPPLEMENTS) {
        const exists = state.supplementProducts.some(sp => sp.id === p.id);
        if (!exists) {
          await setDoc(doc(db, "supplementProducts", p.id), p);
        }
      }
    };
    syncDatabase();
  }, [state.supplementProducts.length]);

  const handleUpdateProduct = async (id: string, updates: Partial<SupplementProduct>) => {
    try {
      await updateDoc(doc(db, "supplementProducts", id), updates);
      showToast("Produit mis à jour");
      setEditingPriceId(null);
    } catch (err) {
      showToast("Erreur de mise à jour", "error");
    }
  };

  const handleResetStocks = async () => {
    if(confirm("Voulez-vous remettre TOUS les stocks à 0 ?")) {
      for (const p of state.supplementProducts) {
        await updateDoc(doc(db, "supplementProducts", p.id), { stock: 0 });
      }
      showToast("Tous les stocks ont été mis à 0");
    }
  };

  const getCoachCommission = (coachName: string, month: string) => {
    const coachOrders = state.supplementOrders.filter(o => o.coachName === coachName && o.mois === month);
    const totalVentes = coachOrders.reduce((sum, o) => sum + o.total, 0);
    const taux = totalVentes < COMMISSION_THRESHOLD ? 0.10 : 0.15;
    return { totalVentes, commission: totalVentes * taux, taux: taux * 100 };
  };

  const handleAddToOrder = (productId: string) => {
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
  };

  const validateOrder = async (orderId?: string) => {
    let targetOrder: SupplementOrder | undefined;
    let memberId: number | null = null;
    let orderCart: { productId: string, qty: number }[] = [];

    if (orderId) {
      targetOrder = state.supplementOrders.find(o => o.id === orderId);
      if (!targetOrder) return;
      memberId = targetOrder.adherentId;
      // Map product names back to IDs (this is a bit brittle, but works if names are unique)
      orderCart = targetOrder.produits.map(item => {
        const p = state.supplementProducts.find(sp => sp.nom === item.nom);
        return { productId: p?.id || "", qty: item.quantite };
      }).filter(c => c.productId !== "");
    } else {
      if (!selectedMemberId || cart.length === 0) return;
      memberId = selectedMemberId;
      orderCart = cart;
    }

    const member = state.users.find(u => u.id === memberId);
    if (!member) return;

    let orderTotal = 0;
    const orderItems = orderCart.map(item => {
      const p = state.supplementProducts.find(sp => sp.id === item.productId)!;
      orderTotal += p.prixVente * item.qty;
      return { nom: p.nom, quantite: item.qty, prixUnitaire: p.prixVente };
    });

    const pointsGagnes = Math.floor(orderTotal);
    const finalOrderId = orderId || Date.now().toString();

    const newOrder: SupplementOrder = {
      id: finalOrderId,
      studioId: state.user!.studioId,
      adherentId: memberId!,
      coachName: state.user!.name,
      date: new Date().toISOString(),
      mois: currentMonth,
      produits: orderItems,
      total: orderTotal,
      pointsGagnes,
      status: 'completed'
    };

    try {
      await setDoc(doc(db, "supplementOrders", finalOrderId), newOrder);
      for (const item of orderCart) {
        const p = state.supplementProducts.find(sp => sp.id === item.productId)!;
        await updateDoc(doc(db, "supplementProducts", p.id), { stock: p.stock - item.qty });
      }
      await updateDoc(doc(db, "users", (member as any).firebaseUid), { 
        pointsFidelite: (member.pointsFidelite || 0) + pointsGagnes 
      });
      if (!orderId) setCart([]);
      setSelectedMemberId(null);
      showToast("Vente enregistrée !");
    } catch (err) {
      showToast("Erreur", "error");
    }
  };

  const requestedOrders = state.supplementOrders.filter(o => o.status === 'requested');

  const filteredProducts = state.supplementProducts.filter(p => 
    p.nom.toLowerCase().includes(search.toLowerCase())
  ).sort((a,b) => a.nom.localeCompare(b.nom));

  return (
    <div className="space-y-6 page-transition">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white leading-none italic">Commerce <span className="text-natif-accent">{state.studio?.name || 'VELATRA'}</span></h1>
          <p className="text-[10px] text-natif-textDark font-black uppercase tracking-[4px] mt-2">Gestion {currentMonth} {new Date().getFullYear()}</p>
        </div>
        {requestedOrders.length > 0 && (
          <Badge variant="accent" className="animate-pulse">
            {requestedOrders.length} DEMANDES À TRAITER
          </Badge>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'orders', label: 'Vente', icon: ShoppingCartIcon },
          { id: 'stock', label: 'Catalogue & Prix', icon: DatabaseIcon },
          { id: 'commissions', label: 'Commissions', icon: BarChartIcon },
          { id: 'manager', label: 'Bilan Gérant', icon: TargetIcon }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-natif-accent text-white shadow-xl shadow-natif-accent/20' : 'bg-white/5 text-natif-textDark hover:bg-white/10'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="!p-6 bg-white/[0.03] border-white/5">
              <h2 className="text-lg font-black mb-4 uppercase flex items-center gap-2 italic"><UserIcon size={18} className="text-natif-accent" /> Sélection Athlète</h2>
              <div className="relative mb-4">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-natif-textDark" size={16} />
                <Input placeholder="Rechercher par nom..." className="pl-12 !bg-black" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 no-scrollbar pr-2">
                {state.users.filter(u => u.role === 'member' && u.name.toLowerCase().includes(search.toLowerCase())).map(u => (
                  <div 
                    key={u.id} 
                    onClick={() => setSelectedMemberId(u.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${selectedMemberId === u.id ? 'bg-natif-accent/10 border-natif-accent' : 'bg-black border-white/5 hover:border-white/20'}`}
                  >
                    <span className="font-black text-xs uppercase italic">{u.name}</span>
                    <Badge variant="blue">{u.pointsFidelite || 0} pts</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="!p-6">
              <h2 className="text-lg font-black mb-4 uppercase italic">Catalogue ({filteredProducts.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredProducts.map(p => (
                  <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group hover:border-natif-accent transition-all">
                    <div className="min-w-0 pr-4">
                      <div className="font-black text-xs uppercase truncate text-white">{p.nom}</div>
                      <div className="text-xs text-natif-accent font-black mt-1 italic">{p.prixVente.toFixed(2)}€</div>
                      <div className={`text-[9px] mt-1 font-black uppercase tracking-widest ${p.stock <= 0 ? 'text-red-500' : 'text-natif-textDark'}`}>STOCK: {p.stock}</div>
                    </div>
                    <button onClick={() => handleAddToOrder(p.id)} className="w-10 h-10 rounded-xl bg-natif-accent text-white flex items-center justify-center shrink-0 hover:scale-110 transition-all shadow-lg shadow-natif-accent/20">
                      <PlusIcon size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {requestedOrders.length > 0 && (
              <Card className="border-2 border-natif-accent bg-natif-accent/5 !p-6 animate-in slide-in-from-top-4">
                <h2 className="text-lg font-black mb-4 uppercase flex items-center gap-2 italic text-natif-accent">
                   <RefreshCwIcon size={18} className="animate-spin" /> Demandes Athlètes
                </h2>
                <div className="space-y-4">
                  {requestedOrders.map(order => {
                    const member = state.users.find(u => u.id === order.adherentId);
                    return (
                      <div key={order.id} className="p-4 bg-black rounded-2xl border border-white/10 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-black text-white text-xs uppercase italic">{member?.name || "Inconnu"}</div>
                            <div className="text-[9px] text-natif-textDark font-black uppercase tracking-widest mt-0.5">{new Date(order.date).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-natif-accent text-sm">{order.total.toFixed(2)}€</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {order.produits.map((p, i) => (
                            <div key={i} className="text-[9px] text-white/60 font-bold uppercase italic flex justify-between">
                              <span>{p.nom}</span>
                              <span>x{p.quantite}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="primary" 
                            fullWidth 
                            className="!py-2 !text-[9px] italic"
                            onClick={() => validateOrder(order.id)}
                          >
                            VALIDER & FACTURER
                          </Button>
                          <button 
                            onClick={async () => {
                              if(confirm("Annuler cette demande ?")) {
                                await deleteDoc(doc(db, "supplementOrders", order.id));
                                showToast("Demande supprimée");
                              }
                            }}
                            className="p-2 rounded-xl bg-white/5 text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <XIcon size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card className="sticky top-4 border-2 border-natif-accent/20 bg-black !p-8 h-fit">
              <h2 className="text-xl font-black mb-6 uppercase flex items-center gap-3 italic">
                 <ShoppingCartIcon className="text-natif-accent" /> Panier Coach
              </h2>
              {cart.length === 0 ? (
                <div className="py-12 text-center text-natif-textDark italic text-[10px] uppercase tracking-[4px] opacity-50">Sélectionnez des articles</div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item, idx) => {
                    const p = state.supplementProducts.find(sp => sp.id === item.productId)!;
                    return (
                      <div key={idx} className="flex justify-between items-center animate-in slide-in-from-right-4">
                        <div className="flex-1">
                          <div className="font-black text-white text-[11px] uppercase italic">{p.nom}</div>
                          <div className="text-[10px] text-natif-textDark font-black">{item.qty} x {p.prixVente.toFixed(2)}€</div>
                        </div>
                        <div className="font-black text-white text-sm">{(item.qty * p.prixVente).toFixed(2)}€</div>
                        <button onClick={() => setCart(cart.filter(c => c.productId !== item.productId))} className="ml-4 text-red-500/30 hover:text-red-500"><Trash2Icon size={16}/></button>
                      </div>
                    );
                  })}
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-natif-textDark italic">TOTAL COMMANDE</span>
                      <span className="text-3xl font-black text-white">
                        {cart.reduce((sum, item) => {
                          const p = state.supplementProducts.find(sp => sp.id === item.productId)!;
                          return sum + (p.prixVente * item.qty);
                        }, 0).toFixed(2)}€
                      </span>
                    </div>
                    <Button variant="primary" fullWidth disabled={!selectedMemberId} onClick={validateOrder} className="!py-5 font-black text-base italic">
                      VALIDER LA VENTE
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <Card className="!p-8">
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black uppercase italic">Référentiel & Prix</h2>
              <Button onClick={handleResetStocks} variant="danger" className="!py-2 !text-[9px] !rounded-full italic">
                VIDER TOUS LES STOCKS
              </Button>
           </div>
           <div className="space-y-4">
              {filteredProducts.map(p => (
                <div key={p.id} className="p-6 bg-white/[0.02] rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5 group hover:border-natif-accent/40 transition-all">
                  <div className="flex items-center gap-6">
                     <div className="flex flex-col items-center">
                        <div className="text-[8px] font-black uppercase text-natif-textDark mb-1">STOCK</div>
                        <input 
                          type="number"
                          className="w-16 bg-black border border-white/10 rounded-xl py-2 text-center font-black text-natif-accent focus:border-natif-accent outline-none"
                          value={p.stock}
                          onChange={e => handleUpdateProduct(p.id, { stock: parseInt(e.target.value) || 0 })}
                        />
                     </div>
                     <div>
                        <div className="font-black text-white uppercase italic text-base group-hover:text-natif-accent transition-colors">{p.nom}</div>
                        <Badge variant="dark" className="mt-1 !text-[8px]">{p.cat}</Badge>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase text-natif-textDark mb-1">PRIX ACHAT (€)</span>
                      <Input 
                        className="!bg-black !py-2 !px-3 !text-sm !font-black !w-24 text-center"
                        value={p.prixAchat}
                        onChange={e => handleUpdateProduct(p.id, { prixAchat: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase text-natif-accent mb-1 italic">PRIX VENTE (€)</span>
                      <Input 
                        className="!bg-black !py-2 !px-3 !text-sm !font-black !w-24 text-center border-natif-accent/30"
                        value={p.prixVente}
                        onChange={e => handleUpdateProduct(p.id, { prixVente: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </Card>
      )}

      {activeTab === 'commissions' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
              <div>
                <h2 className="text-xl font-black uppercase italic">Historique des Commissions</h2>
                <p className="text-[10px] text-natif-textDark font-black uppercase tracking-widest mt-1">Sélectionnez la période à consulter</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                 <select 
                   className="flex-1 sm:w-40 bg-black border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-natif-accent appearance-none cursor-pointer"
                   value={selectedMonth}
                   onChange={e => setSelectedMonth(parseInt(e.target.value))}
                 >
                   {moisArr.map((m, i) => <option key={m} value={i}>{m}</option>)}
                 </select>
                 <select 
                   className="w-24 bg-black border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-natif-accent appearance-none cursor-pointer"
                   value={selectedYear}
                   onChange={e => setSelectedYear(parseInt(e.target.value))}
                 >
                   {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.coaches.map(coach => {
                const stats = getCoachCommission(coach.name, displayMonth);
                const progress = (stats.totalVentes / COMMISSION_THRESHOLD) * 100;
                return (
                  <Card key={coach.id} className="relative overflow-hidden group border-none ring-1 ring-white/10 !p-8">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-natif-accent/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-110" />
                     <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-natif-accent to-natif-accentDark flex items-center justify-center font-black text-xl text-white shadow-xl shadow-natif-accent/20 italic">
                             {coach.name.charAt(0)}
                           </div>
                           <div>
                              <div className="font-black text-white text-lg uppercase italic tracking-tight">{coach.name}</div>
                              <Badge variant="blue" className="!bg-blue-500/10 border-blue-500/20">{displayMonth} {selectedYear}</Badge>
                           </div>
                        </div>
                        
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-natif-textDark">
                                 <span>Ventes Boutique</span>
                                 <span className="text-white font-black">{stats.totalVentes.toFixed(2)}€</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                                 <div className={`h-full transition-all duration-1000 ${stats.taux === 15 ? 'bg-emerald-500' : 'bg-natif-accent'}`} style={{ width: `${Math.min(100, progress)}%` }} />
                              </div>
                           </div>
                           <div className="pt-4 flex justify-between items-end border-t border-white/5">
                              <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[3px] text-natif-accent italic">Comm. {stats.taux}%</span>
                                <div className="text-4xl font-black tracking-tighter text-white italic">{stats.commission.toFixed(2)}€</div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </Card>
                );
              })}
           </div>
        </div>
      )}
      
      {activeTab === 'manager' && !isManagerAuthorized && (
        <div className="flex justify-center items-center py-20">
           <Card className="w-full max-w-sm !p-12 text-center space-y-8 shadow-2xl">
              <div className="w-20 h-20 bg-natif-accent/10 rounded-full flex items-center justify-center text-natif-accent mx-auto shadow-inner">
                 <TargetIcon size={36} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic">Direction {state.studio?.name || 'VELATRA'}</h2>
                <p className="text-[9px] font-black text-natif-textDark uppercase tracking-[4px] mt-2">Bilan Financier Restreint</p>
              </div>
              <Input type="password" placeholder="Code secret" className="text-center font-black !bg-black" value={pwd} onChange={e => setPwd(e.target.value)} />
              <Button fullWidth onClick={() => {
                if(pwd === "thomas2025") setIsManagerAuthorized(true);
                else showToast("Code erroné", "error");
              }} className="italic font-black">AUTHENTIFIER</Button>
           </Card>
        </div>
      )}
      {/* ... (Reste de la logique Manager avec calculateManagerStats inchangée) ... */}
    </div>
  );
};
