import { RiskLevel, riskLevelConfig } from '@/domain/enums/risk-level';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RiskBadge({ level, size = 'md', showLabel = true }: RiskBadgeProps) {
  const config = riskLevelConfig[level];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        config.bgClass,
        config.textClass,
        config.borderClass,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-xs',
        size === 'lg' && 'px-3 py-1.5 text-sm',
      )}
    >
      <span className={cn('rounded-full', config.dotClass, size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')} />
      {showLabel && config.label}
    </span>
  );
}
