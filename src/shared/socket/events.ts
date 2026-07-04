export const ROOM_CREATE = 'ROOM_CREATE' as const
export const ROOM_JOIN = 'ROOM_JOIN' as const
export const ROOM_LEAVE = 'ROOM_LEAVE' as const
export const ROOM_STATE = 'ROOM_STATE' as const
export const PLAYER_JOINED = 'PLAYER_JOINED' as const
export const PLAYER_LEFT = 'PLAYER_LEFT' as const
export const ROOM_ERROR = 'ROOM_ERROR' as const

// Family Feud — room lifecycle
export const FF_CREATE_WITH_CONFIG = 'FF_CREATE_WITH_CONFIG' as const
export const FF_HOST_RECONNECT = 'FF_HOST_RECONNECT' as const
export const FF_JOIN = 'FF_JOIN' as const
export const FF_RECONNECT = 'FF_RECONNECT' as const
export const FF_LEAVE = 'FF_LEAVE' as const
export const FF_STATE = 'FF_STATE' as const
export const FF_ERROR = 'FF_ERROR' as const
export const FF_PLAYER_JOINED = 'FF_PLAYER_JOINED' as const
export const FF_PLAYER_LEFT = 'FF_PLAYER_LEFT' as const
export const FF_JOIN_TEAM_FULL = 'FF_JOIN_TEAM_FULL' as const
export const FF_UPDATE_SETTINGS = 'FF_UPDATE_SETTINGS' as const
export const FF_SETTINGS_UPDATED = 'FF_SETTINGS_UPDATED' as const

// Family Feud — game flow
export const FF_START = 'FF_START' as const
export const FF_BUZZ = 'FF_BUZZ' as const
export const FF_SUBMIT_ANSWER = 'FF_SUBMIT_ANSWER' as const
export const FF_ANSWER_RESULT = 'FF_ANSWER_RESULT' as const

// Family Feud — host controls
export const FF_HOST_NEXT = 'FF_HOST_NEXT' as const
export const FF_HOST_RESTART = 'FF_HOST_RESTART' as const
export const FF_HOST_REVEAL = 'FF_HOST_REVEAL' as const
export const FF_HOST_MISTAKE = 'FF_HOST_MISTAKE' as const
export const FF_HOST_UPDATE_SCORES = 'FF_HOST_UPDATE_SCORES' as const
export const FF_HOST_JUMP = 'FF_HOST_JUMP' as const
export const FF_HOST_END = 'FF_HOST_END' as const
export const FF_HOST_RESET_ATTEMPTS = 'FF_HOST_RESET_ATTEMPTS' as const
export const FF_HOST_RESTART_SAME_TEAMS = 'FF_HOST_RESTART_SAME_TEAMS' as const

// Impostor — room lifecycle
export const IMP_CREATE = 'IMP_CREATE' as const
export const IMP_JOIN = 'IMP_JOIN' as const
export const IMP_HOST_RECONNECT = 'IMP_HOST_RECONNECT' as const
export const IMP_RECONNECT = 'IMP_RECONNECT' as const
export const IMP_STATE = 'IMP_STATE' as const
export const IMP_ERROR = 'IMP_ERROR' as const
export const IMP_WORD = 'IMP_WORD' as const

// Impostor — game flow
export const IMP_START = 'IMP_START' as const
export const IMP_VOTE = 'IMP_VOTE' as const

// Impostor — host controls
export const IMP_HOST_START_VOTING = 'IMP_HOST_START_VOTING' as const
export const IMP_HOST_NEXT = 'IMP_HOST_NEXT' as const
export const IMP_HOST_END = 'IMP_HOST_END' as const
export const IMP_HOST_RESTART = 'IMP_HOST_RESTART' as const

// Fastest (من الأسرع؟) — room lifecycle
export const FASTEST_CREATE = 'FASTEST_CREATE' as const
export const FASTEST_JOIN = 'FASTEST_JOIN' as const
export const FASTEST_HOST_RECONNECT = 'FASTEST_HOST_RECONNECT' as const
export const FASTEST_RECONNECT = 'FASTEST_RECONNECT' as const
export const FASTEST_STATE = 'FASTEST_STATE' as const
export const FASTEST_ERROR = 'FASTEST_ERROR' as const

// Fastest — game flow
export const FASTEST_START = 'FASTEST_START' as const
export const FASTEST_BUZZ = 'FASTEST_BUZZ' as const

// Fastest — host controls
export const FASTEST_HOST_AWARD = 'FASTEST_HOST_AWARD' as const
export const FASTEST_HOST_NEXT = 'FASTEST_HOST_NEXT' as const
export const FASTEST_HOST_END = 'FASTEST_HOST_END' as const
export const FASTEST_HOST_RESTART = 'FASTEST_HOST_RESTART' as const

// Speed Challenge (لعبة التحدي السريع) — room lifecycle
export const SPEED_CREATE = 'SPEED_CREATE' as const
export const SPEED_JOIN = 'SPEED_JOIN' as const
export const SPEED_HOST_RECONNECT = 'SPEED_HOST_RECONNECT' as const
export const SPEED_RECONNECT = 'SPEED_RECONNECT' as const
export const SPEED_STATE = 'SPEED_STATE' as const
export const SPEED_ERROR = 'SPEED_ERROR' as const

// Speed Challenge — game flow
export const SPEED_START = 'SPEED_START' as const

// Speed Challenge — host controls
export const SPEED_HOST_AWARD = 'SPEED_HOST_AWARD' as const
export const SPEED_HOST_NEXT = 'SPEED_HOST_NEXT' as const
export const SPEED_HOST_END = 'SPEED_HOST_END' as const
export const SPEED_HOST_RESTART = 'SPEED_HOST_RESTART' as const

// Photo Game (لعبة الصور) — room lifecycle
export const PHOTO_CREATE = 'PHOTO_CREATE' as const
export const PHOTO_HOST_RECONNECT = 'PHOTO_HOST_RECONNECT' as const
export const PHOTO_RECONNECT = 'PHOTO_RECONNECT' as const
export const PHOTO_STATE = 'PHOTO_STATE' as const
export const PHOTO_ERROR = 'PHOTO_ERROR' as const
export const PHOTO_YOUR_PHOTO = 'PHOTO_YOUR_PHOTO' as const
export const PHOTO_REVEAL_PHOTO = 'PHOTO_REVEAL_PHOTO' as const

// Photo Game — game flow
export const PHOTO_START = 'PHOTO_START' as const

// Photo Game — host controls
export const PHOTO_HOST_REVEAL = 'PHOTO_HOST_REVEAL' as const
export const PHOTO_HOST_AWARD = 'PHOTO_HOST_AWARD' as const
export const PHOTO_HOST_NEXT = 'PHOTO_HOST_NEXT' as const
export const PHOTO_HOST_END = 'PHOTO_HOST_END' as const
export const PHOTO_HOST_RESTART = 'PHOTO_HOST_RESTART' as const

// Taboo Game (ولا كلمة) — room lifecycle
export const TABOO_CREATE = 'TABOO_CREATE' as const
export const TABOO_HOST_RECONNECT = 'TABOO_HOST_RECONNECT' as const
export const TABOO_JOIN = 'TABOO_JOIN' as const
export const TABOO_STATE = 'TABOO_STATE' as const
export const TABOO_ERROR = 'TABOO_ERROR' as const
export const TABOO_CARD = 'TABOO_CARD' as const

// Taboo Game — game flow
export const TABOO_START = 'TABOO_START' as const

// Taboo Game — host controls
export const TABOO_HOST_AWARD = 'TABOO_HOST_AWARD' as const
export const TABOO_HOST_SKIP = 'TABOO_HOST_SKIP' as const
export const TABOO_HOST_END_TURN = 'TABOO_HOST_END_TURN' as const
export const TABOO_HOST_NEXT = 'TABOO_HOST_NEXT' as const
export const TABOO_HOST_END = 'TABOO_HOST_END' as const
export const TABOO_HOST_RESTART = 'TABOO_HOST_RESTART' as const
