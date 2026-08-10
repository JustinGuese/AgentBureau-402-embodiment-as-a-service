import { formatUsdc } from '../../lib/gateway';
import type { MandateStatus } from '../../lib/mandate';

type Bar = { label: string; spent: number; cap: number | null };

function Meter({ label, spent, cap }: Bar) {
  const pct = cap === null || cap === 0 ? 0 : Math.min(100, (spent / cap) * 100);
  const nearLimit = pct >= 80;
  return (
    <div>
      <div className="flex justify-between text-[11px] font-mono mb-1">
        <span className="text-slate-400">{label}</span>
        <span className={nearLimit ? 'text-yellow-400' : 'text-slate-300'}>
          {formatUsdc(spent)} / {cap === null ? '∞' : formatUsdc(cap)} USDC
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${
            nearLimit ? 'bg-yellow-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${cap === null ? 0 : pct}%` }}
        />
      </div>
    </div>
  );
}

type Props = {
  status: Pick<
    MandateStatus,
    'spent_today_usdc' | 'spent_month_usdc' | 'spent_total_usdc' | 'calls'
  >;
  caps: { daily: number | null; monthly: number | null; total: number | null };
  labels: Record<string, string>;
};

export default function SpendMeter({ status, caps, labels }: Props) {
  return (
    <div className="rounded-md border border-slate-700 bg-slate-800/50 p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase font-bold tracking-wider text-slate-400">{labels.meterTitle}</p>
        <span className="text-[11px] font-mono text-slate-500">
          {labels.calls.replace('{n}', String(status.calls))}
        </span>
      </div>
      <Meter label={labels.today} spent={status.spent_today_usdc} cap={caps.daily} />
      <Meter label={labels.month} spent={status.spent_month_usdc} cap={caps.monthly} />
      <Meter label={labels.lifetime} spent={status.spent_total_usdc} cap={caps.total} />
    </div>
  );
}
