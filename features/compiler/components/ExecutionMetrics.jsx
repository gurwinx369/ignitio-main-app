'use client';

import { useMemo } from 'react';

/**
 * Status indicator component
 */
function StatusIndicator({ status }) {
  const statusConfig = {
    success: {
      color: 'bg-[#10b981]',
      ringColor: 'ring-[#10b981]/50',
      text: 'Success',
      textColor: 'text-[#10b981]',
      bgColor: 'bg-[#d1fae5]'
    },
    error: {
      color: 'bg-[#ef4444]',
      ringColor: 'ring-[#ef4444]/50',
      text: 'Error',
      textColor: 'text-[#ef4444]',
      bgColor: 'bg-[#fee2e2]'
    },
    idle: {
      color: 'bg-[#5a5892]',
      ringColor: 'ring-[#5a5892]/50',
      text: 'Ready',
      textColor: 'text-[#3d3c7f]',
      bgColor: 'bg-[#fcf5ee]'
    },
    running: {
      color: 'bg-[#f59e0b]',
      ringColor: 'ring-[#f59e0b]/50',
      text: 'Running',
      textColor: 'text-[#f59e0b]',
      bgColor: 'bg-[#fef3c7]'
    }
  };

  const config = statusConfig[status] || statusConfig.idle;

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`
            absolute inline-flex h-full w-full rounded-full
            ${config.color} opacity-75 animate-ping
          `}
        />
        <span
          className={`
            relative inline-flex rounded-full h-2.5 w-2.5
            ${config.color} ring-2 ${config.ringColor}
          `}
        />
      </span>
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
}

/**
 * MetricItem Component
 * Displays a single metric with label and value
 */
function MetricItem({ label, value, unit, compact = false }) {
  return (
    <div className={`
      flex flex-col gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-lg bg-[#fcf5ee] border border-[#f0caa8]
      ${compact ? 'flex-shrink-0 min-w-[70px] sm:min-w-[80px]' : ''}
    `}>
      <span className="text-[10px] sm:text-xs text-[#7775a5] uppercase tracking-wide">
        {label}
      </span>
      <div className="flex items-baseline gap-0.5 sm:gap-1">
        <span className={`
          font-semibold text-[#19183b]
          ${compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}
        `}>
          {value}
        </span>
        {unit && (
          <span className="text-[10px] sm:text-xs text-[#5a5892]">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * ExecutionMetrics Component
 * Displays execution metrics including time, memory usage, and status
 * Uses project design system (beige background, navy text)
 */
export default function ExecutionMetrics({
  executionTime = 0,
  memoryUsage = 0,
  status = 'idle',
  layout = 'vertical',
  className = ''
}) {
  const formattedTime = useMemo(() => {
    if (executionTime === 0) return '0.00';
    return executionTime.toFixed(2);
  }, [executionTime]);

  const formattedMemory = useMemo(() => {
    if (memoryUsage === 0) return '0.0';
    return memoryUsage.toFixed(1);
  }, [memoryUsage]);

  const isHorizontal = layout === 'horizontal';

  return (
    <div
      className={`
        w-full h-full rounded-lg overflow-hidden
        bg-white border border-[#f0caa8]
        ${isHorizontal ? 'flex flex-row' : 'flex flex-col'}
        ${className}
      `}
    >
      {/* Header */}
      <div className={`
        flex items-center justify-center border-b border-[#f0caa8] bg-[#fcf5ee]
        ${isHorizontal ? 'px-2 py-2 border-r border-b-0' : 'px-4 py-2'}
      `}>
        <span className={`
          font-semibold text-[#19183b] uppercase tracking-wide
          ${isHorizontal ? 'text-[10px]' : 'text-xs'}
        `}>
          {isHorizontal ? 'Metrics' : 'Execution Metrics'}
        </span>
      </div>

      {/* Metrics container */}
      <div className={`
        flex-1 p-2 sm:p-3 bg-white overflow-auto
        ${isHorizontal ? 'flex flex-row items-center gap-2 sm:gap-3' : 'flex flex-col gap-2 sm:gap-3'}
      `}>
        {/* Status */}
        <div className={`
          flex flex-col gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-lg bg-[#fcf5ee] border border-[#f0caa8]
          ${isHorizontal ? 'flex-shrink-0' : ''}
        `}>
          <span className="text-[10px] sm:text-xs text-[#7775a5] uppercase tracking-wide">
            Status
          </span>
          <StatusIndicator status={status} />
        </div>

        {/* Execution Time */}
        <MetricItem
          label="Time"
          value={formattedTime}
          unit="s"
          compact={isHorizontal}
        />

        {/* Memory Usage */}
        <MetricItem
          label="Memory"
          value={formattedMemory}
          unit="MB"
          compact={isHorizontal}
        />

      </div>
    </div>
  );
}
