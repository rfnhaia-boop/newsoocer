'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '@/context/FinanceContext';
import { Wallet, Settings, Users, ArrowLeft, Check, Plus, Trash2, ArrowRightLeft, Target } from 'lucide-react';
import Link from 'next/link';

export default function FinanceDashboard() {
  const { state, addPlayer, togglePaid, removePlayer, updateConfig, changePlayerType } = useFinance();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerType, setNewPlayerType] = useState<'mensalista' | 'avulso'>('mensalista');
  const [showSettings, setShowSettings] = useState(false);

  const [courtCostInput, setCourtCostInput] = useState(state.config.courtCost.toString());
  const [mensalInput, setMensalInput] = useState(state.config.mensalistaPrice.toString());
  const [avulsoInput, setAvulsoInput] = useState(state.config.avulsoPrice.toString());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    addPlayer(newPlayerName.trim(), newPlayerType);
    setNewPlayerName('');
  };

  const handleSaveSettings = () => {
    updateConfig({
      courtCost: Number(courtCostInput) || 0,
      mensalistaPrice: Number(mensalInput) || 0,
      avulsoPrice: Number(avulsoInput) || 0,
    });
    // Immediately update existing players to reflect new prices, but only for those whose amounts match the old config or forcefully.
    // To keep it simple, we just let the context update the config, but existing players keep their current amountPaid
    // unless their type is changed later. The user prompt wanted a simple way.
    setShowSettings(false);
  };

  // Calculations
  const { mensalistas, avulsos, totalCollected, totalExpected } = useMemo(() => {
    const mensalistas = state.players.filter(p => p.type === 'mensalista');
    const avulsos = state.players.filter(p => p.type === 'avulso');
    
    // Total collected so far (only paid)
    const totalCollected = state.players.reduce((sum, p) => p.hasPaid ? sum + p.amountPaid : sum, 0);
    
    // Total expected (assuming all pay their amount)
    const totalExpected = state.players.reduce((sum, p) => sum + p.amountPaid, 0);

    return { mensalistas, avulsos, totalCollected, totalExpected };
  }, [state.players]);

  const percentage = Math.min(Math.round((totalCollected / (state.config.courtCost || 1)) * 100), 100);
  const remainingQuadra = Math.max(state.config.courtCost - totalCollected, 0);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0B0E14] to-[#0B0E14] pointer-events-none" />
      
      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Voltar ao Gerenciador de Partidas
            </Link>
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
              <Wallet className="text-emerald-400" size={32} />
              Controle Financeiro
            </h1>
            <p className="text-gray-400 mt-2">Gerencie mensalistas, avulsos e os custos da quadra do mês.</p>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <Settings size={18} />
            Configurações
          </button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Configuração de Valores (R$)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      Custo da Quadra
                    </label>
                    <input
                      type="number"
                      value={courtCostInput}
                      onChange={(e) => setCourtCostInput(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      Valor Mensalista
                    </label>
                    <input
                      type="number"
                      value={mensalInput}
                      onChange={(e) => setMensalInput(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      Valor Avulso
                    </label>
                    <input
                      type="number"
                      value={avulsoInput}
                      onChange={(e) => setAvulsoInput(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className="rounded-xl border border-emerald-500/50 bg-emerald-500/20 px-6 py-2.5 text-sm font-bold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white"
                  >
                    Salvar Valores
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Progress Card */}
          <div className="col-span-1 md:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Target size={100} />
            </div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Status da Quadra</h2>
            
            <div className="flex items-end gap-3 mb-4">
              <span className="text-5xl font-black text-white">R$ {totalCollected}</span>
              <span className="text-lg font-medium text-gray-500 mb-1">/ R$ {state.config.courtCost}</span>
            </div>

            <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden mb-3 border border-white/5 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full relative overflow-hidden ${percentage >= 100 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-emerald-500 to-cyan-400'}`}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className={percentage >= 100 ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                {percentage >= 100 
                  ? `Quadra paga! Sobra de R$ ${totalCollected - state.config.courtCost}` 
                  : `Falta R$ ${remainingQuadra}`}
              </span>
              <span className="text-gray-400 font-medium">{percentage}% concluído</span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-bl from-white/5 to-transparent p-6 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Resumo do Mês</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-gray-300 flex items-center gap-2"><Users size={16} className="text-emerald-400"/> Mensalistas</span>
                  <span className="text-xl font-bold">{mensalistas.length}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-gray-300 flex items-center gap-2"><Users size={16} className="text-amber-400"/> Avulsos</span>
                  <span className="text-xl font-bold">{avulsos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Previsto</span>
                  <span className="text-lg font-bold text-emerald-400">R$ {totalExpected}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Player Input */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-8">
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nome do jogador..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewPlayerType('mensalista')}
                className={`flex-1 sm:flex-none rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                  newPlayerType === 'mensalista'
                    ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                Mensalista
              </button>
              <button
                type="button"
                onClick={() => setNewPlayerType('avulso')}
                className={`flex-1 sm:flex-none rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                  newPlayerType === 'avulso'
                    ? 'bg-amber-500/20 border border-amber-500 text-amber-400'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                Avulso
              </button>
            </div>
            <button
              type="submit"
              disabled={!newPlayerName.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Adicionar
            </button>
          </form>
        </div>

        {/* Players Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mensalistas */}
          <div>
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
                Mensalistas ({mensalistas.length})
              </h3>
            </div>
            
            <div className="flex flex-col gap-2">
              {mensalistas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
                  Nenhum mensalista cadastrado
                </div>
              ) : (
                mensalistas.map(player => (
                  <PlayerFinanceRow 
                    key={player.id} 
                    player={player} 
                    onToggle={() => togglePaid(player.id, player.hasPaid)}
                    onRemove={() => removePlayer(player.id)}
                    onChangeType={() => changePlayerType(player.id, 'avulso')}
                  />
                ))
              )}
            </div>
          </div>

          {/* Avulsos */}
          <div>
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400">
                Avulsos ({avulsos.length})
              </h3>
            </div>
            
            <div className="flex flex-col gap-2">
              {avulsos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
                  Nenhum avulso cadastrado
                </div>
              ) : (
                avulsos.map(player => (
                  <PlayerFinanceRow 
                    key={player.id} 
                    player={player} 
                    onToggle={() => togglePaid(player.id, player.hasPaid)}
                    onRemove={() => removePlayer(player.id)}
                    onChangeType={() => changePlayerType(player.id, 'mensalista')}
                  />
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function PlayerFinanceRow({ player, onToggle, onRemove, onChangeType }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={`group flex items-center justify-between rounded-xl border p-3 transition-all ${
        player.hasPaid 
          ? 'border-emerald-500/30 bg-emerald-500/5' 
          : 'border-white/5 bg-white/[0.02] hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`flex h-6 w-6 items-center justify-center rounded-md border transition-all ${
            player.hasPaid
              ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : 'border-white/20 bg-black/20 text-transparent hover:border-emerald-500/50'
          }`}
        >
          <Check size={14} className="stroke-[3]" />
        </button>
        <div>
          <span className={`font-semibold transition-colors ${player.hasPaid ? 'text-white' : 'text-gray-300'}`}>
            {player.name}
          </span>
          <div className="text-[11px] text-gray-500 font-medium">
            R$ {player.amountPaid.toFixed(2)}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onChangeType}
          title={`Mudar para ${player.type === 'mensalista' ? 'Avulso' : 'Mensalista'}`}
          className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowRightLeft size={14} />
        </button>
        <button
          onClick={onRemove}
          className="p-2 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

