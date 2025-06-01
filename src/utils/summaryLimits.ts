
interface SummarySession {
  count: number;
  startTime: number;
  lastUsed: number;
}

const SESSION_KEY = 'tutorly_summary_session';
const MAX_FREE_SUMMARIES = 3;
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getSummarySession = (): SummarySession => {
  const stored = localStorage.getItem(SESSION_KEY);
  
  if (!stored) {
    const newSession: SummarySession = {
      count: 0,
      startTime: Date.now(),
      lastUsed: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  }

  const session: SummarySession = JSON.parse(stored);
  
  // Check if session has expired (24 hours)
  if (Date.now() - session.startTime > SESSION_DURATION) {
    const newSession: SummarySession = {
      count: 0,
      startTime: Date.now(),
      lastUsed: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  }

  return session;
};

export const canUseSummary = (): boolean => {
  const session = getSummarySession();
  return session.count < MAX_FREE_SUMMARIES;
};

export const useSummary = (): boolean => {
  if (!canUseSummary()) {
    return false;
  }

  const session = getSummarySession();
  session.count += 1;
  session.lastUsed = Date.now();
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return true;
};

export const getRemainingUsage = (): number => {
  const session = getSummarySession();
  return Math.max(0, MAX_FREE_SUMMARIES - session.count);
};

export const getSessionTimeRemaining = (): number => {
  const session = getSummarySession();
  const elapsed = Date.now() - session.startTime;
  return Math.max(0, SESSION_DURATION - elapsed);
};

export const formatTimeRemaining = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
