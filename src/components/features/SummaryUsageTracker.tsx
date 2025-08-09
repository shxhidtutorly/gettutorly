
import { useStudyTracking } from '@/hooks/useStudyTracking';

const SummaryUsageTracker = () => {
  const { trackSummaryGeneration } = useStudyTracking();

  // Function to track summary generation
  const triggerSummaryTracking = () => {
    trackSummaryGeneration();
  };

  // Export this function so other components can use it
  (window as any).trackSummaryGeneration = trackSummaryGeneration;

  return null; // This is a utility component
};

export default SummaryUsageTracker;
