import { ENDPOINTS } from '../../lib/gateway';
import type { Caps } from '../../lib/mandate';

type Props = {
  caps: Caps;
  onCapChange: (key: keyof Caps, value: number | null) => void;
  allowedPaths: string[];
  onTogglePath: (path: string) => void;
  expiryDays: number;
  onExpiryChange: (days: number) => void;
  spender: string;
  onSpenderChange: (value: string) => void;
  labels: Record<string, string>;
  disabled?: boolean;
};

const CAP_KEYS: Array<keyof Caps> = ['perCall', 'daily', 'monthly', 'total'];

const inputClass =
  'w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50';

export default function CapFields({
  caps,
  onCapChange,
  allowedPaths,
  onTogglePath,
  expiryDays,
  onExpiryChange,
  spender,
  onSpenderChange,
  labels,
  disabled,
}: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="mandate-spender">
          {labels.spender}
        </label>
        <input
          id="mandate-spender"
          className={`${inputClass} font-mono`}
          value={spender}
          onChange={(e) => onSpenderChange(e.target.value)}
          placeholder="0x…"
          disabled={disabled}
        />
        <p className="text-[11px] text-slate-500 mt-1">{labels.spenderHint}</p>
      </div>

      <div>
        <p className="block text-sm font-medium text-slate-400 mb-2">{labels.caps}</p>
        <div className="grid grid-cols-2 gap-3">
          {CAP_KEYS.map((key) => (
            <div key={key}>
              <label className="text-[11px] uppercase tracking-wider text-slate-500" htmlFor={`cap-${key}`}>
                {labels[`cap_${key}`]}
              </label>
              <input
                id={`cap-${key}`}
                type="number"
                min="0"
                step="0.01"
                className={`${inputClass} mt-1 font-mono`}
                value={caps[key] === null ? '' : caps[key]!}
                placeholder={labels.unlimited}
                onChange={(e) =>
                  onCapChange(key, e.target.value === '' ? null : Number(e.target.value))
                }
                disabled={disabled}
              />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">{labels.capsHint}</p>
      </div>

      <div>
        <p className="block text-sm font-medium text-slate-400 mb-2">{labels.scope}</p>
        <div className="max-h-44 overflow-y-auto rounded-md border border-slate-700 bg-slate-800/50 p-2 space-y-1">
          {ENDPOINTS.map((endpoint) => (
            <label
              key={endpoint.id}
              className="flex items-center gap-2 text-xs text-slate-300 px-1 py-1 rounded hover:bg-slate-700/50 cursor-pointer"
            >
              <input
                type="checkbox"
                className="accent-blue-500"
                checked={allowedPaths.includes(endpoint.path)}
                onChange={() => onTogglePath(endpoint.path)}
                disabled={disabled}
              />
              <span className="flex-1">{endpoint.label}</span>
              <span className="font-mono text-slate-500">{endpoint.priceLabel}</span>
            </label>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          {allowedPaths.length === 0 ? labels.scopeAll : labels.scopeSome.replace('{n}', String(allowedPaths.length))}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="mandate-expiry">
          {labels.expiry}
        </label>
        <input
          id="mandate-expiry"
          type="number"
          min="1"
          max="3650"
          className={`${inputClass} font-mono`}
          value={expiryDays}
          onChange={(e) => onExpiryChange(Math.max(1, Number(e.target.value) || 1))}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
