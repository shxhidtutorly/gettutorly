
import { useStudyTracking } from '@/hooks/useStudyTracking';

const SummaryUsageTracker = () => {
  const { trackActivity, trackSummaryGeneration } = useStudyTracking();

  // Function to track summary generation - use the hook method
  const handleTrackSummaryGeneration = () => {
    trackSummaryGeneration();
    trackActivity('summary_generated', {
      timestamp: new Date().toISOString(),
      feature: 'text_summarizer'
    });
  };

  // Export this function so other components can use it
  (window as any).trackSummaryGeneration = handleTrackSummaryGeneration;

  return null; // This is a utility component
};

export default SummaryUsageTracker;
