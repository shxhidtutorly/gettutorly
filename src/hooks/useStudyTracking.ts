
import { useState, useEffect } from 'react';
import { firebaseSecure } from '@/lib/firebase-secure';
import { historyService } from '@/lib/historyService';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';

export const useStudyTracking = () => {
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const { toast } = useToast();

  const startSession = () => {
    const sessionId = Date.now().toString();
    const now = Date.now();
    
    setCurrentSession(sessionId);
    setStartTime(now);
    
    console.log('Study session started:', sessionId);
  };

  const endSession = async (type: string, activity: string, success: boolean = true) => {
    if (!currentSession || !startTime) return;

    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000 / 60); // minutes

    try {
      // Log session activity
      await firebaseSecure.secureWrite(
        `userActivity/${firebaseSecure.getCurrentUser()?.uid}/sessions/${currentSession}`,
        {
          type,
          activity,
          startTime: Timestamp.fromMillis(startTime),
          endTime: Timestamp.fromMillis(endTime),
          duration,
          success
        }
      );

      // Add to history
      await historyService.addHistoryEntry({
        type: type as any,
        title: `${type} Session`,
        query: activity,
        result: success ? 'Completed successfully' : 'Session ended'
      });

      setCurrentSession(null);
      setStartTime(null);

      if (success) {
        toast({
          title: "Session Complete! ✅",
          description: `${duration} minutes of focused study time logged.`
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const trackMathProblemSolved = async () => {
    try {
      await firebaseSecure.secureWrite(
        `userStats/${firebaseSecure.getCurrentUser()?.uid}`,
        {
          mathProblemsSolved: 1,
          lastMathActivity: Timestamp.now()
        }
      );
    } catch (error) {
      console.error('Error tracking math problem:', error);
    }
  };

  const trackNoteCreated = async () => {
    try {
      await firebaseSecure.secureWrite(
        `userStats/${firebaseSecure.getCurrentUser()?.uid}`,
        {
          notesCreated: 1,
          lastNoteActivity: Timestamp.now()
        }
      );
    } catch (error) {
      console.error('Error tracking note creation:', error);
    }
  };

  return {
    startSession,
    endSession,
    trackMathProblemSolved,
    trackNoteCreated,
    isSessionActive: !!currentSession
  };
};
