'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, UserMinus, Shield, Zap, AlertTriangle, Check } from 'lucide-react';
import { Player, Team, SubstitutionRecord } from '@/types';
import { useGame } from '@/context/GameContext';
import Modal from '@/components/ui/Modal';

interface PlayerSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTeam?: Team;
  preselectedPlayer?: Player;
}

type SubReason = 'injury' | 'voluntary' | 'tactical';

export default function PlayerSwapModal({
  isOpen,
  onClose,
  preselectedTeam,
  preselectedPlayer,
}: PlayerSwapModalProps) {
  const { state, swapPlayer } = useGame();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(preselectedTeam || null);
  const [outPlayer, setOutPlayer] = useState<Player | null>(preselectedPlayer || null);
  const [inPlayer, setInPlayer] = useState<Player | null>(null);
  const [isPermanent, setIsPermanent] = useState(false);
  const [reason, setReason] = useState<SubReason>('tactical');
  const [step, setStep] = useState<'selectOut' | 'selectIn' | 'confirm'>(
    preselectedPlayer ? 'selectIn' : 'selectOut'
  );

  const allTeamPlayers = [...state.teams, ...state.teamQueue];
  const benchPlayers = state.benchPlayers.filter((p) => p.status === 'active');

  const handleSelectOut = (team: Team, player: Player) => {
    setSelectedTeam(team);
    setOutPlayer(player);
    setStep('selectIn');
  };

  const handleSelectIn = (player: Player) => {
    setInPlayer(player);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!outPlayer || !inPlayer || !selectedTeam) return;

    const sub: SubstitutionRecord = {
      id: `sub-${Date.now()}`,
      outPlayerId: outPlayer.id,
      outPlayerName: outPlayer.name,
      inPlayerId: inPlayer.id,
      inPlayerName: inPlayer.name,
      teamId: selectedTeam.id,
      matchNumber: state.matchNumber,
      isPermanent,
      reason,
    };

    swapPlayer(sub);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedTeam(null);
    setOutPlayer(null);
    setInPlayer(null);
    setIsPermanent(false);
    setReason('tactical');
    setStep(preselectedPlayer ? 'selectIn' : 'selectOut');
  };

  if (!isOpen) return null;

  const reasons: { value: SubReason; label: string; icon: typeof AlertTriangle; color: string }[] = [
    { value: 'injury', label: 'Lesão', icon: AlertTriangle, color: '#ef4444' },
    { value: 'voluntary', label: 'Saiu', icon: UserMinus, color: '#f59e0b' },
    { value: 'tactical', label: 'Tática', icon: Zap, color: '#3b82f6' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { handleReset(); onClose(); }}
      title="Substituição"
      subtitle={
        step === 'selectOut'
          ? 'Selecione o jogador que vai sair'
          : step === 'selectIn'
          ? 'Selecione quem vai entrar no lugar'
          : 'Confirme a substituição'
      }
    >
      <AnimatePresence mode="wait">
        {/* Step 1: Select player leaving */}
        {step === 'selectOut' && (
          <motion.div
            key="selectOut"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {allTeamPlayers.map((team) => (
              <div key={team.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {team.name}
                  </span>
                </div>
                <div className="space-y-1">
                  {team.players.map((player) => (
                    <motion.button
                      key={player.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectOut(team, player)}
                      className="flex w-full items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 transition-all hover:border-red-500/30 hover:bg-red-500/5"
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: `${team.color}30` }}
                      >
                        {player.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="flex-1 text-left text-sm font-medium text-gray-300">
                        {player.name}
                      </span>
                      <ArrowLeftRight size={14} className="text-gray-600" />
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Step 2: Select replacement from bench */}
        {step === 'selectIn' && (
          <motion.div
            key="selectIn"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Showing who is leaving */}
            {outPlayer && selectedTeam && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: `${selectedTeam.color}40` }}
                >
                  {outPlayer.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{outPlayer.name}</p>
                  <p className="text-xs text-red-400">Saindo do {selectedTeam.name}</p>
                </div>
                <UserMinus size={16} className="text-red-400" />
              </div>
            )}

            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Banco de Reservas ({benchPlayers.length})
              </span>
            </div>

            {benchPlayers.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
                <p className="text-sm text-gray-500">Nenhum jogador no banco</p>
                <p className="mt-1 text-xs text-gray-600">
                  Todos os jogadores estão em times
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {benchPlayers.map((player) => (
                  <motion.button
                    key={player.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectIn(player)}
                    className="flex w-full items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                      {player.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="flex-1 text-left text-sm font-medium text-gray-300">
                      {player.name}
                    </span>
                    <Check size={14} className="text-gray-600" />
                  </motion.button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setOutPlayer(null);
                setSelectedTeam(null);
                setStep('selectOut');
              }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Voltar
            </button>
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && outPlayer && inPlayer && selectedTeam && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-5"
          >
            {/* Swap visual */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
                  style={{ backgroundColor: `${selectedTeam.color}40`, boxShadow: `0 8px 20px ${selectedTeam.color}20` }}
                >
                  {outPlayer.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-red-400">{outPlayer.name}</span>
                <span className="text-[10px] text-gray-500">SAI</span>
              </div>

              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowLeftRight size={24} className="text-emerald-400" />
              </motion.div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/20 text-sm font-bold text-emerald-400 shadow-lg shadow-emerald-500/10">
                  {inPlayer.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-emerald-400">{inPlayer.name}</span>
                <span className="text-[10px] text-gray-500">ENTRA</span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                Motivo
              </span>
              <div className="flex gap-2">
                {reasons.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setReason(r.value)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      reason === r.value
                        ? 'border-white/20 bg-white/10 text-white'
                        : 'border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300'
                    }`}
                  >
                    <r.icon size={12} style={{ color: reason === r.value ? r.color : undefined }} />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Permanent toggle */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div>
                <p className="text-sm font-semibold text-white">Troca Permanente</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isPermanent
                    ? 'Jogador fica no time para todo o torneio'
                    : 'Jogador volta ao time original no próximo jogo'}
                </p>
              </div>
              <button
                onClick={() => setIsPermanent(!isPermanent)}
                className={`relative h-7 w-12 rounded-full transition-all duration-300 ${
                  isPermanent ? 'bg-emerald-500' : 'bg-white/10'
                }`}
              >
                <motion.div
                  className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
                  animate={{ left: isPermanent ? '24px' : '4px' }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setInPlayer(null);
                  setStep('selectIn');
                }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                ← Voltar
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
              >
                Confirmar Troca
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
