
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { UserRole, Order, OrderStatus, UserProfile } from './types';
import { analyzeFairPricing } from './services/geminiService';

// --- Mock Data ---
const INITIAL_ORDERS: Order[] = [
  {
    id: '1',
    storeId: 's1',
    storeName: 'Pizzaria do Bairro',
    pickupLocation: { address: 'Rua das Flores, 123', lat: -23.5505, lng: -46.6333 },
    dropoffLocation: { address: 'Av. Paulista, 1000', lat: -23.5615, lng: -46.6560 },
    distance: 4.5,
    price: 12.50,
    estimatedTime: 25,
    status: OrderStatus.PENDING,
    createdAt: Date.now() - 1000 * 60 * 5,
  },
  {
    id: '2',
    storeId: 's2',
    storeName: 'Sushi Express',
    pickupLocation: { address: 'Shopping Center, Loja 4', lat: -23.5855, lng: -46.6765 },
    dropoffLocation: { address: 'Rua Augusta, 500', lat: -23.5596, lng: -46.6588 },
    distance: 2.1,
    price: 8.00,
    estimatedTime: 15,
    status: OrderStatus.PENDING,
    createdAt: Date.now() - 1000 * 60 * 15,
  }
];

// --- Components ---

const Layout: React.FC<{ children: React.ReactNode, role: UserRole }> = ({ children, role }) => {
  return (
    <div className="flex flex-col min-h-screen pb-20 bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-orange-600 tracking-tighter">RAPZ</h1>
            <p className="text-[10px] text-gray-400 font-medium leading-tight">Quem entrega, Conecta!</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${role === UserRole.RIDER ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
              {role === UserRole.RIDER ? 'Motoboy' : 'Estabelecimento'}
            </span>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto w-full flex-1 p-4">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <Link to="/" className="flex flex-col items-center text-gray-600 hover:text-orange-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px] mt-1 font-medium">Início</span>
          </Link>
          <Link to="/deliveries" className="flex flex-col items-center text-gray-600 hover:text-orange-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            <span className="text-[10px] mt-1 font-medium">Histórico</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-gray-600 hover:text-orange-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[10px] mt-1 font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

// --- Views ---

const RiderHome: React.FC<{ 
  orders: Order[], 
  onAccept: (id: string) => void,
  onComplete: (id: string) => void
}> = ({ orders, onAccept, onComplete }) => {
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
  const activeOrder = orders.find(o => o.status === OrderStatus.ACCEPTED || o.status === OrderStatus.PICKED_UP);

  const openRouteMap = (order: Order) => {
    const { pickupLocation, dropoffLocation } = order;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${pickupLocation.lat},${pickupLocation.lng}&destination=${dropoffLocation.lat},${dropoffLocation.lng}&travelmode=motorcycle`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-lg font-bold">Olá, João! 🏍️</h2>
          <p className="text-sm opacity-90">
            {activeOrder ? 'Você tem uma entrega em andamento.' : `Existem ${pendingOrders.length} entregas próximas de você.`}
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <h1 className="text-6xl font-black italic">RAPZ</h1>
        </div>
      </div>

      {activeOrder && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-700 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            Entrega Ativa
          </h3>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-xl text-gray-900">{activeOrder.storeName}</h3>
                <p className="text-sm text-gray-500">Ganhos: <span className="font-bold text-green-600">R$ {activeOrder.price.toFixed(2)}</span></p>
              </div>
            </div>
            
            <div className="space-y-3 py-2 border-y border-gray-50">
              <div className="flex items-start">
                <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Retirada</p>
                  <p className="text-sm text-gray-700 font-medium">{activeOrder.pickupLocation.address}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-orange-100 p-1.5 rounded-lg mr-3">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Entrega</p>
                  <p className="text-sm text-gray-800 font-bold">{activeOrder.dropoffLocation.address}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => openRouteMap(activeOrder)}
                className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition flex items-center justify-center space-x-2 shadow-lg active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 7m0 10V7" /></svg>
                <span>Ver Rota</span>
              </button>
              <button 
                onClick={() => onComplete(activeOrder.id)}
                className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition shadow-lg active:scale-95"
              >
                Concluir RAPZ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-bold text-gray-700">Disponíveis Próximas</h3>
        {pendingOrders.map(order => (
          <div key={order.id} className={`bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col space-y-3 ${activeOrder ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{order.storeName}</h3>
                <span className="text-xs text-gray-500 uppercase font-semibold">{order.distance} km de distância</span>
              </div>
              <span className="text-lg font-bold text-green-600">R$ {order.price.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2 py-2 border-y border-gray-50">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-gray-600 truncate">{order.pickupLocation.address}</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                <span className="text-gray-700 font-medium truncate">{order.dropoffLocation.address}</span>
              </div>
            </div>

            <button 
              onClick={() => onAccept(order.id)}
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition shadow-md active:scale-95"
            >
              Aceitar Entrega
            </button>
          </div>
        ))}

        {pendingOrders.length === 0 && !activeOrder && (
          <div className="text-center py-20">
            <p className="text-gray-400">Nenhuma entrega disponível no momento...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StoreHome: React.FC<{ orders: Order[], onNewOrder: (o: Order) => void }> = ({ orders, onNewOrder }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [distance, setDistance] = useState(2);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ price: number, time: number, justification: string } | null>(null);

  const myOrders = orders.filter(o => o.storeId === 's1');

  const handleEstimate = async () => {
    if (!address) return;
    setLoading(true);
    const result = await analyzeFairPricing(distance, false);
    setAiAnalysis({
      price: result.fairPrice,
      time: result.estimatedTime,
      justification: result.justification
    });
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!aiAnalysis) return;
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      storeId: 's1',
      storeName: 'Pizzaria do Bairro',
      pickupLocation: { address: 'Minha Loja, 500', lat: -23.5505, lng: -46.6333 },
      dropoffLocation: { address, lat: -23.5596, lng: -46.6588 },
      distance: distance,
      price: aiAnalysis.price,
      estimatedTime: aiAnalysis.time,
      status: OrderStatus.PENDING,
      createdAt: Date.now(),
    };
    onNewOrder(newOrder);
    setIsModalOpen(false);
    setAddress('');
    setAiAnalysis(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-orange-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-lg font-bold">RAPZ Delivery 🍕</h2>
          <p className="text-sm opacity-90">Chame um motoboy em segundos e conecte sua loja ao destino.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full bg-white text-orange-600 font-bold py-3 rounded-lg shadow-md active:scale-95"
          >
            Nova Entrega
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <h1 className="text-6xl font-black italic">RAPZ</h1>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-gray-700">Pedidos Ativos</h3>
        {myOrders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                {order.status === OrderStatus.PENDING ? 'PROCURANDO MOTOBOY' : 'EM TRÂNSITO'}
              </span>
              <span className="text-sm font-bold">R$ {order.price.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">Destino: {order.dropoffLocation.address}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Solicitar RAPZ</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 text-2xl">&times;</button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Endereço de Entrega</label>
                <input 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-orange-500" 
                  placeholder="Rua Exemplo, 123" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Distância Estimada (km)</label>
                <input 
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-orange-500" 
                />
              </div>

              {!aiAnalysis && (
                <button 
                  onClick={handleEstimate}
                  disabled={loading || !address}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl disabled:bg-gray-300"
                >
                  {loading ? 'Consultando RAPZ IA...' : 'Analisar Preço Justo'}
                </button>
              )}

              {aiAnalysis && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between font-bold text-green-800">
                    <span>Preço RAPZ:</span>
                    <span>R$ {aiAnalysis.price.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-green-700 italic leading-tight">{aiAnalysis.justification}</p>
                  <p className="text-xs text-green-800">Tempo estimado: {aiAnalysis.time} min</p>
                  
                  <button 
                    onClick={handleSubmit}
                    className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl mt-2"
                  >
                    Confirmar Chamado
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SwitchRole: React.FC<{ current: UserRole, onSwitch: (r: UserRole) => void }> = ({ current, onSwitch }) => {
  return (
    <div className="flex bg-gray-200 p-1 rounded-lg">
      <button 
        onClick={() => onSwitch(UserRole.RIDER)}
        className={`flex-1 py-2 text-xs font-bold rounded-md transition ${current === UserRole.RIDER ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
      >
        SOU MOTOBOY
      </button>
      <button 
        onClick={() => onSwitch(UserRole.STORE)}
        className={`flex-1 py-2 text-xs font-bold rounded-md transition ${current === UserRole.STORE ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}
      >
        SOU DELIVERY
      </button>
    </div>
  );
};

function App() {
  const [role, setRole] = useState<UserRole>(UserRole.RIDER);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  const handleAcceptOrder = (id: string) => {
    const active = orders.find(o => o.status === OrderStatus.ACCEPTED || o.status === OrderStatus.PICKED_UP);
    if (active) {
      alert('Você já possui uma entrega ativa!');
      return;
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: OrderStatus.ACCEPTED, riderId: 'r1' } : o));
    alert('Entrega aceita no RAPZ! Vá até o estabelecimento.');
  };

  const handleCompleteOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: OrderStatus.DELIVERED } : o));
    alert('Parabéns! Entrega concluída com sucesso.');
  };

  const handleNewOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <HashRouter>
      <Layout role={role}>
        <div className="mb-6">
          <SwitchRole current={role} onSwitch={setRole} />
        </div>
        
        <Routes>
          <Route path="/" element={
            role === UserRole.RIDER 
              ? <RiderHome orders={orders} onAccept={handleAcceptOrder} onComplete={handleCompleteOrder} /> 
              : <StoreHome orders={orders} onNewOrder={handleNewOrder} />
          } />
          <Route path="/deliveries" element={
            <div className="space-y-4">
               <h2 className="text-xl font-bold">Minhas Conexões</h2>
               <div className="space-y-3">
                 {orders.filter(o => o.status === OrderStatus.DELIVERED).map(o => (
                   <div key={o.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 opacity-75">
                      <div className="flex justify-between text-sm font-bold mb-1">
                        <span>{o.storeName}</span>
                        <span className="text-green-600 font-black">ENTREGUE</span>
                      </div>
                      <div className="flex justify-between items-end">
                         <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                         <p className="font-bold text-gray-800">R$ {o.price.toFixed(2)}</p>
                      </div>
                   </div>
                 ))}
                 {orders.filter(o => o.status === OrderStatus.DELIVERED).length === 0 && (
                   <p className="text-center text-gray-400 py-10">Você ainda não realizou entregas RAPZ.</p>
                 )}
               </div>
            </div>
          } />
          <Route path="/profile" element={
            <div className="space-y-6">
               <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold">R</div>
                  <div>
                    <h2 className="text-xl font-bold">{role === UserRole.RIDER ? 'Motoboy Parceiro' : 'Gerente RAPZ'}</h2>
                    <p className="text-sm text-gray-500">Conectado desde 2025 • ⭐ 4.9</p>
                  </div>
               </div>
               <div className="space-y-2">
                 <button className="w-full text-left p-4 bg-white rounded-xl shadow-sm font-medium flex justify-between items-center">
                   <span>Configurações da Conta</span>
                   <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                 </button>
                 <button className="w-full text-left p-4 bg-white rounded-xl shadow-sm font-medium flex justify-between items-center">
                   <span>Central de Ajuda</span>
                   <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                 </button>
                 <button className="w-full text-left p-4 bg-white rounded-xl shadow-sm font-medium text-red-600">Sair do RAPZ</button>
               </div>
            </div>
          } />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
