import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import type { BoardSizeKey } from '../../types'
import { BotDifficulties, BoardSizeKeys, PlayerColors } from '../../types'
import { useGameStore } from '../../../../store/gameStore'
import { useUIStore } from '../../../../store/uiStore'
import { useAuthStore } from '../../../../store/authStore'
import { useGameMode } from '../../../../hooks'
import { Modal } from '../../../../components/Modal'
import { GameModes } from '../../../../constants'

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER

export const TopMenu = () => {
    const navigate = useNavigate()
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)

    const {
        gameState,
        boardSizeKey,
        botEnabled,
        botThinking,
        botDifficulty,
        resetGame,
        toggleBot,
        setDifficulty,
        reset: resetOnlineState,
        gameSession,
        getCurrentPlayer,
        getCurrentTurnPlayer,
        isMyTurn
    } = useGameStore()

    const { is3D, toggle3D, devMode, toggleDevMode, closeTopMenu } = useUIStore()
    const { username } = useAuthStore()
    const { showBot, showDev, mode } = useGameMode()
    
    const isOnline = mode === GameModes.ONLINE
    const isAdmin = username === ADMIN_USER

    const handleBoardSizeChange = (sizeKey: BoardSizeKey) => {
        resetGame(sizeKey)
        closeTopMenu()
    }

    const handleLeaveGame = () => {
        setIsLeaveModalOpen(true)
    }

    const handleConfirmLeave = () => {
        setIsLeaveModalOpen(false)
        closeTopMenu()
        
        if (isOnline) {
            resetOnlineState()
        } else {
            resetGame()
        }
        
        navigate('/')
    }

    const handleCancelLeave = () => {
        setIsLeaveModalOpen(false)
    }

    const players = gameSession?.players || []
    const currentPlayer = getCurrentPlayer()
    const currentTurnPlayer = getCurrentTurnPlayer()
    const myTurn = isMyTurn()
    const whitePlayer = players.find(p => p.color === PlayerColors.WHITE)
    const blackPlayer = players.find(p => p.color === PlayerColors.BLACK)
    const winnerPlayer = gameState.winner ? players.find(p => p.color === gameState.winner) : null
    const gameOver = gameState.gameOver
    const nightMode = gameState.nightMode

    const getStatusText = () => {
        if (isOnline) {
            if (gameOver && winnerPlayer) {
                return `${winnerPlayer.name} Wins!`
            }
            if (gameOver) {
                return 'Game Over'
            }
            if (!currentTurnPlayer) {
                return 'Waiting for players...'
            }
            if (myTurn) {
                return 'Your Turn'
            }
            return `${currentTurnPlayer.name}'s Turn`
        }

        if (gameOver && gameState.winner) {
            return `${gameState.winner === PlayerColors.WHITE ? 'White' : 'Black'} Wins!`
        }
        if (gameOver) {
            return 'Game Over'
        }
        return `${gameState.currentPlayer === PlayerColors.WHITE ? 'White' : 'Black'}'s Turn`
    }

    const getStatusColor = () => {
        if (gameOver) {
            return 'bg-rose-600 text-white'
        }
        const currentColor = isOnline ? currentTurnPlayer?.color : gameState.currentPlayer
        if (currentColor === PlayerColors.WHITE) {
            return 'bg-white text-stone-900 border border-stone-300'
        }
        return 'bg-stone-900 text-white border border-stone-600'
    }

    return (
        <>
            <div className="bg-stone-800/80 backdrop-blur rounded-xl p-3 border border-stone-700">
                <div className="flex flex-wrap items-end gap-4 justify-center">
                    {isOnline && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-stone-200 text-sm font-medium">
                                    {whitePlayer?.name || 'Waiting...'}
                                </span>
                                {currentPlayer?.color === PlayerColors.WHITE && (
                                    <span className="text-amber-400 text-xs">(You)</span>
                                )}
                            </div>
                            <span className="text-stone-500">vs</span>
                            <div className="flex items-center gap-2">
                                <span className="text-stone-200 text-sm font-medium">
                                    {blackPlayer?.name || 'Waiting...'}
                                </span>
                                {currentPlayer?.color === PlayerColors.BLACK && (
                                    <span className="text-amber-400 text-xs">(You)</span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor()}`}>
                        {getStatusText()}
                    </div>

                    {nightMode && (
                        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-700/80 text-violet-100 border border-violet-500">
                            Night Mode
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-medium text-amber-200">View</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggle3D}
                                className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${is3D ? 'bg-violet-600' : 'bg-stone-600'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${is3D ? 'translate-x-7' : 'translate-x-0'}`} />
                            </button>
                            <span className="text-xs text-stone-300">{is3D ? '3D' : '2D'}</span>
                        </div>
                    </div>

                    {!isOnline && (
                        <>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-medium text-amber-200">Size</span>
                                <select
                                    value={boardSizeKey}
                                    onChange={(e) => handleBoardSizeChange(e.target.value as BoardSizeKey)}
                                    className="bg-stone-700 text-amber-100 text-xs rounded px-2 py-1.5 border border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                                >
                                    <option value={BoardSizeKeys.SMALL}>Small (12×12)</option>
                                    <option value={BoardSizeKeys.MEDIUM}>Medium (12×16)</option>
                                    <option value={BoardSizeKeys.LARGE}>Large (12×20)</option>
                                </select>
                            </div>

                            {showBot && (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-medium text-amber-200">Bot</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={toggleBot}
                                            className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${botEnabled ? 'bg-emerald-600' : 'bg-stone-600'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${botEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                                        </button>
                                        {botEnabled && (
                                            <select
                                                value={botDifficulty}
                                                onChange={(e) => setDifficulty(e.target.value as typeof botDifficulty)}
                                                className="bg-stone-700 text-amber-100 text-xs rounded px-2 py-1 border border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                                            >
                                                <option value={BotDifficulties.EASY}>Easy</option>
                                                <option value={BotDifficulties.MEDIUM}>Medium</option>
                                                <option value={BotDifficulties.HARD}>Hard</option>
                                            </select>
                                        )}
                                        {botThinking && (
                                            <span className="text-xs text-stone-400">Thinking...</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {(showDev || (isOnline && isAdmin)) && (
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-medium text-orange-400">Dev</span>
                            <button
                                onClick={toggleDevMode}
                                className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${devMode ? 'bg-orange-600' : 'bg-stone-600'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${devMode ? 'translate-x-7' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleLeaveGame}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Leave</span>
                    </button>
                </div>
            </div>

            <Modal
                isOpen={isLeaveModalOpen}
                onClose={handleCancelLeave}
                title="Leave Game"
            >
                <div className="space-y-4">
                    <p className="text-stone-300">
                        {isOnline
                            ? 'Are you sure you want to leave this game? You will forfeit the match.'
                            : 'Are you sure you want to leave? Your current game progress will be lost.'}
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={handleCancelLeave}
                            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmLeave}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
                        >
                            Leave Game
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
