
import { useStudyTracking } from '@/hooks/useStudyTracking';

const SummaryUsageTracker = () => {
  const { trackActivity } = useStudyTracking();

  // Function to track summary generation
  const trackSummaryGeneration = () => {
    trackActivity('summary_generated', {
      timestamp: new Date().toISOString(),
      feature: 'text_summarizer'
    });
  };

  // Export this function so other components can use it
  (window as any).trackSummaryGeneration = trackSummaryGeneration;

  return null; // This is a utility component
};

export default SummaryUsageTracker;
