import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

export type DateRangeOption = 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-quarter' | 'this-year' | 'custom';

export interface Filters {
  dateRange: DateRangeOption;
  customStart?: string; // ISO
  customEnd?: string; // ISO
  serviceCategory: 'all' | 'financial' | 'non-financial';
  subServiceType: 'all' | 'onboarding' | 'activation' | 'advisory' | 'training';
  region: 'all' | 'uae' | 'gcc' | 'mena' | 'global';
  enterpriseSize: 'all' | 'micro' | 'small' | 'medium' | 'large';
}

export type MonthKey = string; // e.g., 'Apr'

export interface ServiceAdoptionMetric {
  title: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  threshold?: 'excellent' | 'good' | 'normal' | 'warning' | 'critical';
  description: string;
  icon: string;
  sparklineData: number[];
  target?: string;
}

export interface OnboardingActivationPoint {
  month: MonthKey;
  onboarding: number;
  activation: number;
  onboardingCount: number;
  activationCount: number;
  serviceType?: 'financial' | 'non-financial';
  subServiceType?: 'onboarding' | 'activation' | 'advisory' | 'training';
}

export interface TimeToActivationPoint {
  month: MonthKey;
  avg: number;
  min: number;
  max: number;
  serviceType?: 'financial' | 'non-financial';
  subServiceType?: 'onboarding' | 'activation' | 'advisory' | 'training';
}

export interface DropoffPoint { 
  month: MonthKey; 
  value: number; 
  serviceType?: 'financial' | 'non-financial';
  subServiceType?: 'onboarding' | 'activation' | 'advisory' | 'training';
}

export interface HeatmapTaskPoint {
  task: string;
  month: MonthKey;
  value: number;
  completed: number;
  total: number;
  serviceType?: 'financial' | 'non-financial';
  subServiceType?: 'onboarding' | 'activation' | 'advisory' | 'training';
}

// Service Usage & Loyalty series
export interface ActiveUserPoint { month: string; value: number; movingAverage: number; serviceType?: string; subServiceType?: string; region?: string; size?: string }
export interface RepeatUsagePoint { month: string; repeatUsers: number; firstTimeUsers: number; serviceType?: string; subServiceType?: string; region?: string; size?: string }
export interface ChurnRetentionPoint { month: string; retention: number; churn: number; serviceType?: string; subServiceType?: string; region?: string; size?: string }

const lastNMonths = (n = 6): MonthKey[] => {
  return Array.from({ length: n })
    .map((_, i) => dayjs().subtract(n - 1 - i, 'month').format('MMM')) as MonthKey[];
};

// Build time labels based on filters
export function getTimeLabels(filters: Filters): string[] {
  const now = dayjs();
  const labels: string[] = [];
  const add = (d: dayjs.Dayjs, unit: 'hour' | 'day' | 'month') => {
    if (unit === 'hour') labels.push(d.format('HH:mm'));
    if (unit === 'day') labels.push(d.format('DD MMM'));
    if (unit === 'month') labels.push(d.format('MMM'));
  };

  switch (filters.dateRange) {
    case 'today': {
      for (let i = 23; i >= 0; i--) add(now.subtract(i, 'hour'), 'hour');
      break;
    }
    case 'yesterday': {
      const start = now.subtract(1, 'day').startOf('day');
      for (let i = 0; i < 24; i++) add(start.add(i, 'hour'), 'hour');
      break;
    }
    case 'this-week': {
      for (let i = 6; i >= 0; i--) add(now.subtract(i, 'day'), 'day');
      break;
    }
    case 'last-week': {
      const start = now.subtract(1, 'week').startOf('week');
      for (let i = 0; i < 7; i++) add(start.add(i, 'day'), 'day');
      break;
    }
    case 'this-month': {
      for (let i = 29; i >= 0; i--) add(now.subtract(i, 'day'), 'day');
      break;
    }
    case 'last-month': {
      const start = now.subtract(1, 'month').startOf('month');
      const days = start.daysInMonth();
      for (let i = 0; i < days; i++) add(start.add(i, 'day'), 'day');
      break;
    }
    case 'this-quarter': {
      for (let i = 2; i >= 0; i--) add(now.subtract(i, 'month'), 'month');
      break;
    }
    case 'this-year': {
      const start = now.startOf('year');
      const months = now.diff(start, 'month') + 1; // Jan..current month inclusive
      for (let i = 0; i < months; i++) add(start.add(i, 'month'), 'month');
      break;
    }
    case 'custom': {
      const start = dayjs(filters.customStart);
      const end = dayjs(filters.customEnd);
      const diffDays = end.diff(start, 'day') + 1;
      if (diffDays <= 90) {
        for (let i = 0; i < diffDays; i++) add(start.add(i, 'day'), 'day');
      } else {
        const diffMonths = end.diff(start, 'month') + 1;
        for (let i = 0; i < diffMonths; i++) add(start.add(i, 'month'), 'month');
      }
      break;
    }
  }
  return labels;
}

const REGIONS = ['uae','gcc','mena','global'] as const;
const SIZES = ['micro','small','medium','large'] as const;

function applyFilters<T extends { serviceType?: string; subServiceType?: string; region?: string; size?: string }>(rows: T[], filters: Filters): T[] {
  return rows.filter((r) => {
    const st = filters.serviceCategory === 'all' || !r.serviceType || r.serviceType === filters.serviceCategory;
    const sb = filters.subServiceType === 'all' || !r.subServiceType || r.subServiceType === filters.subServiceType;
    const rg = filters.region === 'all' || !r.region || r.region === filters.region;
    const sz = filters.enterpriseSize === 'all' || !r.size || r.size === filters.enterpriseSize;
    return st && sb && rg && sz;
  });
}

export const generateServiceAdoptionMetrics = (): ServiceAdoptionMetric[] => {
  const engaged = faker.number.int({ min: 950, max: 1450 });
  const activation = faker.number.int({ min: 70, max: 92 });
  const usage = faker.number.float({ min: 8, max: 16, fractionDigits: 1 });
  const retention = faker.number.int({ min: 85, max: 96 });
  const months = lastNMonths();

  return [
    {
      title: 'Total Engaged Enterprises',
      value: engaged.toLocaleString(),
      unit: '',
      trend: 'up',
      trendValue: '+5%',
      threshold: 'excellent',
      description: 'Total enterprises interacting with services.',
      icon: 'Users',
      sparklineData: months.map(() => faker.number.int({ min: engaged - 200, max: engaged + 50 })),
      target: (engaged - 50).toLocaleString(),
    },
    {
      title: 'Activation Rate',
      value: activation,
      unit: '%',
      trend: 'up',
      trendValue: '+2%',
      threshold: 'good',
      description: 'Percentage of onboarded enterprises activated.',
      icon: 'Zap',
      sparklineData: months.map(() => faker.number.int({ min: activation - 6, max: activation })),
      target: `${activation - 5}%`,
    },
    {
      title: 'Average Usage per Enterprise',
      value: usage,
      unit: 'events',
      trend: 'up',
      trendValue: '+0.5',
      threshold: 'excellent',
      description: 'Average service utilization per active enterprise.',
      icon: 'Activity',
      sparklineData: months.map(() => faker.number.float({ min: usage - 1, max: usage + 0.5, fractionDigits: 1 })),
      target: `${(Math.round(usage)).toString()} events`,
    },
    {
      title: 'Enterprise Retention Rate',
      value: retention,
      unit: '%',
      trend: 'up',
      trendValue: '+1% ',
      threshold: 'good',
      description: 'Percentage of active enterprises retained.',
      icon: 'Repeat',
      sparklineData: months.map(() => faker.number.int({ min: retention - 3, max: retention })),
      target: `${retention - 2}%`,
    },
  ];
};

export const generateOnboardingActivation = (filters?: Filters): OnboardingActivationPoint[] => {
  const labels = filters ? getTimeLabels(filters) : lastNMonths();
  const rows = labels.map((m) => {
    const onboarding = faker.number.int({ min: 55, max: 72 });
    const activation = onboarding - faker.number.int({ min: 3, max: 10 });
    const onboardCount = faker.number.int({ min: 350, max: 560 });
    const activateCount = Math.round(onboardCount * activation / 100);
    const serviceType = faker.helpers.arrayElement(['financial','non-financial']) as 'financial'|'non-financial';
    const subServiceType = faker.helpers.arrayElement(['onboarding','activation','advisory','training']) as 'onboarding'|'activation'|'advisory'|'training';
    const region = faker.helpers.arrayElement(REGIONS) as string;
    const size = faker.helpers.arrayElement(SIZES) as string;
    return { month: m, onboarding, activation, onboardingCount: onboardCount, activationCount: activateCount, serviceType, subServiceType, region, size } as any;
  });
  return filters ? applyFilters(rows as any, filters) : rows;
};

export const generateTimeToActivation = (filters?: Filters): TimeToActivationPoint[] => {
  const labels = filters ? getTimeLabels(filters) : lastNMonths();
  const rows = labels.map((m) => {
    const min = faker.number.float({ min: 0.8, max: 1.6, fractionDigits: 1 });
    const max = faker.number.float({ min: 1.8, max: 2.9, fractionDigits: 1 });
    const avg = Number(((min + max) / 2 + faker.number.float({ min: -0.2, max: 0.2 })).toFixed(1));
    const serviceType = faker.helpers.arrayElement(['financial','non-financial']) as 'financial'|'non-financial';
    const subServiceType = faker.helpers.arrayElement(['onboarding','activation','advisory','training']) as 'onboarding'|'activation'|'advisory'|'training';
    const region = faker.helpers.arrayElement(REGIONS) as string;
    const size = faker.helpers.arrayElement(SIZES) as string;
    return { month: m, avg, min, max, serviceType, subServiceType, region, size } as any;
  });
  return filters ? applyFilters(rows as any, filters) : rows;
};

export const generateDropoff = (filters?: Filters): DropoffPoint[] => {
  const labels = filters ? getTimeLabels(filters) : lastNMonths();
  const rows = labels.map((m) => ({
    month: m,
    value: faker.number.int({ min: 6, max: 20 }),
    serviceType: faker.helpers.arrayElement(['financial','non-financial']) as 'financial'|'non-financial',
    subServiceType: faker.helpers.arrayElement(['onboarding','activation','advisory','training']) as 'onboarding'|'activation'|'advisory'|'training',
    region: faker.helpers.arrayElement(REGIONS) as string,
    size: faker.helpers.arrayElement(SIZES) as string,
  }));
  return filters ? applyFilters(rows as any, filters) : rows;
};

const TASKS = ['Account Setup', 'First Transaction', 'Training Completion', 'Service Configuration', 'Contract Upload', 'KYC Verification'];
export const generateOnboardingTasksHeatmap = (filters?: Filters): HeatmapTaskPoint[] => {
  const months = filters ? getTimeLabels(filters) : lastNMonths();
  const total = 400;
  const data: HeatmapTaskPoint[] = [];
  TASKS.forEach((task) => {
    months.forEach((m) => {
      const value = faker.number.int({ min: 70, max: 100 });
      const completed = Math.round((value / 100) * total);
      const serviceType = faker.helpers.arrayElement(['financial','non-financial']) as 'financial'|'non-financial';
      const subServiceType = faker.helpers.arrayElement(['onboarding','activation','advisory','training']) as 'onboarding'|'activation'|'advisory'|'training';
      const region = faker.helpers.arrayElement(REGIONS) as string;
      const size = faker.helpers.arrayElement(SIZES) as string;
      data.push({ task, month: m, value, completed, total, serviceType, subServiceType, region, size } as any);
    });
  });
  return filters ? applyFilters(data as any, filters) : data;
};

export const generateServicePerformanceMetrics = (): ServiceAdoptionMetric[] => {
  return [
    {
      title: 'SLA Compliance Rate',
      value: faker.number.float({ min: 97.5, max: 99.5, fractionDigits: 1 }),
      unit: '%',
      trend: 'up',
      trendValue: '+0.2%',
      threshold: 'excellent',
      description: 'Percentage of services delivered within agreed SLA.',
      icon: 'CheckCircle',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.float({ min: 98, max: 99.5, fractionDigits: 1 })),
      target: '98%'
    },
    {
      title: 'Average Resolution Time',
      value: faker.number.float({ min: 1.8, max: 3.5, fractionDigits: 1 }),
      unit: 'hours',
      trend: 'down',
      trendValue: '-0.3h',
      threshold: 'good',
      description: 'Average time to resolve service-related issues.',
      icon: 'Clock',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.float({ min: 2.0, max: 3.8, fractionDigits: 1 })),
      target: '2.5 hours'
    },
    {
      title: 'Service Success Rate',
      value: faker.number.float({ min: 98.8, max: 99.7, fractionDigits: 1 }),
      unit: '%',
      trend: 'up',
      trendValue: '+0.1%',
      threshold: 'excellent',
      description: 'Overall success rate of service transactions.',
      icon: 'Award',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.float({ min: 98.9, max: 99.8, fractionDigits: 1 })),
      target: '99%'
    },
    {
      title: 'System Reliability Score',
      value: faker.number.float({ min: 4.3, max: 4.9, fractionDigits: 1 }),
      unit: '/5',
      trend: 'up',
      trendValue: '+0.1',
      threshold: 'excellent',
      description: 'Aggregate score for system stability and availability.',
      icon: 'ShieldCheck',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.float({ min: 4.4, max: 4.9, fractionDigits: 1 })),
      target: '4.7/5'
    },
    {
      title: 'Error Rate',
      value: faker.number.float({ min: 0.02, max: 0.1, fractionDigits: 2 }),
      unit: '%',
      trend: 'down',
      trendValue: '-0.01%',
      threshold: 'good',
      description: 'Percentage of transactions resulting in an error.',
      icon: 'XCircle',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.float({ min: 0.03, max: 0.12, fractionDigits: 2 })),
      target: '0.06%'
    },
    {
      title: 'Feature Adoption Rate',
      value: faker.number.int({ min: 60, max: 85 }),
      unit: '%',
      trend: 'up',
      trendValue: '+3%',
      threshold: 'good',
      description: 'Rate at which new features are adopted by enterprises.',
      icon: 'Lightbulb',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.int({ min: 60, max: 85 })),
      target: '72%'
    }
  ];
};

export const generateEnterpriseOutcomesMetrics = (): ServiceAdoptionMetric[] => {
  return [
    {
      title: 'Customer Satisfaction (CSAT)',
      value: faker.number.float({ min: 4.2, max: 4.8, fractionDigits: 1 }),
      unit: '/5',
      trend: 'up',
      trendValue: '+0.1',
      threshold: 'excellent',
      description: 'Average customer satisfaction score for EJP services.',
      icon: 'Smile',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.float({ min: 4.0, max: 4.9, fractionDigits: 1 })),
      target: '4.4/5'
    },
    {
      title: 'Revenue Generated (EJP)',
      value: `$${faker.number.float({ min: 0.8, max: 1.6, fractionDigits: 1 })}M`,
      unit: '',
      trend: 'up',
      trendValue: '+10%',
      threshold: 'excellent',
      description: 'Total revenue attributed to EJP transactions.',
      icon: 'DollarSign',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.float({ min: 0.9, max: 1.7, fractionDigits: 2 })),
      target: '$1.1M'
    },
    {
      title: 'ROI on Service Operations',
      value: faker.number.int({ min: 120, max: 170 }),
      unit: '%',
      trend: 'up',
      trendValue: '+5%',
      threshold: 'good',
      description: 'Return on investment for service delivery operations.',
      icon: 'TrendingUp',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.int({ min: 120, max: 170 })),
      target: '145%'
    },
    {
      title: 'Enterprise NPS',
      value: faker.number.int({ min: 55, max: 75 }),
      unit: '',
      trend: 'up',
      trendValue: '+3',
      threshold: 'excellent',
      description: 'Net Promoter Score from enterprise clients.',
      icon: 'ThumbsUp',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.int({ min: 55, max: 75 })),
      target: '62'
    }
  ];
};

export const generateOperationalMetrics = (): ServiceAdoptionMetric[] => {
  return [
    {
      title: 'Support Ticket Volume',
      value: faker.number.int({ min: 260, max: 420 }),
      unit: '',
      trend: 'down',
      trendValue: '-15%',
      threshold: 'good',
      description: 'Total number of support tickets received.',
      icon: 'LifeBuoy',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.int({ min: 260, max: 420 })),
      target: '350'
    },
    {
      title: 'Average Resolution Time (Tickets)',
      value: faker.number.float({ min: 3.4, max: 5.5, fractionDigits: 1 }),
      unit: 'hours',
      trend: 'down',
      trendValue: '-0.5h',
      threshold: 'excellent',
      description: 'Average time to resolve support tickets.',
      icon: 'Hourglass',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.float({ min: 3.4, max: 5.5, fractionDigits: 1 })),
      target: '4.5 hours'
    },
    {
      title: 'Escalation Rate',
      value: faker.number.int({ min: 6, max: 12 }),
      unit: '%',
      trend: 'down',
      trendValue: '-2%',
      threshold: 'good',
      description: 'Percentage of tickets escalated to higher tiers.',
      icon: 'ArrowUpCircle',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.int({ min: 6, max: 12 })),
      target: '9%'
    },
    {
      title: 'Risk Exposure Score',
      value: faker.number.float({ min: 2.1, max: 3.2, fractionDigits: 1 }),
      unit: '/5',
      trend: 'down',
      trendValue: '-0.2',
      threshold: 'good',
      description: 'Aggregate score indicating operational risk level.',
      icon: 'ShieldAlert',
      sparklineData: Array.from({ length: 6 }).map(() => faker.number.float({ min: 2.1, max: 3.2, fractionDigits: 1 })),
      target: '2.7/5'
    }
  ];
};

// Usage & Loyalty generators
export const generateActiveUserRateSeries = (filters?: Filters): ActiveUserPoint[] => {
  const labels = getTimeLabels(filters as Filters);
  const rows: ActiveUserPoint[] = labels.map((m, idx) => {
    const base = 70 + Math.sin(idx / 3) * 8 + faker.number.float({ min: -2, max: 2 });
    const value = Math.max(55, Math.min(95, Math.round(base)));
    const maWindow = 3;
    const start = Math.max(0, idx - maWindow + 1);
    const arr = Array.from({ length: idx - start + 1 }).map((_, i) => 70 + Math.sin((start + i) / 3) * 8);
    const movingAverage = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const serviceType = faker.helpers.arrayElement(['financial','non-financial']) as string;
    const subServiceType = faker.helpers.arrayElement(['onboarding','activation','advisory','training']) as string;
    const region = faker.helpers.arrayElement(REGIONS) as string;
    const size = faker.helpers.arrayElement(SIZES) as string;
    return { month: m, value, movingAverage, serviceType, subServiceType, region, size };
  });
  return filters ? applyFilters(rows as any, filters) as any : rows;
};

export const generateRepeatUsageSeries = (filters?: Filters): RepeatUsagePoint[] => {
  const labels = getTimeLabels(filters as Filters);
  const rows: RepeatUsagePoint[] = labels.map((m) => {
    const total = faker.number.int({ min: 350, max: 520 });
    const repeatPct = faker.number.int({ min: 55, max: 80 });
    const repeatUsers = Math.round((repeatPct / 100) * total);
    const firstTimeUsers = total - repeatUsers;
    const serviceType = faker.helpers.arrayElement(['financial','non-financial']) as string;
    const subServiceType = faker.helpers.arrayElement(['onboarding','activation','advisory','training']) as string;
    const region = faker.helpers.arrayElement(REGIONS) as string;
    const size = faker.helpers.arrayElement(SIZES) as string;
    return { month: m, repeatUsers, firstTimeUsers, serviceType, subServiceType, region, size };
  });
  return filters ? applyFilters(rows as any, filters) as any : rows;
};

export const generateChurnRetentionSeries = (filters?: Filters): ChurnRetentionPoint[] => {
  const labels = getTimeLabels(filters as Filters);
  const rows: ChurnRetentionPoint[] = labels.map((m) => {
    const churn = faker.number.int({ min: 3, max: 12 });
    const retention = Math.max(60, Math.min(98, 100 - churn + faker.number.int({ min: -2, max: 2 })));
    const serviceType = faker.helpers.arrayElement(['financial','non-financial']) as string;
    const subServiceType = faker.helpers.arrayElement(['onboarding','activation','advisory','training']) as string;
    const region = faker.helpers.arrayElement(REGIONS) as string;
    const size = faker.helpers.arrayElement(SIZES) as string;
    return { month: m, retention, churn, serviceType, subServiceType, region, size };
  });
  return filters ? applyFilters(rows as any, filters) as any : rows;
};

export const MockData = {
  lastNMonths,
  generateServiceAdoptionMetrics,
  generateOnboardingActivation,
  generateTimeToActivation,
  generateDropoff,
  generateOnboardingTasksHeatmap,
  generateServicePerformanceMetrics,
  generateEnterpriseOutcomesMetrics,
  generateOperationalMetrics,
  generateActiveUserRateSeries,
  generateRepeatUsageSeries,
  generateChurnRetentionSeries,
};

export default MockData;


