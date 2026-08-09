import type { DataProfile } from "./dataProfiler";
import type { NumericStatistics } from "./statistics";
import type { DataInsight } from "./insightEngine";

export interface AnalysisContext {
  profile: DataProfile;
  statistics: Record<string, NumericStatistics>;
  insights: DataInsight[];
}

export function createAnalysisContext(
  profile: DataProfile,
  statistics: Record<string, NumericStatistics>,
  insights: DataInsight[]
): AnalysisContext {
  return {
    profile,
    statistics,
    insights,
  };
}