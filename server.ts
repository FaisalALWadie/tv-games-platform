import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import next from 'next'
import {
  ROOM_CREATE,
  ROOM_JOIN,
  ROOM_LEAVE,
  ROOM_STATE,
  PLAYER_JOINED,
  PLAYER_LEFT,
  ROOM_ERROR,
  FF_CREATE_WITH_CONFIG,
  FF_HOST_RECONNECT,
  FF_JOIN,
  FF_RECONNECT,
  FF_LEAVE,
  FF_STATE,
  FF_ERROR,
  FF_PLAYER_JOINED,
  FF_PLAYER_LEFT,
  FF_JOIN_TEAM_FULL,
  FF_UPDATE_SETTINGS,
  FF_SETTINGS_UPDATED,
  FF_START,
  FF_BUZZ,
  FF_SUBMIT_ANSWER,
  FF_ANSWER_RESULT,
  FF_HOST_NEXT,
  FF_HOST_RESTART,
  FF_HOST_REVEAL,
  FF_HOST_MISTAKE,
  FF_HOST_UPDATE_SCORES,
  FF_HOST_JUMP,
  FF_HOST_END,
  FF_HOST_RESET_ATTEMPTS,
  FF_HOST_RESTART_SAME_TEAMS,
  IMP_CREATE,
  IMP_JOIN,
  IMP_HOST_RECONNECT,
  IMP_RECONNECT,
  IMP_STATE,
  IMP_ERROR,
  IMP_WORD,
  IMP_START,
  IMP_VOTE,
  IMP_HOST_START_VOTING,
  IMP_HOST_NEXT,
  IMP_HOST_END,
  IMP_HOST_RESTART,
} from './src/shared/socket/events'
import { FAMILY_FEUD_QUESTIONS } from './src/app/games/game2-family-feud/questions'
import { validateAnswer, buildExactCache } from './src/app/games/game2-family-feud/validation'
import type {
  FFGameState,
  FFPlayer,
  GameSettings,
  Team,
  Question,
  BuzzerState,
} from './src/app/games/game2-family-feud/types'
import { getRandomWord } from './src/app/games/game3-impostor/words'
import type {
  ImpPhase,
  ImpSettings,
  ImpPlayer,
  ImpVoteResult,
  ImpStatePayload,
} from './src/app/games/game3-impostor/types'

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

interface Player {
  id: string
  name: string
}

interface Room {
  code: string
  hostSocketId: string
  gameId: string
  players: Player[]
  started: boolean
}

interface ImpGameState {
  roomCode: string
  hostSocketId: string
  phase: ImpPhase
  settings: ImpSettings
  players: ImpPlayer[]
  currentRound: number
  currentWord: string
  currentCategoryName: string
  impostorNames: string[]
  usedWords: Set<string>
  votes: Record<string, string>
  scores: { innocents: number; impostors: number }
  voteResult: ImpVoteResult | null
  winner: 'innocents' | 'impostors' | null
  timerStartedAt: number | null
}

function generateCode(rooms: Map<string, unknown>): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return rooms.has(code) ? generateCode(rooms) : code
}

function emitRoomState(io: SocketIOServer, room: Room) {
  io.to(room.code).emit(ROOM_STATE, {
    code: room.code,
    players: room.players,
    hostId: room.hostSocketId,
    gameId: room.gameId,
    started: room.started,
  })
}

// ─── Family Feud helpers ──────────────────────────────────────────────────────

const EMPTY_BUZZER: BuzzerState = { buzzedPlayerId: null, buzzedPlayerName: null, buzzedTeamId: null }

function makeTeams(s: GameSettings): { 1: Team; 2: Team } {
  return {
    1: { id: 1, name: s.team1Name, maxPlayers: s.team1MaxPlayers, score: 0, mistakes: 0, isLockedOut: false },
    2: { id: 2, name: s.team2Name, maxPlayers: s.team2MaxPlayers, score: 0, mistakes: 0, isLockedOut: false },
  }
}

function cloneQuestions(count: number): Question[] {
  return FAMILY_FEUD_QUESTIONS.slice(0, count).map((q) => ({
    ...q,
    answers: q.answers.map((a) => ({ ...a, revealed: false })),
  }))
}

function buildStatePayload(gs: FFGameState) {
  return {
    roomCode: gs.roomCode,
    players: gs.players,
    teams: gs.teams,
    settings: gs.settings,
    questionIndex: gs.questionIndex,
    question: gs.questions[gs.questionIndex] ?? null,
    status: gs.status,
    buzzer: gs.buzzer,
    winner: gs.winner,
  }
}

function emitState(io: SocketIOServer, gs: FFGameState) {
  io.to(gs.roomCode).emit(FF_STATE, buildStatePayload(gs))
}

function isTeamFull(gs: FFGameState, teamId: 1 | 2): boolean {
  const max = teamId === 1 ? gs.settings.team1MaxPlayers : gs.settings.team2MaxPlayers
  return max !== 999 && gs.players.filter((p) => p.teamId === teamId).length >= max
}

function resetQuestion(gs: FFGameState) {
  const q = gs.questions[gs.questionIndex]
  for (const a of q.answers) a.revealed = false
  gs.teams[1].mistakes = 0
  gs.teams[1].isLockedOut = false
  gs.teams[2].mistakes = 0
  gs.teams[2].isLockedOut = false
  gs.buzzer = { ...EMPTY_BUZZER }
  gs.status = 'playing'
}

function advanceQuestion(io: SocketIOServer, gs: FFGameState) {
  gs.questionIndex++
  if (gs.questionIndex >= gs.settings.totalRounds || gs.questionIndex >= gs.questions.length) {
    gs.status = 'game_over'
    gs.winner = gs.teams[1].score >= gs.teams[2].score ? 1 : 2
    gs.buzzer = { ...EMPTY_BUZZER }
  } else {
    resetQuestion(gs)
  }
  emitState(io, gs)
}

// ─── Impostor helpers ─────────────────────────────────────────────────────────

const impTimers = new Map<string, ReturnType<typeof setTimeout>>()

function clearImpTimer(roomCode: string) {
  const t = impTimers.get(roomCode)
  if (t) { clearTimeout(t); impTimers.delete(roomCode) }
}

function buildImpPayload(gs: ImpGameState): ImpStatePayload {
  const revealedImpostorNames: string[] =
    gs.phase === 'game_over'
      ? [...gs.impostorNames]
      : gs.phase === 'reveal' && gs.voteResult?.wasImpostor
        ? [gs.voteResult.eliminatedName]
        : []
  return {
    roomCode: gs.roomCode,
    phase: gs.phase,
    settings: gs.settings,
    players: gs.players,
    currentRound: gs.currentRound,
    currentCategoryName: gs.currentCategoryName,
    votes: gs.votes,
    scores: gs.scores,
    voteResult: gs.voteResult,
    winner: gs.winner,
    timerStartedAt: gs.timerStartedAt,
    revealedImpostorNames,
  }
}

function emitImpState(io: SocketIOServer, gs: ImpGameState) {
  io.to(gs.roomCode).emit(IMP_STATE, buildImpPayload(gs))
}

function sendImpWord(io: SocketIOServer, gs: ImpGameState) {
  for (const player of gs.players) {
    const sock = io.sockets.sockets.get(player.socketId)
    if (!sock) continue
    const isImpostor = gs.impostorNames.includes(player.name)
    sock.emit(IMP_WORD, {
      word: isImpostor ? null : gs.currentWord,
      isImpostor,
      categoryName: gs.currentCategoryName,
      roundNumber: gs.currentRound,
    })
  }
}

function startImpRound(io: SocketIOServer, gs: ImpGameState) {
  gs.currentRound++
  gs.votes = {}
  gs.voteResult = null
  for (const p of gs.players) p.hasVoted = false

  const active = gs.players.filter((p) => !p.isEliminated)
  const shuffled = [...active].sort(() => Math.random() - 0.5)
  const num = Math.min(gs.settings.numImpostors, Math.max(1, active.length - 2))
  gs.impostorNames = shuffled.slice(0, num).map((p) => p.name)

  const { word, categoryName } = getRandomWord(gs.settings.categoryId, gs.usedWords)
  gs.usedWords.add(word)
  gs.currentWord = word
  gs.currentCategoryName = categoryName
  gs.timerStartedAt = null
  gs.phase = 'word_reveal'

  emitImpState(io, gs)
  sendImpWord(io, gs)

  clearImpTimer(gs.roomCode)
  impTimers.set(gs.roomCode, setTimeout(() => {
    if (gs.phase !== 'word_reveal') return
    gs.phase = 'discussion'
    gs.timerStartedAt = gs.settings.timePerRound > 0 ? Date.now() : null
    emitImpState(io, gs)
    if (gs.settings.timePerRound > 0) {
      impTimers.set(gs.roomCode, setTimeout(() => {
        if (gs.phase !== 'discussion') return
        startImpVoting(io, gs)
      }, gs.settings.timePerRound * 1000))
    }
  }, 6000))
}

function startImpVoting(io: SocketIOServer, gs: ImpGameState) {
  clearImpTimer(gs.roomCode)
  gs.phase = 'voting'
  gs.timerStartedAt = null
  for (const p of gs.players) p.hasVoted = false
  gs.votes = {}
  emitImpState(io, gs)
}

function resolveImpVotes(io: SocketIOServer, gs: ImpGameState) {
  const voteCounts: Record<string, number> = {}
  for (const targetName of Object.values(gs.votes)) {
    voteCounts[targetName] = (voteCounts[targetName] ?? 0) + 1
  }

  let maxVotes = 0
  let candidates: string[] = []
  for (const [name, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) { maxVotes = count; candidates = [name] }
    else if (count === maxVotes) candidates.push(name)
  }

  const eliminatedName = candidates[Math.floor(Math.random() * candidates.length)] ?? ''
  const eliminated = gs.players.find((p) => p.name === eliminatedName)
  if (eliminated) eliminated.isEliminated = true

  const wasImpostor = eliminatedName ? gs.impostorNames.includes(eliminatedName) : false
  if (wasImpostor) gs.scores.innocents++
  else gs.scores.impostors++

  gs.voteResult = {
    eliminatedName,
    wasImpostor,
    voteCounts,
    secretWord: gs.currentWord,
    categoryName: gs.currentCategoryName,
  }
  gs.phase = 'reveal'
  emitImpState(io, gs)

  clearImpTimer(gs.roomCode)
  impTimers.set(gs.roomCode, setTimeout(() => {
    if (gs.phase !== 'reveal') return
    if (gs.currentRound >= gs.settings.totalRounds) {
      gs.phase = 'game_over'
      gs.winner = gs.scores.innocents >= gs.scores.impostors ? 'innocents' : 'impostors'
      emitImpState(io, gs)
    } else {
      startImpRound(io, gs)
    }
  }, 8000))
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res)
  })

  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
  })

  const rooms = new Map<string, Room>()
  const ffRooms = new Map<string, FFGameState>()
  const impRooms = new Map<string, ImpGameState>()

  io.on('connection', (socket) => {
    socket.on(ROOM_CREATE, ({ gameId }: { gameId: string }) => {
      const code = generateCode(rooms)
      const room: Room = {
        code,
        hostSocketId: socket.id,
        gameId,
        players: [],
        started: false,
      }
      rooms.set(code, room)
      socket.join(code)
      emitRoomState(io, room)
    })

    socket.on(ROOM_JOIN, ({ code, playerName }: { code: string; playerName: string }) => {
      const upperCode = code.toUpperCase()
      const room = rooms.get(upperCode)

      if (!room) {
        socket.emit(ROOM_ERROR, { message: 'رمز الغرفة غير صحيح' })
        return
      }
      if (room.started) {
        socket.emit(ROOM_ERROR, { message: 'اللعبة بدأت بالفعل' })
        return
      }
      if (room.players.length >= 10) {
        socket.emit(ROOM_ERROR, { message: 'الغرفة ممتلئة (الحد الأقصى ١٠ لاعبين)' })
        return
      }

      const player: Player = { id: socket.id, name: playerName }
      room.players.push(player)
      socket.join(upperCode)

      emitRoomState(io, room)
      io.to(upperCode).emit(PLAYER_JOINED, { player })
    })

    socket.on(ROOM_LEAVE, () => {
      handleLeave(socket.id, rooms, io)
    })

    // ─── Family Feud — room management ───────────────────────────────────────

    function assertFFHost(roomCode: string): FFGameState | null {
      const gs = ffRooms.get(roomCode)
      if (!gs || gs.hostSocketId !== socket.id) return null
      return gs
    }

    socket.on(FF_CREATE_WITH_CONFIG, ({ hostName: _hostName, settings }: { hostName: string; settings: GameSettings }) => {
      const s: GameSettings = {
        team1MaxPlayers: Math.min(Math.max(settings.team1MaxPlayers, 1), 999),
        team2MaxPlayers: Math.min(Math.max(settings.team2MaxPlayers, 1), 999),
        team1Name: (settings.team1Name || 'الفريق الأول').trim(),
        team2Name: (settings.team2Name || 'الفريق الثاني').trim(),
        totalRounds: Math.min(Math.max(settings.totalRounds, 1), FAMILY_FEUD_QUESTIONS.length),
      }
      const code = generateCode(ffRooms)
      const gs: FFGameState = {
        roomCode: code,
        hostSocketId: socket.id,
        players: [],
        teams: makeTeams(s),
        settings: s,
        questions: cloneQuestions(s.totalRounds),
        questionIndex: 0,
        status: 'waiting',
        buzzer: { ...EMPTY_BUZZER },
      }
      ffRooms.set(code, gs)
      socket.join(code)
      emitState(io, gs)
    })

    socket.on(FF_HOST_RECONNECT, ({ roomCode }: { roomCode: string }) => {
      const gs = ffRooms.get(roomCode)
      if (!gs) { socket.emit(FF_ERROR, { message: 'الغرفة غير موجودة' }); return }
      gs.hostSocketId = socket.id
      socket.join(roomCode)
      socket.emit(FF_STATE, buildStatePayload(gs))
    })

    socket.on(FF_JOIN, ({ roomCode, playerName, teamId }: { roomCode: string; playerName: string; teamId: 1 | 2 }) => {
      const gs = ffRooms.get(roomCode)
      if (!gs) { socket.emit(FF_ERROR, { message: 'رمز الغرفة غير صحيح' }); return }
      if (gs.status !== 'waiting') { socket.emit(FF_ERROR, { message: 'اللعبة بدأت بالفعل' }); return }
      if (isTeamFull(gs, teamId)) {
        socket.emit(FF_JOIN_TEAM_FULL, { message: 'هذا الفريق ممتلئ!', teamId }); return
      }
      const existing = gs.players.find((p) => p.name === playerName && p.teamId === teamId)
      if (existing) {
        existing.socketId = socket.id; existing.id = socket.id; existing.isConnected = true
      } else {
        const player: FFPlayer = {
          id: socket.id, socketId: socket.id, name: playerName, teamId, isConnected: true,
        }
        gs.players.push(player)
        io.to(roomCode).emit(FF_PLAYER_JOINED, { player })
      }
      socket.join(roomCode)
      emitState(io, gs)
    })

    socket.on(FF_RECONNECT, ({ roomCode, playerName, teamId }: { roomCode: string; playerName: string; teamId: 1 | 2 }) => {
      const gs = ffRooms.get(roomCode)
      if (!gs) { socket.emit(FF_ERROR, { message: 'الغرفة غير موجودة' }); return }
      const existing = gs.players.find((p) => p.name === playerName && p.teamId === teamId)
      if (existing) {
        existing.socketId = socket.id
        existing.id = socket.id
        existing.isConnected = true
        socket.join(roomCode)
        socket.emit(FF_STATE, buildStatePayload(gs))
        return
      }
      if (gs.status !== 'waiting') { socket.emit(FF_ERROR, { message: 'اللعبة بدأت بالفعل' }); return }
      if (isTeamFull(gs, teamId)) { socket.emit(FF_ERROR, { message: 'الفريق ممتلئ' }); return }
      const player: FFPlayer = {
        id: socket.id, socketId: socket.id, name: playerName, teamId, isConnected: true,
      }
      gs.players.push(player)
      io.to(roomCode).emit(FF_PLAYER_JOINED, { player })
      socket.join(roomCode)
      emitState(io, gs)
    })

    socket.on('FF_BOARD_JOIN', ({ roomCode }: { roomCode: string }) => {
      const gs = ffRooms.get(roomCode)
      if (!gs) return
      socket.join(roomCode)
      socket.emit(FF_STATE, buildStatePayload(gs))
    })

    socket.on(FF_UPDATE_SETTINGS, ({ roomCode, settings }: { roomCode: string; settings: GameSettings }) => {
      const gs = ffRooms.get(roomCode)
      if (!gs || gs.hostSocketId !== socket.id || gs.status !== 'waiting') return
      const s: GameSettings = {
        team1MaxPlayers: Math.min(Math.max(settings.team1MaxPlayers, 1), 999),
        team2MaxPlayers: Math.min(Math.max(settings.team2MaxPlayers, 1), 999),
        team1Name: (settings.team1Name || 'الفريق الأول').trim(),
        team2Name: (settings.team2Name || 'الفريق الثاني').trim(),
        totalRounds: Math.min(Math.max(settings.totalRounds, 1), FAMILY_FEUD_QUESTIONS.length),
      }
      gs.settings = s
      gs.teams[1].name = s.team1Name; gs.teams[1].maxPlayers = s.team1MaxPlayers
      gs.teams[2].name = s.team2Name; gs.teams[2].maxPlayers = s.team2MaxPlayers
      if (gs.questions.length !== s.totalRounds) {
        gs.questions = cloneQuestions(s.totalRounds)
        gs.questionIndex = 0
      }
      io.to(roomCode).emit(FF_SETTINGS_UPDATED, { settings: s })
      emitState(io, gs)
    })

    // ─── Family Feud — game start ─────────────────────────────────────────────

    socket.on(FF_START, ({ roomCode }: { roomCode: string }) => {
      const gs = ffRooms.get(roomCode)
      if (!gs || gs.hostSocketId !== socket.id) return
      if (gs.players.length < 2) {
        socket.emit(FF_ERROR, { message: 'تحتاج على الأقل لاعبَين' }); return
      }
      gs.status = 'playing'
      emitState(io, gs)
    })

    // ─── Family Feud — buzzer + answer ────────────────────────────────────────

    socket.on(FF_BUZZ, ({ roomCode }: { roomCode: string }) => {
      const gs = ffRooms.get(roomCode)
      if (!gs || gs.status !== 'playing') return
      const player = gs.players.find((p) => p.socketId === socket.id)
      if (!player) return
      if (gs.teams[player.teamId].isLockedOut) return
      if (gs.buzzer.buzzedPlayerId !== null) return
      gs.buzzer = {
        buzzedPlayerId: socket.id,
        buzzedPlayerName: player.name,
        buzzedTeamId: player.teamId,
      }
      emitState(io, gs)
    })

    socket.on(FF_SUBMIT_ANSWER, ({ roomCode, answer }: { roomCode: string; answer: string }) => {
      const gs = ffRooms.get(roomCode)
      if (!gs || gs.status !== 'playing') return
      if (gs.buzzer.buzzedPlayerId !== socket.id) {
        socket.emit(FF_ERROR, { message: 'يجب أن تضغط الزر أولاً' })
        return
      }
      const player = gs.players.find((p) => p.socketId === socket.id)
      if (!player) return
      const team = gs.teams[player.teamId]
      gs.buzzer = { ...EMPTY_BUZZER }
      const currentQ = gs.questions[gs.questionIndex]
      const cache = buildExactCache(currentQ.answers)
      const matchIdx = validateAnswer(answer, currentQ.answers, cache)
      if (matchIdx !== null && !currentQ.answers[matchIdx].revealed) {
        currentQ.answers[matchIdx].revealed = true
        const points = currentQ.answers[matchIdx].points
        team.score += points
        io.to(roomCode).emit(FF_ANSWER_RESULT, {
          playerId: socket.id, playerName: player.name, teamId: player.teamId,
          correct: true, answerIndex: matchIdx, points,
        })
        if (currentQ.answers.every((a) => a.revealed)) gs.status = 'question_end'
        emitState(io, gs)
      } else {
        team.mistakes = Math.min(team.mistakes + 1, 3)
        if (team.mistakes >= 3) team.isLockedOut = true
        io.to(roomCode).emit(FF_ANSWER_RESULT, {
          playerId: socket.id, playerName: player.name, teamId: player.teamId, correct: false,
        })
        if (gs.teams[1].isLockedOut && gs.teams[2].isLockedOut) gs.status = 'question_end'
        emitState(io, gs)
      }
    })

    // ─── Family Feud — host controls ──────────────────────────────────────────

    socket.on(FF_HOST_NEXT, ({ roomCode }: { roomCode: string }) => {
      const gs = assertFFHost(roomCode)
      if (!gs) return
      advanceQuestion(io, gs)
    })

    socket.on(FF_HOST_RESTART, ({ roomCode }: { roomCode: string }) => {
      const gs = assertFFHost(roomCode)
      if (!gs) return
      resetQuestion(gs)
      emitState(io, gs)
    })

    socket.on(FF_HOST_RESET_ATTEMPTS, ({ roomCode }: { roomCode: string }) => {
      const gs = assertFFHost(roomCode)
      if (!gs) return
      gs.buzzer = { ...EMPTY_BUZZER }
      emitState(io, gs)
    })

    socket.on(FF_HOST_REVEAL, ({ roomCode, answerIndex }: { roomCode: string; answerIndex: number }) => {
      const gs = assertFFHost(roomCode)
      if (!gs) return
      if (gs.status !== 'playing' && gs.status !== 'question_end') return
      const q = gs.questions[gs.questionIndex]
      if (answerIndex < 0 || answerIndex >= q.answers.length || q.answers[answerIndex].revealed) return
      q.answers[answerIndex].revealed = true
      gs.buzzer = { ...EMPTY_BUZZER }
      io.to(roomCode).emit(FF_ANSWER_RESULT, {
        playerId: 'host', playerName: 'المضيف', teamId: null,
        correct: true, answerIndex, points: q.answers[answerIndex].points,
      })
      if (q.answers.every((a) => a.revealed)) gs.status = 'question_end'
      emitState(io, gs)
    })

    socket.on(FF_HOST_MISTAKE, ({ roomCode, teamId }: { roomCode: string; teamId: 1 | 2 }) => {
      const gs = assertFFHost(roomCode)
      if (!gs || gs.status !== 'playing') return
      const team = gs.teams[teamId]
      team.mistakes = Math.min(team.mistakes + 1, 3)
      if (team.mistakes >= 3) team.isLockedOut = true
      if (gs.teams[1].isLockedOut && gs.teams[2].isLockedOut) gs.status = 'question_end'
      emitState(io, gs)
    })

    socket.on(FF_HOST_UPDATE_SCORES, ({
      roomCode, team1Score, team2Score,
    }: { roomCode: string; team1Score: number; team2Score: number }) => {
      const gs = assertFFHost(roomCode)
      if (!gs) return
      gs.teams[1].score = Math.max(0, Math.floor(team1Score))
      gs.teams[2].score = Math.max(0, Math.floor(team2Score))
      emitState(io, gs)
    })

    socket.on(FF_HOST_JUMP, ({ roomCode, questionIndex }: { roomCode: string; questionIndex: number }) => {
      const gs = assertFFHost(roomCode)
      if (!gs) return
      if (questionIndex < 0 || questionIndex >= gs.settings.totalRounds) return
      gs.questionIndex = questionIndex
      resetQuestion(gs)
      emitState(io, gs)
    })

    socket.on(FF_HOST_END, ({ roomCode }: { roomCode: string }) => {
      const gs = assertFFHost(roomCode)
      if (!gs) return
      gs.status = 'game_over'
      gs.winner = gs.teams[1].score >= gs.teams[2].score ? 1 : 2
      gs.buzzer = { ...EMPTY_BUZZER }
      emitState(io, gs)
    })

    socket.on(FF_HOST_RESTART_SAME_TEAMS, ({ roomCode }: { roomCode: string }) => {
      const gs = assertFFHost(roomCode)
      if (!gs) return
      gs.teams[1].score = 0; gs.teams[1].mistakes = 0; gs.teams[1].isLockedOut = false
      gs.teams[2].score = 0; gs.teams[2].mistakes = 0; gs.teams[2].isLockedOut = false
      gs.questions = cloneQuestions(gs.settings.totalRounds)
      gs.questionIndex = 0
      gs.buzzer = { ...EMPTY_BUZZER }
      gs.status = 'playing'
      delete gs.winner
      emitState(io, gs)
    })

    socket.on(FF_LEAVE, () => handleFFLeave(socket.id, ffRooms, io))

    // ─── Impostor — room management ───────────────────────────────────────────

    function assertImpHost(roomCode: string): ImpGameState | null {
      const gs = impRooms.get(roomCode)
      if (!gs || gs.hostSocketId !== socket.id) return null
      return gs
    }

    socket.on(IMP_CREATE, ({ settings }: { settings: ImpSettings }) => {
      const maxPlayers = Math.min(Math.max(Math.floor(settings.maxPlayers) || 8, 3), 10)
      const maxAllowedImpostors = Math.max(1, maxPlayers - 2)
      const numImpostors = Math.min(Math.max(Math.floor(settings.numImpostors) || 1, 1), maxAllowedImpostors)
      const timePerRound = settings.timePerRound > 0
        ? Math.min(Math.max(Math.floor(settings.timePerRound), 30), 600)
        : 0
      const s: ImpSettings = {
        maxPlayers,
        numImpostors,
        timePerRound,
        totalRounds: Math.min(Math.max(settings.totalRounds, 1), 20),
        categoryId: settings.categoryId || 'objects',
      }
      const code = generateCode(impRooms)
      const gs: ImpGameState = {
        roomCode: code, hostSocketId: socket.id, phase: 'lobby',
        settings: s, players: [], currentRound: 0,
        currentWord: '', currentCategoryName: '',
        impostorNames: [], usedWords: new Set(),
        votes: {}, scores: { innocents: 0, impostors: 0 },
        voteResult: null, winner: null, timerStartedAt: null,
      }
      impRooms.set(code, gs)
      socket.join(code)
      socket.emit(IMP_STATE, buildImpPayload(gs))
    })

    socket.on(IMP_HOST_RECONNECT, ({ roomCode }: { roomCode: string }) => {
      const gs = impRooms.get(roomCode)
      if (!gs) { socket.emit(IMP_ERROR, { message: 'الغرفة غير موجودة' }); return }
      gs.hostSocketId = socket.id
      socket.join(roomCode)
      socket.emit(IMP_STATE, buildImpPayload(gs))
    })

    socket.on(IMP_JOIN, ({ roomCode, playerName }: { roomCode: string; playerName: string }) => {
      const gs = impRooms.get(roomCode)
      if (!gs) { socket.emit(IMP_ERROR, { message: 'رمز الغرفة غير صحيح' }); return }
      if (gs.phase !== 'lobby') { socket.emit(IMP_ERROR, { message: 'اللعبة بدأت بالفعل' }); return }
      if (gs.players.length >= gs.settings.maxPlayers) { socket.emit(IMP_ERROR, { message: 'الغرفة ممتلئة' }); return }
      const existing = gs.players.find((p) => p.name === playerName)
      if (existing) {
        existing.socketId = socket.id; existing.id = socket.id
      } else {
        gs.players.push({ id: socket.id, socketId: socket.id, name: playerName, isEliminated: false, hasVoted: false })
      }
      socket.join(roomCode)
      emitImpState(io, gs)
    })

    socket.on(IMP_RECONNECT, ({ roomCode, playerName }: { roomCode: string; playerName: string }) => {
      const gs = impRooms.get(roomCode)
      if (!gs) { socket.emit(IMP_ERROR, { message: 'الغرفة غير موجودة' }); return }
      const player = gs.players.find((p) => p.name === playerName)
      if (player) {
        player.socketId = socket.id; player.id = socket.id
        socket.join(roomCode)
        socket.emit(IMP_STATE, buildImpPayload(gs))
        if (gs.phase !== 'lobby' && gs.currentWord) {
          const isImpostor = gs.impostorNames.includes(playerName)
          socket.emit(IMP_WORD, {
            word: isImpostor ? null : gs.currentWord,
            isImpostor, categoryName: gs.currentCategoryName, roundNumber: gs.currentRound,
          })
        }
      } else {
        if (gs.phase !== 'lobby') { socket.emit(IMP_ERROR, { message: 'اللعبة بدأت بالفعل' }); return }
        if (gs.players.length >= gs.settings.maxPlayers) { socket.emit(IMP_ERROR, { message: 'الغرفة ممتلئة' }); return }
        gs.players.push({ id: socket.id, socketId: socket.id, name: playerName, isEliminated: false, hasVoted: false })
        socket.join(roomCode)
        emitImpState(io, gs)
      }
    })

    // ─── Impostor — game flow ─────────────────────────────────────────────────

    socket.on(IMP_START, ({ roomCode }: { roomCode: string }) => {
      const gs = assertImpHost(roomCode); if (!gs) return
      if (gs.phase !== 'lobby') return
      if (gs.players.length < 3) {
        socket.emit(IMP_ERROR, { message: 'تحتاج على الأقل ٣ لاعبين' }); return
      }
      startImpRound(io, gs)
    })

    socket.on(IMP_HOST_START_VOTING, ({ roomCode }: { roomCode: string }) => {
      const gs = assertImpHost(roomCode); if (!gs) return
      if (gs.phase !== 'discussion') return
      startImpVoting(io, gs)
    })

    socket.on(IMP_VOTE, ({ roomCode, targetName }: { roomCode: string; targetName: string }) => {
      const gs = impRooms.get(roomCode)
      if (!gs || gs.phase !== 'voting') return
      const voter = gs.players.find((p) => p.socketId === socket.id)
      if (!voter || voter.isEliminated || voter.hasVoted) return
      if (voter.name === targetName) return
      const target = gs.players.find((p) => p.name === targetName && !p.isEliminated)
      if (!target) return
      gs.votes[voter.name] = targetName
      voter.hasVoted = true
      emitImpState(io, gs)
      const active = gs.players.filter((p) => !p.isEliminated)
      if (active.every((p) => p.hasVoted)) resolveImpVotes(io, gs)
    })

    // ─── Impostor — host controls ─────────────────────────────────────────────

    socket.on(IMP_HOST_NEXT, ({ roomCode }: { roomCode: string }) => {
      const gs = assertImpHost(roomCode); if (!gs) return
      if (gs.phase !== 'reveal') return
      clearImpTimer(roomCode)
      if (gs.currentRound >= gs.settings.totalRounds) {
        gs.phase = 'game_over'
        gs.winner = gs.scores.innocents >= gs.scores.impostors ? 'innocents' : 'impostors'
        emitImpState(io, gs)
      } else {
        startImpRound(io, gs)
      }
    })

    socket.on(IMP_HOST_END, ({ roomCode }: { roomCode: string }) => {
      const gs = assertImpHost(roomCode); if (!gs) return
      clearImpTimer(roomCode)
      gs.phase = 'game_over'
      gs.winner = gs.scores.innocents >= gs.scores.impostors ? 'innocents' : 'impostors'
      emitImpState(io, gs)
    })

    socket.on(IMP_HOST_RESTART, ({ roomCode }: { roomCode: string }) => {
      const gs = assertImpHost(roomCode); if (!gs) return
      clearImpTimer(roomCode)
      gs.currentRound = 0
      gs.currentWord = ''; gs.currentCategoryName = ''
      gs.impostorNames = []; gs.usedWords = new Set()
      gs.votes = {}; gs.scores = { innocents: 0, impostors: 0 }
      gs.voteResult = null; gs.winner = null; gs.timerStartedAt = null
      for (const p of gs.players) { p.isEliminated = false; p.hasVoted = false }
      startImpRound(io, gs)
    })

    socket.on('disconnect', () => {
      handleLeave(socket.id, rooms, io)
      handleFFLeave(socket.id, ffRooms, io)
      handleImpLeave(socket.id, impRooms, io)
    })
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port} [${dev ? 'dev' : 'prod'}]`)
  })
})

function handleLeave(socketId: string, rooms: Map<string, Room>, io: SocketIOServer) {
  for (const [code, room] of rooms.entries()) {
    const idx = room.players.findIndex((p) => p.id === socketId)
    if (idx === -1) continue

    const player = room.players[idx]
    room.players.splice(idx, 1)
    io.to(code).emit(PLAYER_LEFT, { playerId: socketId, playerName: player.name })

    if (room.hostSocketId === socketId) {
      rooms.delete(code)
      io.to(code).emit(ROOM_ERROR, { message: 'أنهى المضيف الغرفة' })
    } else {
      emitRoomState(io, room)
    }
  }
}

function handleFFLeave(socketId: string, ffRooms: Map<string, FFGameState>, io: SocketIOServer) {
  for (const gs of ffRooms.values()) {
    if (gs.hostSocketId === socketId) {
      gs.hostSocketId = ''
      continue
    }

    const idx = gs.players.findIndex((p) => p.socketId === socketId)
    if (idx === -1) continue
    const player = gs.players[idx]

    if (gs.status === 'waiting') {
      gs.players.splice(idx, 1)
      io.to(gs.roomCode).emit(FF_PLAYER_LEFT, { playerId: socketId, playerName: player.name })
    } else {
      player.isConnected = false
      if (gs.buzzer.buzzedPlayerId === socketId) {
        gs.buzzer = { buzzedPlayerId: null, buzzedPlayerName: null, buzzedTeamId: null }
      }
    }
    emitState(io, gs)
  }
}

function handleImpLeave(socketId: string, impRooms: Map<string, ImpGameState>, io: SocketIOServer) {
  for (const gs of impRooms.values()) {
    if (gs.hostSocketId === socketId) { gs.hostSocketId = ''; continue }
    const player = gs.players.find((p) => p.socketId === socketId)
    if (!player || player.isEliminated) continue
    if (gs.phase === 'voting' && !player.hasVoted) {
      player.hasVoted = true
      emitImpState(io, gs)
      const active = gs.players.filter((p) => !p.isEliminated)
      if (active.every((p) => p.hasVoted)) resolveImpVotes(io, gs)
    }
  }
}
