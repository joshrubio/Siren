const CENTER = { x: 200, y: 200 };
const SCOPE_RADIUS = 180;
const RINGS = [50, 95, 140, 180];

// Fixed sonar contacts — one per vessel class the classifier knows, placed at a
// bearing (degrees, 0 = up) and range (fraction of scope radius).
const CONTACTS = [
  { label: "Cargo", bearing: 35, range: 0.78, readout: "BRG 035 · RNG 1.2nm" },
  { label: "Tanker", bearing: 150, range: 0.6, readout: "BRG 150 · RNG 0.9nm" },
  { label: "Passenger", bearing: 230, range: 0.9, readout: "BRG 230 · RNG 1.4nm" },
  { label: "Tug", bearing: 300, range: 0.45, readout: "BRG 300 · RNG 0.7nm" },
] as const;

const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

function toXY(bearingDeg: number, radius: number) {
  const rad = ((bearingDeg - 90) * Math.PI) / 180;
  return { x: CENTER.x + radius * Math.cos(rad), y: CENTER.y + radius * Math.sin(rad) };
}

export default function HeroGraph() {
  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className="hidden lg:block absolute inset-y-0 right-0 h-full w-full max-w-[620px] text-primary [mask-image:linear-gradient(to_left,black_45%,transparent_88%)]"
      aria-hidden
    >
      <defs>
        <filter id="siren-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="scope-clip">
          <circle cx={CENTER.x} cy={CENTER.y} r={SCOPE_RADIUS} />
        </clipPath>
      </defs>

      {/* Range rings */}
      {RINGS.map((r) => (
        <circle
          key={r}
          cx={CENTER.x}
          cy={CENTER.y}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={1}
        />
      ))}

      {/* Bearing ticks around the rim */}
      {TICKS.map((deg) => {
        const outer = toXY(deg, SCOPE_RADIUS);
        const inner = toXY(deg, SCOPE_RADIUS - (deg % 90 === 0 ? 12 : 6));
        return (
          <line
            key={deg}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="currentColor"
            strokeOpacity={0.3}
            strokeWidth={1}
          />
        );
      })}

      {/* Crosshair */}
      <line x1={CENTER.x - SCOPE_RADIUS} y1={CENTER.y} x2={CENTER.x + SCOPE_RADIUS} y2={CENTER.y} stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} />
      <line x1={CENTER.x} y1={CENTER.y - SCOPE_RADIUS} x2={CENTER.x} y2={CENTER.y + SCOPE_RADIUS} stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} />

      {/* Rotating sweep wedge, clipped to the scope circle */}
      <g clipPath="url(#scope-clip)">
        <g className="animate-sonar-sweep" style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}>
          <path
            d={`M ${CENTER.x} ${CENTER.y} L ${CENTER.x} ${CENTER.y - SCOPE_RADIUS} A ${SCOPE_RADIUS} ${SCOPE_RADIUS} 0 0 1 ${
              toXY(38, SCOPE_RADIUS).x
            } ${toXY(38, SCOPE_RADIUS).y} Z`}
            fill="currentColor"
            fillOpacity={0.12}
          />
          <line
            x1={CENTER.x}
            y1={CENTER.y}
            x2={CENTER.x}
            y2={CENTER.y - SCOPE_RADIUS}
            stroke="currentColor"
            strokeOpacity={0.8}
            strokeWidth={1.5}
            filter="url(#siren-glow)"
          />
        </g>
      </g>

      {/* Outer scope ring */}
      <circle cx={CENTER.x} cy={CENTER.y} r={SCOPE_RADIUS} fill="none" stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} />

      {/* Contacts: one per vessel class */}
      {CONTACTS.map((c, i) => {
        const pos = toXY(c.bearing, SCOPE_RADIUS * c.range);
        return (
          <g key={c.label}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={14}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              strokeOpacity={0.5}
              className="animate-sonar-ping"
              style={{ transformOrigin: `${pos.x}px ${pos.y}px`, animationDelay: `${i * 0.7}s` }}
            />
            <circle cx={pos.x} cy={pos.y} r={3.5} fill="currentColor" filter="url(#siren-glow)" />
            <text
              x={pos.x}
              y={pos.y - 10}
              textAnchor="middle"
              className="fill-current text-[11px] font-medium font-mono"
              opacity={0.8}
            >
              {c.label}
            </text>
            <text
              x={pos.x}
              y={pos.y + 20}
              textAnchor="middle"
              className="font-mono animate-label-flicker"
              style={{ fontSize: "7px", animationDelay: `${i * 0.6 + 0.2}s` }}
              fill="currentColor"
              fillOpacity={0.55}
            >
              {c.readout}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
