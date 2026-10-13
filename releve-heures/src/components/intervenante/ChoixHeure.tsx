const HEURES = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
// Au quart d'heure : les interventions se comptent ainsi.
const MINUTES = ["00", "15", "30", "45"];

export default function ChoixHeure({
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

  return (
    <div className="cp-field">
      <label className="cp-label" htmlFor={`${id}-heures`}>
        {label}
      </label>
      <div className="cp-time">
        <select
          className="cp-select"
          id={`${id}-heures`}
          required
          value={h}
          onChange={(e) => update(e.target.value, m || "00")}
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
        <span className="cp-time__sep">:</span>
        <select
          className="cp-select"
          id={`${id}-minutes`}
          required
          value={m}
          onChange={(e) => update(h || "00", e.target.value)}
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
