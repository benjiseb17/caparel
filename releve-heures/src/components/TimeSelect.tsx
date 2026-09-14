const HEURES = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export default function TimeSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [h = "", m = ""] = value ? value.split(":") : [];

  function update(nextH: string, nextM: string) {
    onChange(nextH && nextM ? `${nextH}:${nextM}` : "");
  }

  const selectClass =
    "w-1/2 min-w-0 rounded-lg border border-line px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal";

  return (
    <div>
      <label
        htmlFor={`${id}-heures`}
        className="block text-sm font-medium text-ink mb-1"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <select
          id={`${id}-heures`}
          required
          value={h}
          onChange={(e) => update(e.target.value, m || "00")}
          className={selectClass}
        >
          <option value="" disabled>
            HH
          </option>
          {HEURES.map((hh) => (
            <option key={hh} value={hh}>
              {hh}
            </option>
          ))}
        </select>
        <span className="text-muted">:</span>
        <select
          id={`${id}-minutes`}
          required
          value={m}
          onChange={(e) => update(h || "00", e.target.value)}
          className={selectClass}
        >
          <option value="" disabled>
            MM
          </option>
          {MINUTES.map((mm) => (
            <option key={mm} value={mm}>
              {mm}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
