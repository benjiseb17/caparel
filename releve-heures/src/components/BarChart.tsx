type BarChartData = {
  label: string;
  value: number;
};

export default function BarChart({
  data,
  color,
  formatValue,
}: {
  data: BarChartData[];
  color: string;
  formatValue: (value: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex items-end gap-2 sm:gap-3 h-28">
      {data.map((d) => (
        <div
          key={d.label}
          className="flex-1 flex flex-col items-center justify-end gap-1 h-full"
        >
          <span className="text-[10px] text-muted whitespace-nowrap">
            {d.value > 0 ? formatValue(d.value) : ""}
          </span>
          <div
            className="w-full rounded-t-md min-h-1"
            style={{
              height: `${Math.max(4, (d.value / max) * 88)}px`,
              backgroundColor: color,
            }}
          />
          <span className="text-[10px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
