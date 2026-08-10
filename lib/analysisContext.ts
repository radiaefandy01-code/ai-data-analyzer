import type { DataProfile } from "./dataProfiler";
import type { NumericStatistics } from "./statistics";
import type { DataInsight } from "./insightEngine";
import type { DataQualityResult } from "./dataQuality";

export interface AnalysisContext {
  profile: DataProfile;
  statistics: Record<string, NumericStatistics>;
  insights: DataInsight[];
  dataQuality: DataQualityResult;
}

export function createAnalysisContext(
  profile: DataProfile,
  statistics: Record<string, NumericStatistics>,
  insights: DataInsight[],
  dataQuality: DataQualityResult
): AnalysisContext {
  return {
    profile,
    statistics,
    insights,
    dataQuality,
  };
}