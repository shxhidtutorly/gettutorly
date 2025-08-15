
import { useStudyTracking } from '@/hooks/useStudyTracking';

const SummaryUsageTracker = () => {
  const { trackSummaryCreated } = useStudyTracking();

  // Function to track summary generation
  const triggerSummaryTracking = () => {
    trackSummaryCreated();
  };

  // Export this function so other components can use it
  (window as any).trackSummaryGeneration = triggerSummaryTracking;

  return null; // This is a utility component
};

export default SummaryUsageTracker;
