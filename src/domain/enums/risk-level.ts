export enum RiskLevel {
  EMERGENCY = 'EMERGENCY',       // 🔴 Vermelho — Emergência
  VERY_URGENT = 'VERY_URGENT',   // 🟠 Laranja — Muito Urgente
  URGENT = 'URGENT',             // 🟡 Amarelo — Urgente
  LESS_URGENT = 'LESS_URGENT',   // 🟢 Verde — Pouco Urgente
  NON_URGENT = 'NON_URGENT',     // 🔵 Azul — Não Urgente
}

export const riskLevelConfig: Record<RiskLevel, {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
  maxWaitMinutes: number;
  order: number;
}> = {
  [RiskLevel.EMERGENCY]: {
    label: 'Emergência',
    color: '#DC2626',
    bgClass: 'bg-risk-emergency/10',
    textClass: 'text-risk-emergency',
    borderClass: 'border-risk-emergency',
    dotClass: 'bg-risk-emergency',
    maxWaitMinutes: 0,
    order: 1,
  },
  [RiskLevel.VERY_URGENT]: {
    label: 'Muito Urgente',
    color: '#EA580C',
    bgClass: 'bg-risk-very-urgent/10',
    textClass: 'text-risk-very-urgent',
    borderClass: 'border-risk-very-urgent',
    dotClass: 'bg-risk-very-urgent',
    maxWaitMinutes: 10,
    order: 2,
  },
  [RiskLevel.URGENT]: {
    label: 'Urgente',
    color: '#CA8A04',
    bgClass: 'bg-risk-urgent/10',
    textClass: 'text-risk-urgent',
    borderClass: 'border-risk-urgent',
    dotClass: 'bg-risk-urgent',
    maxWaitMinutes: 60,
    order: 3,
  },
  [RiskLevel.LESS_URGENT]: {
    label: 'Pouco Urgente',
    color: '#16A34A',
    bgClass: 'bg-risk-less-urgent/10',
    textClass: 'text-risk-less-urgent',
    borderClass: 'border-risk-less-urgent',
    dotClass: 'bg-risk-less-urgent',
    maxWaitMinutes: 120,
    order: 4,
  },
  [RiskLevel.NON_URGENT]: {
    label: 'Não Urgente',
    color: '#2563EB',
    bgClass: 'bg-risk-non-urgent/10',
    textClass: 'text-risk-non-urgent',
    borderClass: 'border-risk-non-urgent',
    dotClass: 'bg-risk-non-urgent',
    maxWaitMinutes: 240,
    order: 5,
  },
};
