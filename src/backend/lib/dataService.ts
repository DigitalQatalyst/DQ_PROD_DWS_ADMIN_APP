import MockData, {
  ServiceAdoptionMetric,
  OnboardingActivationPoint,
  TimeToActivationPoint,
  DropoffPoint,
  HeatmapTaskPoint,
  Filters,
} from '../data/mock';

export interface DashboardData {
  serviceAdoptionMetrics: ServiceAdoptionMetric[];
  onboardingActivation: OnboardingActivationPoint[];
  timeToActivation: TimeToActivationPoint[];
  dropoff: DropoffPoint[];
  onboardingTasksHeatmap: HeatmapTaskPoint[];
  servicePerformanceMetrics: ServiceAdoptionMetric[];
  enterpriseOutcomesMetrics: ServiceAdoptionMetric[];
  operationalMetrics: ServiceAdoptionMetric[];
  activeUserRate: { month: string; value: number; movingAverage: number }[];
  repeatUsage: { month: string; repeatUsers: number; firstTimeUsers: number }[];
  churnRetention: { month: string; retention: number; churn: number }[];
}

// Current implementation uses mock generators; swap to real CRM functions later
export async function fetchDashboardData(filters?: Filters): Promise<DashboardData> {
  // Simulate async latency
  await new Promise((r) => setTimeout(r, 50));

  return {
    serviceAdoptionMetrics: MockData.generateServiceAdoptionMetrics(),
    onboardingActivation: MockData.generateOnboardingActivation(filters),
    timeToActivation: MockData.generateTimeToActivation(filters),
    dropoff: MockData.generateDropoff(filters),
    onboardingTasksHeatmap: MockData.generateOnboardingTasksHeatmap(filters),
    servicePerformanceMetrics: MockData.generateServicePerformanceMetrics(),
    enterpriseOutcomesMetrics: MockData.generateEnterpriseOutcomesMetrics(),
    operationalMetrics: MockData.generateOperationalMetrics(),
    activeUserRate: MockData.generateActiveUserRateSeries(filters),
    repeatUsage: MockData.generateRepeatUsageSeries(filters),
    churnRetention: MockData.generateChurnRetentionSeries(filters),
  };
}

export const DataService = { fetchDashboardData };
export default DataService;


