import { useMemo, useState } from 'react';
import { ArrowRight, Compass, MapPin, RotateCcw, Scale } from 'lucide-react';
import {
  GEO_REGIONS,
  GeoRegionId,
  RulerArchiveEntry,
} from '../data/historicalArchive';

interface InteractiveRegionalMapProps {
  entries: RulerArchiveEntry[];
  selectedRegion: GeoRegionId;
  onSelectRegion: (region: GeoRegionId) => void;
  onInspectRuler: (entry: RulerArchiveEntry) => void;
  onSelectForComparison: (rulerId: string) => void;
}

const REGION_HIT_ZONES: {
  id: Exclude<GeoRegionId, 'all'>;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  labelX: number;
  labelY: number;
  title: string;
}[] = [
  {
    id: 'europe',
    cx: 185,
    cy: 170,
    rx: 68,
    ry: 58,
    labelX: 185,
    labelY: 102,
    title: 'Europe',
  },
  {
    id: 'mediterranean',
    cx: 298,
    cy: 230,
    rx: 46,
    ry: 34,
    labelX: 298,
    labelY: 188,
    title: 'Greece & Byzantium',
  },
  {
    id: 'mesopotamia',
    cx: 388,
    cy: 268,
    rx: 42,
    ry: 32,
    labelX: 388,
    labelY: 312,
    title: 'Mesopotamia',
  },
  {
    id: 'asia',
    cx: 815,
    cy: 232,
    rx: 120,
    ry: 62,
    labelX: 815,
    labelY: 160,
    title: 'East Asia',
  },
];

export function InteractiveRegionalMap({
  entries,
  selectedRegion,
  onSelectRegion,
  onInspectRuler,
  onSelectForComparison,
}: InteractiveRegionalMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<Exclude<GeoRegionId, 'all'> | null>(null);
  const [hoveredRulerId, setHoveredRulerId] = useState<string | null>(null);

  const filteredRulers = useMemo(() => {
    if (selectedRegion === 'all') return entries;
    return entries.filter((entry) => entry.geoRegion === selectedRegion);
  }, [entries, selectedRegion]);

  const activeRegionMeta = useMemo(
    () => GEO_REGIONS.find((r) => r.id === selectedRegion) ?? null,
    [selectedRegion]
  );

  const hoveredRuler = useMemo(
    () => entries.find((e) => e.id === hoveredRulerId) ?? null,
    [entries, hoveredRulerId]
  );

  const handleRegionClick = (regionId: Exclude<GeoRegionId, 'all'>) => {
    onSelectRegion(selectedRegion === regionId ? 'all' : regionId);
  };

  return (
    <section id="regional-map" className="py-16 lg:py-24 border-b border-[#252830] bg-[#0A0B0D]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* Section Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#252830]">
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-widest uppercase text-[#D4B483] mb-2">
              03 · Cartographic Provenance
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#ECEAE4] tracking-tight text-balance">
              Geographical Origins of Sovereign Law Codes
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#A3A7B0]">
              Click any historical region or city marker on the Eurasian map to filter the Ruler Archive by where its legal codices were enacted and enforced.
            </p>
          </div>

          {selectedRegion !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectRegion('all')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#ECEAE4] bg-[#14171C] border border-[#2A2E37] hover:border-[#DC2626] transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#F87171]" />
              Show All Regions ({entries.length})
            </button>
          )}
        </div>

        {/* Accessible Region Filter Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5 p-1.5 bg-[#121418] border border-[#252830]">
          <button
            type="button"
            onClick={() => onSelectRegion('all')}
            className={`px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedRegion === 'all'
                ? 'bg-[#991B1B] text-[#FBF9F5]'
                : 'text-[#A3A7B0] hover:text-[#ECEAE4] hover:bg-[#1A1D24]'
            }`}
          >
            All Regions ({entries.length})
          </button>
          {GEO_REGIONS.map((region) => {
            const count = entries.filter((e) => e.geoRegion === region.id).length;
            const active = selectedRegion === region.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => handleRegionClick(region.id)}
                className={`px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#991B1B] text-[#FBF9F5]'
                    : 'text-[#A3A7B0] hover:text-[#ECEAE4] hover:bg-[#1A1D24]'
                }`}
              >
                {region.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Map + Filtered Regional Dossier Split */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Interactive SVG Map Canvas */}
          <div className="lg:col-span-8 bg-[#0E1014] border border-[#262A32] flex flex-col justify-between">
            <div className="px-4 py-3 border-b border-[#252830] flex items-center justify-between gap-4 text-xs font-mono text-[#9CA3AF]">
              <span className="inline-flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#D4B483]" />
                Eurasian Legal Provenance Projection
              </span>
              <span className="tabular-nums">
                {hoveredRuler
                  ? `${hoveredRuler.mapPoint.city} · ${hoveredRuler.ruler} (${hoveredRuler.yearLabel})`
                  : activeRegionMeta
                    ? `Filtered: ${activeRegionMeta.label}`
                    : 'Click a region zone or city pin'}
              </span>
            </div>

            <div className="relative p-3 sm:p-5 overflow-hidden">
              <svg
                viewBox="0 0 1000 440"
                className="w-full h-auto select-none"
                role="img"
                aria-label="Interactive historical map of Eurasia and Mesopotamia showing legal code origins"
              >
                {/* Ocean / Graticule Grid */}
                <rect x="0" y="0" width="1000" height="440" fill="#0B0D11" />
                {[88, 176, 264, 352].map((y) => (
                  <line
                    key={`lat-${y}`}
                    x1="0"
                    y1={y}
                    x2="1000"
                    y2={y}
                    stroke="#171A21"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}
                {[166, 333, 500, 666, 833].map((x) => (
                  <line
                    key={`lon-${x}`}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="440"
                    stroke="#171A21"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Stylized Eurasian, North African & Japanese Landmasses */}
                {/* British Isles */}
                <path
                  d="M124,108 L142,102 L152,126 L146,144 L126,142 L120,124 Z"
                  fill="#171A22"
                  stroke="#2B303C"
                  strokeWidth="1.2"
                />
                {/* Continental Europe, Anatolia & Eurasia */}
                <path
                  d="M112,212 L120,185 L146,174 L154,152 L182,136 L216,122 L248,96 L286,74 L340,66 L418,60 L530,54 L670,62 L810,74 L895,94 L874,132 L826,150 L842,188 L818,224 L806,258 L774,296 L732,316 L695,304 L662,324 L630,362 L600,356 L580,312 L536,294 L496,314 L462,292 L434,306 L444,344 L408,376 L376,368 L354,316 L342,278 L314,254 L290,264 L270,248 L254,230 L234,238 L224,226 L208,214 L184,218 L158,208 L138,226 L112,226 Z"
                  fill="#171A22"
                  stroke="#2B303C"
                  strokeWidth="1.2"
                />
                {/* North Africa & Levant Rim */}
                <path
                  d="M108,252 L176,246 L236,258 L286,282 L338,284 L368,314 L388,372 L334,404 L208,408 L108,382 Z"
                  fill="#14171D"
                  stroke="#252A34"
                  strokeWidth="1.1"
                />
                {/* Japanese Archipelago */}
                <path
                  d="M890,180 L908,176 L916,204 L910,234 L886,254 L874,244 L892,218 L888,196 Z"
                  fill="#171A22"
                  stroke="#2B303C"
                  strokeWidth="1.2"
                />

                {/* Tigris & Euphrates Rivers (Mesopotamia Visual Anchor) */}
                <path
                  d="M366,222 Q378,250 398,282 M380,218 Q392,248 402,284"
                  fill="none"
                  stroke="#D4B483"
                  strokeOpacity="0.45"
                  strokeWidth="1.2"
                />

                {/* Interactive Regional Highlight Zones */}
                {REGION_HIT_ZONES.map((zone) => {
                  const isSelected = selectedRegion === zone.id;
                  const isHovered = hoveredRegion === zone.id;
                  return (
                    <g
                      key={zone.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Filter archive by ${zone.title}`}
                      aria-pressed={isSelected}
                      className="cursor-pointer focus:outline-none"
                      onClick={() => handleRegionClick(zone.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRegionClick(zone.id);
                        }
                      }}
                      onMouseEnter={() => setHoveredRegion(zone.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    >
                      <ellipse
                        cx={zone.cx}
                        cy={zone.cy}
                        rx={zone.rx}
                        ry={zone.ry}
                        fill={
                          isSelected
                            ? 'rgba(153, 27, 27, 0.28)'
                            : isHovered
                              ? 'rgba(212, 180, 131, 0.14)'
                              : 'rgba(255, 255, 255, 0.02)'
                        }
                        stroke={
                          isSelected
                            ? '#EF4444'
                            : isHovered
                              ? '#D4B483'
                              : '#2E3442'
                        }
                        strokeWidth={isSelected ? 1.8 : 1}
                        strokeDasharray={isSelected ? undefined : '4 3'}
                      />
                      <text
                        x={zone.labelX}
                        y={zone.labelY}
                        textAnchor="middle"
                        className="font-mono text-[10px] uppercase tracking-widest pointer-events-none"
                        fill={isSelected ? '#FCA5A5' : isHovered ? '#ECEAE4' : '#9CA3AF'}
                      >
                        {zone.title}
                      </text>
                    </g>
                  );
                })}

                {/* City Origin Pins for Every Codified Law */}
                {entries.map((entry) => {
                  const isInActiveRegion =
                    selectedRegion === 'all' || entry.geoRegion === selectedRegion;
                  const isHovered = hoveredRulerId === entry.id;
                  return (
                    <g
                      key={`pin-${entry.id}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${entry.mapPoint.city}: ${entry.ruler} (${entry.yearLabel})`}
                      className="cursor-pointer focus:outline-none"
                      onClick={() => {
                        onSelectRegion(entry.geoRegion);
                        onSelectForComparison(entry.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectRegion(entry.geoRegion);
                          onSelectForComparison(entry.id);
                        }
                      }}
                      onMouseEnter={() => setHoveredRulerId(entry.id)}
                      onMouseLeave={() => setHoveredRulerId(null)}
                    >
                      <circle
                        cx={entry.mapPoint.x}
                        cy={entry.mapPoint.y}
                        r={isHovered ? 7 : isInActiveRegion ? 5 : 3.5}
                        fill={isInActiveRegion ? '#DC2626' : '#4B5563'}
                        stroke="#0B0D11"
                        strokeWidth="1.5"
                      />
                      {(isHovered || (selectedRegion !== 'all' && isInActiveRegion)) && (
                        <g transform={`translate(${entry.mapPoint.x}, ${entry.mapPoint.y - 12})`}>
                          <rect
                            x="-48"
                            y="-15"
                            width="96"
                            height="16"
                            fill="#121418"
                            stroke="#374151"
                            strokeWidth="0.8"
                          />
                          <text
                            x="0"
                            y="-4"
                            textAnchor="middle"
                            fill="#ECEAE4"
                            className="font-mono text-[9px] pointer-events-none"
                          >
                            {entry.mapPoint.city}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="px-4 py-3 border-t border-[#252830] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#9CA3AF]">
              <span>
                Showing {filteredRulers.length} of {entries.length} sovereign codices
              </span>
              <span>
                Click any pin to filter its region &amp; load its Law Table
              </span>
            </div>
          </div>

          {/* Right Regional Context & Matching Codices Panel */}
          <div className="lg:col-span-4 bg-[#121418] border border-[#262A32] p-6 flex flex-col justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#D4B483]">
                {activeRegionMeta ? activeRegionMeta.span : 'All Mapped Regions'}
              </p>
              <h3 className="mt-1 font-serif text-2xl font-semibold text-[#ECEAE4]">
                {activeRegionMeta ? activeRegionMeta.label : 'Global Legal Traditions'}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#A3A7B0]">
                {activeRegionMeta
                  ? activeRegionMeta.description
                  : 'Select Mesopotamia, Greece & Byzantium, Western & Central Europe, or East Asia on the map to narrow the Ruler Archive by geographic provenance.'}
              </p>

              <div className="mt-6 pt-5 border-t border-[#252830] space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredRulers.map((entry) => (
                  <div
                    key={`map-list-${entry.id}`}
                    className="p-3.5 bg-[#0E1014] border border-[#252830] hover:border-[#DC2626] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#D4B483] tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#F87171]" />
                        {entry.mapPoint.city}
                      </span>
                      <span className="text-[#9CA3AF]">{entry.yearLabel}</span>
                    </div>
                    <p className="mt-1 font-serif text-lg font-semibold text-[#ECEAE4] leading-snug">
                      {entry.ruler}
                    </p>
                    <p className="text-xs text-[#A3A7B0] truncate">{entry.codeName}</p>
                    <div className="mt-2.5 flex items-center gap-4 text-xs">
                      <button
                        type="button"
                        onClick={() => onInspectRuler(entry)}
                        className="inline-flex items-center gap-1 font-medium text-[#F87171] hover:underline underline-offset-4"
                      >
                        Monograph
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <a
                        href="#law-consequence"
                        onClick={() => onSelectForComparison(entry.id)}
                        className="inline-flex items-center gap-1 font-mono text-[#9CA3AF] hover:text-[#ECEAE4]"
                      >
                        <Scale className="w-3 h-3" />
                        Law Table
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#252830]">
              <a
                href="#archive-catalog"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ECEAE4] hover:text-[#F87171] transition-colors"
              >
                View filtered results in Ruler Catalog
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
