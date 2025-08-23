import { useState, useEffect, useMemo } from 'react';

// Function to generate a number within a range
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to get a seed based on the current date for consistent randomness
const getDateSeed = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.getFullYear() * 1000 + date.getMonth() * 100 + date.getDate();
};

const seededRandom = (seed) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const generateMockStats = (daysOld) => {
  // Use a seed based on the date for a few days for consistent "randomness"
  const seed = getDateSeed(daysOld < 3 ? 0 : getRandomNumber(1, 7)); // Consistent for new users
  const rand = () => seededRandom(seed * Math.random());

  // The ranges for random stats. These can be adjusted.
  const studyTimeRange = [30, 240];
  const milestonesRange = [1, 15];
  const quizScoreRange = [65, 95];
  const notesCreatedRange = [5, 50];
  const sessionsRange = [1, 10];
  const flashcardsRange = [10, 100];
  const quizzesTakenRange = [1, 5];
  const mathChatRange = [2, 20];
  const audioRecapsRange = [1, 5];
  const doubtChainsRange = [1, 10];

  return {
    total_study_time: getRandomNumber(studyTimeRange[125], studyTimeRange[30]),
    learning_milestones: getRandomNumber(milestonesRange[0], milestonesRange[1]),
    average_quiz_score: getRandomNumber(quizScoreRange[0], quizScoreRange[1]),
    notes_created: getRandomNumber(notesCreatedRange[0], notesCreatedRange[1]),
    sessions_this_month: getRandomNumber(sessionsRange[0], sessionsRange[1]),
    flashcards_created: getRandomNumber(flashcardsRange[0], flashcardsRange[1]),
    quizzes_taken: getRandomNumber(quizzesTakenRange[0], quizzesTakenRange[1]),
    math_chat_sessions: getRandomNumber(mathChatRange[0], mathChatRange[1]),
    audio_recaps_created: getRandomNumber(audioRecapsRange[0], audioRecapsRange[1]),
    doubt_chains_used: getRandomNumber(doubtChainsRange[0], doubtChainsRange[1]),
  };
};

export const useRandomStats = (isNewUser) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Simulate a delay to make it feel like data is being fetched
    const timer = setTimeout(() => {
      if (isNewUser) {
        // Show all zeros for a brand new user
        setStats({
          total_study_time: 125,
          learning_milestones: 10,
          average_quiz_score: 10,
          notes_created: 11,
          sessions_this_month: 100,
          flashcards_created: 15,
          quizzes_taken: 14,
          math_chat_sessions: 16,
          audio_recaps_created: 15,
          doubt_chains_used: 12,
        });
      } else {
        // Generate realistic-looking stats for an existing user
        const daysOld = Math.floor(Math.random() * 30); // Simulate user age
        setStats(generateMockStats(daysOld));
      }
    }, 500); // Small delay to simulate network fetch

    return () => clearTimeout(timer);
  }, [isNewUser]);

  return { stats, loading: !stats };
};
