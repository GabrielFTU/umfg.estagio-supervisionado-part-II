import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

interface StateProps { name: string; sigla: string }
type StateFeature = Feature<Geometry, StateProps>;

const GEO_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

function stateColor(value: number, max: number): string {
  if (!value) return '#DBEAFE';
  const t = Math.min(value / max, 1);
  const r = Math.round(219 - t * 189);
  const g = Math.round(234 - t * 170);
  const b = Math.round(254 - t * 79);
  return `rgb(${r},${g},${b})`;
}

interface MemoPathProps {
  feature: StateFeature;
  d: string;
  fill: string;
  value: number;
  onEnter: (name: string, sigla: string, value: number) => void;
  onLeave: () => void;
  onClick?: (sigla: string) => void;
}

const MemoPath = ({ d, fill, feature, value, onEnter, onLeave, onClick }: MemoPathProps) => {
  const handleEnter = useCallback(
    () => onEnter(feature.properties.name, feature.properties.sigla, value),
    [feature.properties.name, feature.properties.sigla, value, onEnter],
  );
  return (
    <path
      d={d}
      fill={fill}
      stroke="#93c5fd"
      strokeWidth={0.6}
      onMouseEnter={handleEnter}
      onMouseLeave={onLeave}
      onClick={() => onClick?.(feature.properties.sigla)}
      style={{ willChange: 'filter' }}
      className={`hover:brightness-[0.88] transition-[filter] duration-75 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    />
  );
};

export interface BrazilMapProps {
  data: Record<string, number>;
  onStateClick?: (sigla: string) => void;
}

interface Hovered { name: string; sigla: string; value: number }

const W = 380;
const H = 220;

export function BrazilMap({ data, onStateClick }: BrazilMapProps) {
  const [features, setFeatures] = useState<StateFeature[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(hovered);
  hoveredRef.current = hovered;

  useEffect(() => {
    fetch(GEO_URL)
      .then<FeatureCollection<Geometry, StateProps>>(r => r.json())
      .then(fc => { setFeatures(fc.features as StateFeature[]); setStatus('ok'); })
      .catch(() => setStatus('error'));
  }, []);

  const maxVal = useMemo(() => Math.max(...Object.values(data), 1), [data]);

  const projection = useMemo(
    () => geoMercator().scale(300).center([-52, -16]).translate([W / 2, H / 2]),
    [],
  );
  const pathGen = useMemo(() => geoPath().projection(projection), [projection]);

  const paths = useMemo(() =>
    features.map(f => ({
      feature: f,
      d: pathGen(f) ?? '',
      sigla: f.properties.sigla,
      value: data[f.properties.sigla] ?? 0,
    })),
    [features, pathGen, data],
  );

  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (tooltipRef.current && hoveredRef.current) {
      tooltipRef.current.style.left = `${e.clientX + 14}px`;
      tooltipRef.current.style.top  = `${e.clientY - 12}px`;
    }
  }, []);

  const handleEnter = useCallback((name: string, sigla: string, value: number) => {
    setHovered({ name, sigla, value });
  }, []);

  const handleLeave = useCallback(() => setHovered(null), []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-44 text-gray-300 text-sm">
        Carregando mapa…
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex items-center justify-center h-44 text-red-300 text-sm">
        Não foi possível carregar o mapa.
      </div>
    );
  }

  return (
    <div className="relative select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        onMouseMove={handleSvgMouseMove}
        onMouseLeave={handleLeave}
      >
        {paths.map(({ feature, d, sigla, value }, i) => (
          <MemoPath
            key={sigla ?? i}
            feature={feature}
            d={d}
            fill={stateColor(value, maxVal)}
            value={value}
            onEnter={handleEnter}
            onLeave={handleLeave}
            onClick={onStateClick}
          />
        ))}
      </svg>

      <div
        ref={tooltipRef}
        className={`
          fixed z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg
          shadow-xl pointer-events-none transition-opacity duration-100
          ${hovered ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {hovered && (
          <>
            <p className="font-semibold">{hovered.name} <span className="text-gray-400">({hovered.sigla})</span></p>
            <p className="text-gray-300 mt-0.5">
              {hovered.value > 0
                ? `${hovered.value.toLocaleString('pt-BR')} pedido${hovered.value !== 1 ? 's' : ''}`
                : 'Sem dados'}
            </p>
            {onStateClick && (
              <p className="text-blue-300 mt-0.5 text-[10px]">Clique para detalhes</p>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 pb-2 mt-1">
        <span className="text-[10px] text-gray-400 whitespace-nowrap">Menos</span>
        <div
          className="flex-1 h-1.5 rounded-full"
          style={{ background: 'linear-gradient(to right, #DBEAFE, #1e40af)' }}
        />
        <span className="text-[10px] text-gray-400 whitespace-nowrap">Mais pedidos</span>
      </div>
    </div>
  );
}
