/**
 * Chart Theme - Centralized color logic for all dashboard charts
 * Follows ShadCN UI patterns and consistent design system
 */

export const ChartTheme = {
  // Base Theme (Blue/Teal System) - For descriptive and neutral metrics
  base: {
    primaryBlue: '#2563EB',
    secondaryTeal: '#0D9488',
    accentIndigo: '#4F46E5',
    neutralGray: '#64748B',
    surfaceLight: '#F8FAFC',
    textAxis: '#1E293B',
    targetGray: '#94A3B8',
  },

  // Performance Gradient (Green–Red System) - For good → bad outcomes
  performance: {
    excellent: '#16A34A',      // Top quartile, good SLA, strong retention
    good: '#4ADE80',           // Acceptable performance
    moderate: '#FACC15',       // Average or declining trend
    low: '#FB923C',            // Underperforming metric
    critical: '#DC2626',       // Drop-off, churn, SLA breach
  },

  // Alert Colors
  alerts: {
    high: {
      background: '#FEEAEA',    // Light red/pink background
      text: '#D93025',          // Red text
      border: '#D93025',        // Red border (Critical deviations)
    },
    medium: {
      background: '#FFF3E0',    // Light orange/peach background
      text: '#E67C00',          // Orange text
      border: '#E67C00',        // Orange border (Moderate changes)
    },
    low: {
      background: '#E8F5E9',    // Light green background
      text: '#1E8E3E',          // Green text
      border: '#1E8E3E',        // Green border (Stable/improving)
    },
  },

  // Helper functions
  getPerformanceColor: (value: number, thresholds: { low: number; moderate: number; high: number }): string => {
    if (value < thresholds.moderate) return ChartTheme.performance.excellent;
    if (value < thresholds.high) return ChartTheme.performance.moderate;
    return ChartTheme.performance.critical;
  },

  getCompletionColor: (value: number): string => {
    if (value >= 90) return ChartTheme.performance.excellent;
    if (value >= 70) return ChartTheme.performance.moderate;
    return ChartTheme.performance.critical;
  },

  getDropoffColor: (value: number): string => {
    if (value < 10) return ChartTheme.performance.good;
    if (value <= 15) return ChartTheme.performance.moderate;
    return ChartTheme.performance.critical;
  },

  // ECharts configuration helpers
  getEChartsOption: () => ({
    textStyle: {
      color: ChartTheme.base.textAxis,
      fontFamily: 'inherit',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: ChartTheme.base.neutralGray,
      borderWidth: 1,
      textStyle: {
        color: ChartTheme.base.textAxis,
      },
    },
  }),
};

export default ChartTheme;

