import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ArrowRight, RotateCcw, Scale, ZoomIn, ZoomOut } from 'lucide-react';
import {
  CENTURY_LEGAL_DENSITY,
  CenturyLegalDatum,
  RULER_ARCHIVE,
  RulerArchiveEntry,
} from '../data/historicalArchive';

interface HistoricalErasDensityChartProps {
  onInspectRuler: (entry: RulerArchiveEntry) => void;
  onSelectForComparison: (rulerId: string) => void;
}

interface ZoomPreset {
  id: string;
  label: string;
  domain: [number, number];
}

const FULL_DOMAIN: [number, number] = [-2150, 1900];

const ZOOM_PRESETS: ZoomPreset[] = [
  { id: 'all', label: 'Full Span (2100 BCE – 1850 CE)', domain: FULL_DOMAIN },
  { id: 'ancient', label: 'Ancient Codes (2150 – 100 BCE)', domain: [-2150, -100] },
  { id: 'roman', label: 'Roman & Byzantine (200 BCE – 650 CE)', domain: [-200, 650] },
  { id: 'medieval', label: 'High Medieval (1100 – 1480 CE)', domain: [1100, 1480] },
  { id: 'early-modern', label: 'Early Modern Peak (1450 – 1750 CE)', domain: [1450, 1750] },
  { id: 'abolition', label: 'Abolition Century (1700 – 1900 CE)', domain: [1700, 1900] },
];

function formatHistoricalYear(year: number): string {
  const rounded = Math.round(year);
  if (rounded < 0) return `${Math.abs(rounded)} BCE`;
  if (rounded === 0) return '1 CE';
  return `${rounded} CE`;
}

export function HistoricalErasDensityChart({
  onInspectRuler,
  onSelectForComparison,
}: HistoricalErasDensityChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [selectedCentury, setSelectedCentury] = useState<CenturyLegalDatum>(
    CENTURY_LEGAL_DENSITY[14] // 1532 CE (CCC peak)
  );
  const [activePresetId, setActivePresetId] = useState<string>('all');
  const [zoomState, setZoomState] = useState<{
    k: number;
    domain: [number, number];
  }>({ k: 1, domain: FULL_DOMAIN });

  const linkedRuler = useMemo(() => {
    if (!selectedCentury.relatedRulerId) return undefined;
    return RULER_ARCHIVE.find((r) => r.id === selectedCentury.relatedRulerId);
  }, [selectedCentury]);

  const visibleCenturies = useMemo(() => {
    return CENTURY_LEGAL_DENSITY.filter(
      (d) => d.year >= zoomState.domain[0] - 80 && d.year <= zoomState.domain[1] + 80
    );
  }, [zoomState.domain]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const width = 920;
    const height = 390;
    const margin = { top: 28, right: 56, bottom: 44, left: 56 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    // Gradients & Clip Path
    const defs = svg.append('defs');
    defs
      .append('clipPath')
      .attr('id', 'eras-chart-clip')
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight);

    const densityGrad = defs
      .append('linearGradient')
      .attr('id', 'density-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    densityGrad.append('stop').attr('offset', '0%').attr('stop-color', '#D4B483').attr('stop-opacity', 0.28);
    densityGrad.append('stop').attr('offset', '100%').attr('stop-color', '#D4B483').attr('stop-opacity', 0.02);

    const tortureGrad = defs
      .append('linearGradient')
      .attr('id', 'torture-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    tortureGrad.append('stop').attr('offset', '0%').attr('stop-color', '#EF4444').attr('stop-opacity', 0.34);
    tortureGrad.append('stop').attr('offset', '100%').attr('stop-color', '#991B1B').attr('stop-opacity', 0.03);

    // Base scales
    const xBase = d3.scaleLinear().domain(FULL_DOMAIN).range([0, innerWidth]);
    const yDensity = d3.scaleLinear().domain([0, 18]).range([innerHeight, 0]);
    const yTorture = d3.scaleLinear().domain([0, 10]).range([innerHeight, 0]);

    const chartRoot = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Horizontal Gridlines
    const gridGroup = chartRoot.append('g').attr('class', 'grid-lines');
    gridGroup
      .selectAll('line')
      .data(yTorture.ticks(5))
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yTorture(d))
      .attr('y2', (d) => yTorture(d))
      .attr('stroke', '#1D212B')
      .attr('stroke-dasharray', '3 3');

    // Axes Groups
    const xAxisGroup = chartRoot
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('class', 'x-axis');

    const yLeftGroup = chartRoot.append('g').attr('class', 'y-axis-left');
    const yRightGroup = chartRoot
      .append('g')
      .attr('transform', `translate(${innerWidth},0)`)
      .attr('class', 'y-axis-right');

    // Axis Labels
    chartRoot
      .append('text')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', '#D4B483')
      .attr('font-family', 'IBM Plex Mono, monospace')
      .attr('font-size', '10px')
      .text('LAW CODE DENSITY INDEX');

    chartRoot
      .append('text')
      .attr('x', innerHeight / 2)
      .attr('y', -40)
      .attr('transform', `translate(${innerWidth},0) rotate(90)`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#F87171')
      .attr('font-family', 'IBM Plex Mono, monospace')
      .attr('font-size', '10px')
      .text('TORTURE FREQUENCY (0–10)');

    // Clipped Plot Canvas
    const plotArea = chartRoot
      .append('g')
      .attr('clip-path', 'url(#eras-chart-clip)');

    const densityAreaPath = plotArea
      .append('path')
      .datum(CENTURY_LEGAL_DENSITY)
      .attr('fill', 'url(#density-area-grad)');

    const tortureAreaPath = plotArea
      .append('path')
      .datum(CENTURY_LEGAL_DENSITY)
      .attr('fill', 'url(#torture-area-grad)');

    const densityLinePath = plotArea
      .append('path')
      .datum(CENTURY_LEGAL_DENSITY)
      .attr('fill', 'none')
      .attr('stroke', '#D4B483')
      .attr('stroke-width', 2.2);

    const tortureLinePath = plotArea
      .append('path')
      .datum(CENTURY_LEGAL_DENSITY)
      .attr('fill', 'none')
      .attr('stroke', '#EF4444')
      .attr('stroke-width', 2.4);

    // Vertical Hover/Selected Crosshair
    const crosshairLine = plotArea
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#4B5563')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 3')
      .style('opacity', 0);

    // Interactive Nodes for Torture Frequency & Density
    const densityDots = plotArea
      .selectAll('circle.density-node')
      .data(CENTURY_LEGAL_DENSITY)
      .join('circle')
      .attr('class', 'density-node')
      .attr('r', 4)
      .attr('fill', '#121418')
      .attr('stroke', '#D4B483')
      .attr('stroke-width', 1.8)
      .style('cursor', 'pointer');

    const tortureDots = plotArea
      .selectAll('circle.torture-node')
      .data(CENTURY_LEGAL_DENSITY)
      .join('circle')
      .attr('class', 'torture-node')
      .attr('r', 5)
      .attr('fill', '#EF4444')
      .attr('stroke', '#0A0B0D')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer');

    const renderWithScale = (xCurrent: d3.ScaleLinear<number, number>) => {
      // Update Axes
      const xAxis = d3
        .axisBottom(xCurrent)
        .ticks(7)
        .tickFormat((d) => formatHistoricalYear(Number(d)));

      xAxisGroup.call(xAxis);
      xAxisGroup.selectAll('path, line').attr('stroke', '#2E3442');
      xAxisGroup
        .selectAll('text')
        .attr('fill', '#9CA3AF')
        .attr('font-family', 'IBM Plex Mono, monospace')
        .attr('font-size', '10px');

      const yLeftAxis = d3.axisLeft(yDensity).ticks(5);
      yLeftGroup.call(yLeftAxis);
      yLeftGroup.selectAll('path, line').attr('stroke', '#2E3442');
      yLeftGroup
        .selectAll('text')
        .attr('fill', '#D4B483')
        .attr('font-family', 'IBM Plex Mono, monospace')
        .attr('font-size', '10px');

      const yRightAxis = d3.axisRight(yTorture).ticks(5);
      yRightGroup.call(yRightAxis);
      yRightGroup.selectAll('path, line').attr('stroke', '#2E3442');
      yRightGroup
        .selectAll('text')
        .attr('fill', '#F87171')
        .attr('font-family', 'IBM Plex Mono, monospace')
        .attr('font-size', '10px');

      // Update Paths
      const densityArea = d3
        .area<CenturyLegalDatum>()
        .x((d) => xCurrent(d.year))
        .y0(innerHeight)
        .y1((d) => yDensity(d.lawCodeDensity))
        .curve(d3.curveMonotoneX);

      const densityLine = d3
        .line<CenturyLegalDatum>()
        .x((d) => xCurrent(d.year))
        .y((d) => yDensity(d.lawCodeDensity))
        .curve(d3.curveMonotoneX);

      const tortureArea = d3
        .area<CenturyLegalDatum>()
        .x((d) => xCurrent(d.year))
        .y0(innerHeight)
        .y1((d) => yTorture(d.tortureFrequency))
        .curve(d3.curveMonotoneX);

      const tortureLine = d3
        .line<CenturyLegalDatum>()
        .x((d) => xCurrent(d.year))
        .y((d) => yTorture(d.tortureFrequency))
        .curve(d3.curveMonotoneX);

      densityAreaPath.attr('d', densityArea);
      densityLinePath.attr('d', densityLine);
      tortureAreaPath.attr('d', tortureArea);
      tortureLinePath.attr('d', tortureLine);

      // Update Nodes
      densityDots
        .attr('cx', (d) => xCurrent(d.year))
        .attr('cy', (d) => yDensity(d.lawCodeDensity));

      tortureDots
        .attr('cx', (d) => xCurrent(d.year))
        .attr('cy', (d) => yTorture(d.tortureFrequency));
    };

    renderWithScale(xBase);

    // Click & Hover interactions on nodes
    const handleNodeInspect = (d: CenturyLegalDatum, xPos: number) => {
      setSelectedCentury(d);
      crosshairLine.attr('x1', xPos).attr('x2', xPos).style('opacity', 1);
    };

    tortureDots
      .on('mouseenter', function (_event, d) {
        const cx = Number(d3.select(this).attr('cx'));
        handleNodeInspect(d, cx);
      })
      .on('click', function (_event, d) {
        const cx = Number(d3.select(this).attr('cx'));
        handleNodeInspect(d, cx);
      });

    densityDots
      .on('mouseenter', function (_event, d) {
        const cx = Number(d3.select(this).attr('cx'));
        handleNodeInspect(d, cx);
      })
      .on('click', function (_event, d) {
        const cx = Number(d3.select(this).attr('cx'));
        handleNodeInspect(d, cx);
      });

    // Click anywhere on plot area to snap to nearest century
    const bisectYear = d3.bisector<CenturyLegalDatum, number>((d) => d.year).left;
    let currentXScale = xBase;

    svg.on('click', (event) => {
      const [px] = d3.pointer(event, plotArea.node());
      if (px < 0 || px > innerWidth) return;
      const yearVal = currentXScale.invert(px);
      const idx = bisectYear(CENTURY_LEGAL_DENSITY, yearVal, 1);
      const d0 = CENTURY_LEGAL_DENSITY[idx - 1];
      const d1 = CENTURY_LEGAL_DENSITY[idx];
      const nearest =
        !d1 || (d0 && yearVal - d0.year < d1.year - yearVal) ? d0 : d1;
      if (nearest) {
        handleNodeInspect(nearest, currentXScale(nearest.year));
      }
    });

    // D3 Zoom Behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 14])
      .translateExtent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      .on('zoom', (event) => {
        const nextScale = event.transform.rescaleX(xBase);
        currentXScale = nextScale;
        renderWithScale(nextScale);

        const dom = nextScale.domain() as [number, number];
        setZoomState({
          k: event.transform.k,
          domain: [Math.round(dom[0]), Math.round(dom[1])],
        });

        // Reposition crosshair if active
        crosshairLine.style('opacity', 0);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  const applyDomainPreset = (preset: ZoomPreset) => {
    const svgEl = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svgEl || !zoom) return;

    setActivePresetId(preset.id);

    const width = 920;
    const margin = { left: 56, right: 56 };
    const innerWidth = width - margin.left - margin.right;
    const xBase = d3.scaleLinear().domain(FULL_DOMAIN).range([0, innerWidth]);

    if (preset.id === 'all') {
      d3.select(svgEl).transition().duration(350).call(zoom.transform, d3.zoomIdentity);
      return;
    }

    const x0 = xBase(preset.domain[0]);
    const x1 = xBase(preset.domain[1]);
    const scale = Math.min(14, innerWidth / Math.max(1, x1 - x0));
    const tx = -x0 * scale;
    const transform = d3.zoomIdentity.translate(tx, 0).scale(scale);

    d3.select(svgEl).transition().duration(350).call(zoom.transform, transform);

    // Focus the first century inside the preset
    const matchInWindow = CENTURY_LEGAL_DENSITY.find(
      (d) => d.year >= preset.domain[0] && d.year <= preset.domain[1]
    );
    if (matchInWindow) {
      setSelectedCentury(matchInWindow);
    }
  };

  const handleZoomStep = (factor: number) => {
    const svgEl = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svgEl || !zoom) return;
    setActivePresetId('custom');
    d3.select(svgEl).transition().duration(250).call(zoom.scaleBy, factor);
  };

  return (
    <section id="historical-eras" className="py-16 lg:py-24 border-b border-[#252830] bg-[#0F1115]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* Heading Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#252830]">
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-widest uppercase text-[#F87171] mb-2">
              04 · Historical Eras &amp; Quantitative Trend
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#ECEAE4] tracking-tight text-balance">
              Law Code Density &amp; Torture Frequency Across Centuries
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#A3A7B0]">
              Scroll, drag, or choose a century preset below to zoom into specific historical eras and examine how expanding written legal codification intersected with the rise and eventual abolition of judicial torture.
            </p>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleZoomStep(1.6)}
              aria-label="Zoom in to narrower centuries"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#ECEAE4] bg-[#14171C] border border-[#2A2E37] hover:border-[#6B7280] transition-colors whitespace-nowrap shrink-0"
            >
              <ZoomIn className="w-3.5 h-3.5 text-[#D4B483]" />
              Zoom In
            </button>
            <button
              type="button"
              onClick={() => handleZoomStep(0.65)}
              aria-label="Zoom out to wider span"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#ECEAE4] bg-[#14171C] border border-[#2A2E37] hover:border-[#6B7280] transition-colors whitespace-nowrap shrink-0"
            >
              <ZoomOut className="w-3.5 h-3.5 text-[#D4B483]" />
              Zoom Out
            </button>
            <button
              type="button"
              onClick={() => applyDomainPreset(ZOOM_PRESETS[0])}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#ECEAE4] bg-[#14171C] border border-[#2A2E37] hover:border-[#DC2626] transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#F87171]" />
              Reset
            </button>
          </div>
        </div>

        {/* Century Zoom Preset Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5 p-1.5 bg-[#121418] border border-[#252830]">
          {ZOOM_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyDomainPreset(preset)}
                className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#991B1B] text-[#FBF9F5]'
                    : 'text-[#A3A7B0] hover:text-[#ECEAE4] hover:bg-[#1A1D24]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* D3 Visualization Stage + Century Detail Deck */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: D3 Chart */}
          <div className="lg:col-span-8 bg-[#0B0D11] border border-[#262A32] flex flex-col justify-between">
            <div className="px-5 py-3.5 border-b border-[#252830] flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-5">
                <span className="inline-flex items-center gap-2 text-[#D4B483] font-mono">
                  <span className="w-3 h-0.5 bg-[#D4B483] inline-block" aria-hidden="true" />
                  Law Code Density
                </span>
                <span className="inline-flex items-center gap-2 text-[#F87171] font-mono">
                  <span className="w-3 h-0.5 bg-[#EF4444] inline-block" aria-hidden="true" />
                  Torture Practice Frequency
                </span>
              </div>
              <span className="font-mono text-[#9CA3AF] tabular-nums">
                Window: {formatHistoricalYear(zoomState.domain[0])} – {formatHistoricalYear(zoomState.domain[1])} · {zoomState.k.toFixed(1)}×
              </span>
            </div>

            <div className="p-2 sm:p-4">
              <svg
                ref={svgRef}
                viewBox="0 0 920 390"
                className="w-full h-auto cursor-grab active:cursor-grabbing"
                role="img"
                aria-label="Interactive D3 line and area chart showing law code density and judicial torture frequency from 2100 BCE to 1850 CE"
              />
            </div>

            <div className="px-5 py-3 border-t border-[#252830] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#9CA3AF]">
              <span>
                Scroll or drag inside the chart to zoom/pan across centuries
              </span>
              <span className="tabular-nums">
                {visibleCenturies.length} milestone centuries in current window
              </span>
            </div>
          </div>

          {/* Right: Selected Century Inspection Card */}
          <div className="lg:col-span-4 bg-[#121418] border border-[#262A32] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#D4B483] tabular-nums">
                <span>{selectedCentury.yearLabel}</span>
                <span className="text-[#9CA3AF]">{selectedCentury.eraLabel}</span>
              </div>

              <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#ECEAE4]">
                {selectedCentury.centuryLabel}
              </h3>

              {/* Explicit Metric Readout */}
              <dl className="mt-5 grid grid-cols-2 gap-4 py-4 border-y border-[#252830]">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-[#9CA3AF]">
                    Law Code Density
                  </dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold text-[#D4B483] tabular-nums">
                    {selectedCentury.lawCodeDensity} <span className="text-xs font-mono text-[#9CA3AF]">/ 16</span>
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-[#9CA3AF]">
                    Torture Frequency
                  </dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold text-[#F87171] tabular-nums">
                    {selectedCentury.tortureFrequency} <span className="text-xs font-mono text-[#9CA3AF]">/ 10</span>
                  </dd>
                </div>
              </dl>

              <div className="mt-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                  Institutional Status
                </p>
                <p className="mt-1 text-sm font-medium text-[#FCA5A5]">
                  {selectedCentury.tortureClassification}
                </p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#D1D5DB]">
                {selectedCentury.summary}
              </p>

              <div className="mt-5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-2">
                  Notable Codices &amp; Milestones
                </p>
                <ul className="space-y-1.5 text-xs text-[#ECEAE4]">
                  {selectedCentury.keyCodices.map((codex) => (
                    <li key={codex} className="flex items-start gap-2">
                      <span className="font-mono text-[#D4B483]" aria-hidden="true">—</span>
                      <span>{codex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {linkedRuler && (
              <div className="mt-6 pt-4 border-t border-[#252830] flex flex-wrap items-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => onInspectRuler(linkedRuler)}
                  className="inline-flex items-center gap-1.5 font-medium text-[#F87171] hover:underline underline-offset-4"
                >
                  Open {linkedRuler.ruler} Monograph
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href="#law-consequence"
                  onClick={() => onSelectForComparison(linkedRuler.id)}
                  className="inline-flex items-center gap-1 font-mono text-[#9CA3AF] hover:text-[#ECEAE4]"
                >
                  <Scale className="w-3.5 h-3.5" />
                  Law Table
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
