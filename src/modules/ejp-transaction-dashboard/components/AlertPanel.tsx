import React from 'react';
import ChartContainer from './ChartContainer';
import ChartTheme from './ChartTheme';
import { cn } from '../../../utils/cn';

export interface Alert {
  title: string;
  date: string;
  context: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AlertPanelProps {
  alerts: Alert[];
  title?: string;
  description?: string;
  className?: string;
}

/**
 * AlertPanel - ShadCN UI styled alert panel component
 * Displays alerts with color-coded severity using consistent theme colors
 */
const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  title = 'Alerts',
  description,
  className,
}) => {
  const getAlertStyles = (severity: Alert['severity']) => {
    const alertTheme = ChartTheme.alerts[severity];
    return {
      background: alertTheme.background,
      text: alertTheme.text,
      border: alertTheme.border,
    };
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟠';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  // Sort alerts by severity: High first, then Medium, then Low
  const severityOrder = { high: 0, medium: 1, low: 2 };
  const sortedAlerts = [...alerts].sort((a, b) => {
    return (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99);
  });

  return (
    <ChartContainer title={title} description={description} className={className}>
      <div className="space-y-3">
        {sortedAlerts.map((alert, index) => {
          const styles = getAlertStyles(alert.severity);
          return (
            <div
              key={index}
              className="p-3 rounded-lg border-l-4"
              style={{
                backgroundColor: styles.background,
                borderLeftColor: styles.border,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: styles.text }}>{getSeverityIcon(alert.severity)}</span>
                <span className="text-sm font-medium" style={{ color: styles.text }}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                </span>
              </div>
              <div className="text-sm mb-1 font-medium" style={{ color: styles.text }}>
                {alert.title}
              </div>
              <div className="text-xs opacity-75" style={{ color: styles.text }}>
                {alert.date} • {alert.context}
              </div>
            </div>
          );
        })}
      </div>
    </ChartContainer>
  );
};

export default AlertPanel;

