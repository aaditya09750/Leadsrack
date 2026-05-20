import { Select, type SelectOption } from '../../components/ui/Select';
import { PERIOD_KEYS, PERIOD_LABELS, type PeriodKey } from '../../types/dashboard';
import { usePeriodParam } from './usePeriodParam';

const OPTIONS: SelectOption[] = PERIOD_KEYS.map((key) => ({
  value: key,
  label: PERIOD_LABELS[key],
}));

export const PeriodFilter = () => {
  const [period, setPeriod] = usePeriodParam();
  return (
    <Select
      value={period}
      onChange={(v) => setPeriod(v as PeriodKey)}
      options={OPTIONS}
      size="md"
      aria-label="Dashboard period"
      className="w-full sm:w-[180px]"
    />
  );
};
