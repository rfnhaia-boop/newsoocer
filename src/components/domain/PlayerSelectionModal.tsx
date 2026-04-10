'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Users, UserPlus, UserMinus, ListTodo, FileText, Wallet, ClipboardCopy } from 'lucide-react';
import { Player } from '@/types';
import { parsePlayerList } from '@/utils/parsePlayerList';
import { useFinance } from '@/context/FinanceContext';

interface PlayerSelectionModalProps {
  players: Player[];
  selectedPlayers: Player[];
  onToggle: (player: Player) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSetFromList: (players: Player[]) => void;
  minPlayers: number;
}

export default function PlayerSelectionModal({
  players,
  selectedPlayers,
  onToggle,
  onSelectAll,
  onClearAll,
  onSetFromList,
  minPlayers,
}: PlayerSelectionModalProps) {
  const [activeTab, setActiveTab] = useState<'mensalista' | 'enviar'>('mensalista');
  const [listText, setListText] = useState('');
  const { state: financeState, addPlayer, changePlayerType } = useFinance();

  const isSelected = (id: string) =>
    selectedPlayers.some((p) => p.id === id);

  const handleProcessList = () => {
    const parsedPlayers = parsePlayerList(listText);
    onSetFromList(parsedPlayers);
    setActiveTab('mensalista'); // Voltar para a aba de mensalistas para ver o resultado
  };

  const handleSetFinanceType = (e: React.MouseEvent, playerName: string, newType: 'mensalista' | 'avulso') => {
    e.stopPropagation();
    
    // Check if player exists in finance context
    const existing = financeState.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (existing) {
      changePlayerType(existing.id, newType);
    } else {
      addPlayer(playerName, newType);
    }
  };

  const getFinanceType = (playerName: string) => {
    return financeState.players.find(p => p.name.toLowerCase() === playerName.toLowerCase())?.type;
  };

  const handleCopyList = () => {
    let text = '⚽ *LISTA DE PRESENÇA* ⚽\n\n';
    selectedPlayers.forEach((p, index) => {
      text += `${index + 1}. ${p.name}\n`;
    });
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => alert('Lista copiada com sucesso!'))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.bottom = "0";
    textArea.style.right = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert('Lista copiada com sucesso!');
    } catch (err) {
      console.error('Falha no fallback de cópia', err);
      alert('Ops! O navegador bloqueou a cópia. Tente copiar manualmente.');
    }
    textArea.remove();
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 rounded-xl bg-white/5 p-1">
        <button
          onClick={() => setActiveTab('mensalista')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
            activeTab === 'mensalista'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ListTodo size={16} />
          Mensalistas
        </button>
        <button
          onClick={() => setActiveTab('enviar')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
            activeTab === 'enviar'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText size={16} />
          Enviar Lista
        </button>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users size={16} />
          <span>
            <span className={`font-semibold ${selectedPlayers.length >= minPlayers ? 'text-emerald-400' : 'text-amber-400'}`}>
              {selectedPlayers.length}
            </span>
            {' '}selecionados (mín. {minPlayers})
          </span>
        </div>
        {activeTab === 'mensalista' && (
          <div className="flex gap-2">
            <button
              onClick={handleCopyList}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/30 hover:text-emerald-300"
              title="Copiar lista de confirmados"
            >
              <ClipboardCopy size={14} /> Copiar
            </button>
            <button
              onClick={onSelectAll}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <UserPlus size={14} /> Todos
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <UserMinus size={14} /> Limpar
            </button>
          </div>
        )}
      </div>

      {activeTab === 'mensalista' ? (
        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
          {/* Se a lista enviada substituiu tudo e não há IDs correspondentes com mensalistas, vamos exibir eles também */}
          {players.length > 0 ? players.map((player, i) => {
            const selected = isSelected(player.id);
            return (
              <motion.button
                key={player.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => onToggle(player)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                  selected
                    ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all duration-200 ${
                    selected
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {selected ? <Check size={16} /> : player.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`truncate text-sm font-medium ${selected ? 'text-white' : 'text-gray-300'}`}>
                      {player.name}
                    </p>
                  </div>
                  {selected && (
                    <div className="mt-1 flex gap-1" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={(e) => handleSetFinanceType(e, player.name, 'mensalista')}
                        className={`text-[10px] px-2 py-0.5 rounded transition-all ${getFinanceType(player.name) === 'mensalista' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                      >
                        Mensalista
                      </button>
                      <button 
                        onClick={(e) => handleSetFinanceType(e, player.name, 'avulso')}
                        className={`text-[10px] px-2 py-0.5 rounded transition-all ${getFinanceType(player.name) === 'avulso' ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                      >
                        Avulso
                      </button>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          }) : (
            <div className="col-span-2 py-8 text-center text-sm text-gray-500">
              Nenhum jogador na base de dados.
            </div>
          )}
          
          {/* Mostra também os jogadores avulsos (convidados/lista) que foram selecionados mas não estão na lista de players */}
          {selectedPlayers.filter(sp => !players.some(p => p.id === sp.id)).map((player, i) => (
             <motion.button
              key={player.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onToggle(player)}
              className="flex items-center gap-3 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3 text-left shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all duration-200"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/25">
                <Check size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {player.name}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-emerald-400">Pela lista</span>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={(e) => handleSetFinanceType(e, player.name, 'mensalista')}
                      className={`text-[10px] px-2 py-0.5 rounded transition-all ${getFinanceType(player.name) === 'mensalista' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                      Mensalista
                    </button>
                    <button 
                      onClick={(e) => handleSetFinanceType(e, player.name, 'avulso')}
                      className={`text-[10px] px-2 py-0.5 rounded transition-all ${getFinanceType(player.name) === 'avulso' ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                      Avulso
                    </button>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <p className="text-sm text-gray-400 leading-relaxed">
            Cole a lista final do WhatsApp aqui. O sistema entenderá quem confirmou, vai ignorar quem estiver com ❌ e adicionar convidados entre parênteses.
          </p>
          <textarea
            value={listText}
            onChange={(e) => setListText(e.target.value)}
            placeholder="Exemplo:&#10;1- Reis ⚽&#10;2- Trabuco ❌ (Danilo)&#10;3- (Eduardo)&#10;4- Miguel Dias ⚽"
            className="h-64 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300 placeholder-white/20 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/10 focus:ring-1 focus:ring-emerald-500/50"
            spellCheck={false}
          />
          <button
            onClick={handleProcessList}
            disabled={!listText.trim()}
            className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
              listText.trim()
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400'
                : 'cursor-not-allowed bg-white/10 text-gray-500'
            }`}
          >
            Processar e Confirmar Jogadores
          </button>
        </motion.div>
      )}
    </div>
  );
}
