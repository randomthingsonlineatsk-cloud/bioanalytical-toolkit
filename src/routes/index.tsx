import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/')({ component: App })

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function toNum(s: string): number | null {
  const n = parseFloat(s)
  return isFinite(n) ? n : null
}

function fmt(n: number, digits = 4): string {
  if (!isFinite(n)) return '—'
  if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.001 && n !== 0)) return n.toExponential(3)
  const s = n.toFixed(digits)
  return s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}

// Converts a 'var(--color-lab-cyan)' string to its '-soft' translucent variant.
function toSoft(color: string): string {
  return color.replace(/\)$/, '-soft)')
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-mono text-lab-text-muted">{label}</p>
      {children}
    </div>
  )
}

function NumInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      inputMode="decimal"
      className={`bg-lab-panel-strong border-lab-line text-lab-text font-mono ${disabled ? 'opacity-50' : ''}`}
    />
  )
}

function UnitToggle<T extends string>({ options, value, onChange, color }: { options: T[]; value: T; onChange: (v: T) => void; color: string }) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className="text-xs font-mono px-2 py-1 rounded border"
          style={value === o ? { borderColor: color, color } : { borderColor: 'hsl(var(--lab-line))', color: 'hsl(var(--lab-text-muted))' }}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function ResultBox({ children, color, resultKey }: { children: React.ReactNode; color: string; resultKey: string }) {
  return (
    <div
      key={resultKey}
      className="rounded-md border-2 p-3"
      style={{ borderColor: color, backgroundColor: toSoft(color), animation: 'resultPop 0.35s ease-out' }}
    >
      <div className="font-mono text-sm text-lab-text">{children}</div>
    </div>
  )
}

function ExampleButton({ onClick, color }: { onClick: () => void; color: string }) {
  return (
    <Button onClick={onClick} variant="ghost" size="sm" className="font-mono" style={{ color }}>
      Load example
    </Button>
  )
}

// ---------------------------------------------------------------------------
// 1. Dilution calculator (C1V1 = C2V2)
// ---------------------------------------------------------------------------

type DilutionSolve = 'C1' | 'V1' | 'C2' | 'V2'

function BeakerPair({ ratio, color }: { ratio: number; color: string }) {
  const clamped = Math.max(0.05, Math.min(1, ratio))
  return (
    <div className="flex items-center gap-6 py-2">
      <div className="flex flex-col items-center gap-1">
        <svg width="56" height="70" viewBox="0 0 56 70">
          <path d="M12,10 L12,50 Q12,60 22,60 L34,60 Q44,60 44,50 L44,10" fill="none" stroke="hsl(var(--lab-line))" strokeWidth="2" />
          <g style={{ transformOrigin: '28px 60px', animation: 'liquidRise 0.6s ease-out' }}>
            <path d="M14,30 L14,50 Q14,58 22,58 L34,58 Q42,58 42,50 L42,30 Z" fill={color} opacity="0.85" />
          </g>
        </svg>
        <p className="text-[9px] font-mono text-lab-text-muted">stock</p>
      </div>
      <span className="text-lab-text-muted font-mono">→</span>
      <div className="flex flex-col items-center gap-1">
        <svg width="56" height="70" viewBox="0 0 56 70">
          <path d="M12,10 L12,50 Q12,60 22,60 L34,60 Q44,60 44,50 L44,10" fill="none" stroke="hsl(var(--lab-line))" strokeWidth="2" />
          <g style={{ transformOrigin: '28px 60px', animation: 'liquidRise 0.6s ease-out 0.15s backwards' }}>
            <path d="M14,30 L14,50 Q14,58 22,58 L34,58 Q42,58 42,50 L42,30 Z" fill={color} opacity={0.15 + 0.7 * clamped} />
          </g>
        </svg>
        <p className="text-[9px] font-mono text-lab-text-muted">diluted</p>
      </div>
    </div>
  )
}

function DilutionCalculator({ color }: { color: string }) {
  const [solveFor, setSolveFor] = useState<DilutionSolve>('C2')
  const [c1, setC1] = useState('100')
  const [v1, setV1] = useState('10')
  const [c2, setC2] = useState('')
  const [v2, setV2] = useState('100')

  function loadExample() {
    setSolveFor('C2')
    setC1('100')
    setV1('10')
    setC2('')
    setV2('100')
  }

  const result = useMemo(() => {
    const C1 = toNum(c1)
    const V1 = toNum(v1)
    const C2 = toNum(c2)
    const V2 = toNum(v2)
    if (solveFor === 'C1') {
      if (V1 === null || C2 === null || V2 === null || V1 === 0) return null
      return { key: 'C1', value: (C2 * V2) / V1 }
    }
    if (solveFor === 'V1') {
      if (C1 === null || C2 === null || V2 === null || C1 === 0) return null
      return { key: 'V1', value: (C2 * V2) / C1 }
    }
    if (solveFor === 'C2') {
      if (C1 === null || V1 === null || V2 === null || V2 === 0) return null
      return { key: 'C2', value: (C1 * V1) / V2 }
    }
    if (C1 === null || V1 === null || C2 === null || C2 === 0) return null
    return { key: 'V2', value: (C1 * V1) / C2 }
  }, [solveFor, c1, v1, c2, v2])

  const v1Final = solveFor === 'V1' ? result?.value : toNum(v1)
  const v2Final = solveFor === 'V2' ? result?.value : toNum(v2)
  const diluent = v1Final !== null && v1Final !== undefined && v2Final !== null && v2Final !== undefined ? v2Final - v1Final : null
  const ratio = v1Final && v2Final ? v1Final / v2Final : 0.3

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-lab-text-muted">C1·V1 = C2·V2 — e.g. diluting a 100 mg/mL stock: take 10 mL, bring to 100 mL total → 10 mg/mL final. Pick which value to solve for.</p>
        <ExampleButton onClick={loadExample} color={color} />
      </div>
      <BeakerPair ratio={ratio} color={color} />
      <div className="flex flex-wrap gap-2">
        {(['C1', 'V1', 'C2', 'V2'] as DilutionSolve[]).map((k) => (
          <Button key={k} onClick={() => setSolveFor(k)} variant="outline" size="sm" className="border-2 font-mono" style={solveFor === k ? { borderColor: color, color } : { borderColor: 'hsl(var(--lab-line))', color: 'hsl(var(--lab-text-muted))' }}>
            Solve for {k}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="C1 — stock concentration"><NumInput value={c1} onChange={setC1} disabled={solveFor === 'C1'} /></Field>
        <Field label="V1 — volume of stock"><NumInput value={v1} onChange={setV1} disabled={solveFor === 'V1'} /></Field>
        <Field label="C2 — final concentration"><NumInput value={c2} onChange={setC2} disabled={solveFor === 'C2'} /></Field>
        <Field label="V2 — final volume"><NumInput value={v2} onChange={setV2} disabled={solveFor === 'V2'} /></Field>
      </div>
      {result !== null ? (
        <ResultBox color={color} resultKey={`${result.key}-${result.value}`}>
          {result.key} = {fmt(result.value)}
          {diluent !== null && diluent !== undefined && diluent >= 0 && (
            <span className="block text-lab-text-muted mt-1">Add {fmt(diluent)} of diluent to {fmt(v1Final ?? 0)} of stock to reach {fmt(v2Final ?? 0)} total.</span>
          )}
        </ResultBox>
      ) : (
        <p className="text-xs text-lab-text-muted font-mono">Fill in the other three fields.</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2. Molarity / mass calculator
// ---------------------------------------------------------------------------

type MolaritySolve = 'mass' | 'mw' | 'volume' | 'conc'

function Flask({ intensity, color }: { intensity: number; color: string }) {
  const clamped = Math.max(0.1, Math.min(1, intensity))
  return (
    <svg width="60" height="80" viewBox="0 0 60 80">
      <path d="M24,8 L24,26 L10,60 Q6,68 16,68 L44,68 Q54,68 50,60 L36,26 L36,8" fill="none" stroke="hsl(var(--lab-line))" strokeWidth="2" />
      <line x1="20" y1="8" x2="40" y2="8" stroke="hsl(var(--lab-line))" strokeWidth="2" />
      <g style={{ transformOrigin: '30px 66px', animation: 'liquidRise 0.6s ease-out' }}>
        <path d="M14,44 L46,44 L50,60 Q54,68 44,68 L16,68 Q6,68 10,60 Z" fill={color} opacity={clamped} />
      </g>
    </svg>
  )
}

function MolarityCalculator({ color }: { color: string }) {
  const [solveFor, setSolveFor] = useState<MolaritySolve>('mass')
  const [mass, setMass] = useState('')
  const [massUnit, setMassUnit] = useState<'mg' | 'g'>('mg')
  const [mw, setMw] = useState('180.16')
  const [volume, setVolume] = useState('100')
  const [conc, setConc] = useState('10')
  const [concUnit, setConcUnit] = useState<'mM' | 'M'>('mM')

  function loadExample() {
    setSolveFor('mass')
    setMw('180.16')
    setVolume('100')
    setConc('10')
    setConcUnit('mM')
    setMassUnit('mg')
  }

  const result = useMemo(() => {
    const massG = massUnit === 'mg' ? (toNum(mass) ?? 0) / 1000 : toNum(mass)
    const MW = toNum(mw)
    const volL = (toNum(volume) ?? 0) / 1000
    const concM = concUnit === 'mM' ? (toNum(conc) ?? 0) / 1000 : toNum(conc)

    if (solveFor === 'mass') {
      if (MW === null || toNum(volume) === null || toNum(conc) === null) return null
      const g = concM! * volL * MW
      return massUnit === 'mg' ? g * 1000 : g
    }
    if (solveFor === 'mw') {
      if (massG === null || toNum(volume) === null || toNum(conc) === null || concM === 0) return null
      return massG / (concM! * volL)
    }
    if (solveFor === 'volume') {
      if (massG === null || MW === null || toNum(conc) === null || concM === 0) return null
      const L = massG / (concM! * MW)
      return L * 1000
    }
    if (massG === null || MW === null || toNum(volume) === null || volL === 0) return null
    const M = massG / (MW * volL)
    return concUnit === 'mM' ? M * 1000 : M
  }, [solveFor, mass, massUnit, mw, volume, conc, concUnit])

  const concForFlask = concUnit === 'mM' ? (toNum(conc) ?? 0) / 20 : (toNum(conc) ?? 0) * 2

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-lab-text-muted">mass = concentration × volume × MW — e.g. glucose (MW 180.16) to make 100 mL of 10 mM solution needs ~180 mg.</p>
        <ExampleButton onClick={loadExample} color={color} />
      </div>
      <Flask intensity={concForFlask} color={color} />
      <div className="flex flex-wrap gap-2">
        {([
          ['mass', 'Mass'],
          ['mw', 'MW'],
          ['volume', 'Volume'],
          ['conc', 'Concentration'],
        ] as [MolaritySolve, string][]).map(([k, label]) => (
          <Button key={k} onClick={() => setSolveFor(k)} variant="outline" size="sm" className="border-2 font-mono" style={solveFor === k ? { borderColor: color, color } : { borderColor: 'hsl(var(--lab-line))', color: 'hsl(var(--lab-text-muted))' }}>
            Solve for {label}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mass">
          <div className="flex gap-2">
            <NumInput value={mass} onChange={setMass} disabled={solveFor === 'mass'} />
            <UnitToggle options={['mg', 'g']} value={massUnit} onChange={setMassUnit} color={color} />
          </div>
        </Field>
        <Field label="Molecular weight (g/mol)"><NumInput value={mw} onChange={setMw} disabled={solveFor === 'mw'} /></Field>
        <Field label="Volume (mL)"><NumInput value={volume} onChange={setVolume} disabled={solveFor === 'volume'} /></Field>
        <Field label="Concentration">
          <div className="flex gap-2">
            <NumInput value={conc} onChange={setConc} disabled={solveFor === 'conc'} />
            <UnitToggle options={['mM', 'M']} value={concUnit} onChange={setConcUnit} color={color} />
          </div>
        </Field>
      </div>
      {result !== null ? (
        <ResultBox color={color} resultKey={`${solveFor}-${result}`}>
          {solveFor === 'mass' && `Mass = ${fmt(result)} ${massUnit}`}
          {solveFor === 'mw' && `MW = ${fmt(result)} g/mol`}
          {solveFor === 'volume' && `Volume = ${fmt(result)} mL`}
          {solveFor === 'conc' && `Concentration = ${fmt(result)} ${concUnit}`}
        </ResultBox>
      ) : (
        <p className="text-xs text-lab-text-muted font-mono">Fill in the other three fields.</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3. Serial dilution simulator
// ---------------------------------------------------------------------------

function SerialDilutionSimulator({ color }: { color: string }) {
  const [startConc, setStartConc] = useState('2000')
  const [unitLabel, setUnitLabel] = useState('ng/mL')
  const [factor, setFactor] = useState('2')
  const [steps, setSteps] = useState('7')
  const [transferVol, setTransferVol] = useState('100')
  const [totalVol, setTotalVol] = useState('200')

  function loadExample() {
    setStartConc('2000')
    setUnitLabel('ng/mL')
    setFactor('2')
    setSteps('7')
    setTransferVol('100')
    setTotalVol('200')
  }

  const series = useMemo(() => {
    const c0 = toNum(startConc)
    const f = toNum(factor)
    const n = Math.max(0, Math.min(20, Math.floor(toNum(steps) ?? 0)))
    if (c0 === null || f === null || f <= 0 || n <= 0) return []
    const arr: number[] = [c0]
    for (let i = 1; i <= n; i++) arr.push(arr[i - 1] / f)
    return arr
  }, [startConc, factor, steps])

  const transfer = toNum(transferVol) ?? 0
  const total = toNum(totalVol) ?? 0
  const diluent = total - transfer

  const logVals = series.filter((v) => v > 0).map((v) => Math.log10(v))
  const logMax = logVals.length ? Math.max(...logVals) : 1
  const logMin = logVals.length ? Math.min(...logVals) : 0

  const W = 600
  const H = 220
  const padL = 56
  const padR = 16
  const padT = 12
  const padB = 32
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const x = (i: number) => padL + (series.length <= 1 ? plotW / 2 : (i / (series.length - 1)) * plotW)
  const y = (v: number) => {
    if (v <= 0) return padT + plotH
    const lv = Math.log10(v)
    return padT + (1 - (lv - logMin) / (logMax - logMin || 1)) * plotH
  }
  const linePath = series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-lab-text-muted">Simulate a serial dilution series and see the tube-by-tube concentrations and volumes.</p>
        <ExampleButton onClick={loadExample} color={color} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Starting concentration">
          <div className="flex gap-2">
            <NumInput value={startConc} onChange={setStartConc} />
            <Input value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} className="w-20 bg-lab-panel-strong border-lab-line text-lab-text font-mono" />
          </div>
        </Field>
        <Field label="Dilution factor (e.g. 2 = two-fold)"><NumInput value={factor} onChange={setFactor} /></Field>
        <Field label="Number of dilution steps"><NumInput value={steps} onChange={setSteps} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Transfer vol (µL)"><NumInput value={transferVol} onChange={setTransferVol} /></Field>
          <Field label="Total vol/tube (µL)"><NumInput value={totalVol} onChange={setTotalVol} /></Field>
        </div>
      </div>

      {series.length > 0 && (
        <>
          <div className="flex gap-2 overflow-x-auto py-2" key={series.join(',')}>
            {series.map((v, i) => {
              const lv = Math.log10(Math.max(v, 1e-9))
              const t = (lv - logMin) / (logMax - logMin || 1)
              return (
                <svg key={i} width="34" height="52" viewBox="0 0 34 52" style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.06}s backwards` }}>
                  <path d="M6,4 L6,36 Q6,44 14,44 L20,44 Q28,44 28,36 L28,4" fill="none" stroke="hsl(var(--lab-line))" strokeWidth="1.5" />
                  <path d="M7,20 L27,20 L27,36 Q27,42 20,42 L14,42 Q7,42 7,36 Z" fill={color} opacity={0.15 + 0.75 * t} />
                  <text x="17" y="50" textAnchor="middle" fontSize="7" className="font-mono" fill="hsl(var(--lab-text-muted))">{i + 1}</text>
                </svg>
              )
            })}
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Serial dilution series" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <line key={f} x1={padL} x2={W - padR} y1={padT + plotH * f} y2={padT + plotH * f} stroke="var(--color-lab-grid)" strokeWidth={1} />
            ))}
            <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke="var(--color-lab-line)" strokeWidth={1.5} />
            <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke="var(--color-lab-line)" strokeWidth={1.5} />
            <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} />
            {series.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r={4.5} fill={color} />
            ))}
            <text x={(padL + W - padR) / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="var(--color-lab-text-muted)" className="font-mono">tube number</text>
            <text x={14} y={padT + plotH / 2} textAnchor="middle" fontSize={11} fill="var(--color-lab-text-muted)" className="font-mono" transform={`rotate(-90 14 ${padT + plotH / 2})`}>conc (log scale)</text>
          </svg>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-lab-text-muted text-left">
                  <th className="pr-3 py-1">Tube</th>
                  <th className="pr-3 py-1">Concentration</th>
                  <th className="pr-3 py-1">Transfer from prev.</th>
                  <th className="pr-3 py-1">Diluent added</th>
                </tr>
              </thead>
              <tbody>
                {series.map((v, i) => (
                  <tr key={i} className="border-t border-lab-line">
                    <td className="pr-3 py-1 text-lab-text font-bold">{i + 1}</td>
                    <td className="pr-3 py-1 text-lab-text">{fmt(v)} {unitLabel}</td>
                    <td className="pr-3 py-1 text-lab-text-muted">{i === 0 ? '—' : `${fmt(transfer)} µL`}</td>
                    <td className="pr-3 py-1 text-lab-text-muted">{i === 0 ? '—' : `${fmt(diluent)} µL`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 4. LOD / LOQ calculator
// ---------------------------------------------------------------------------

function LodLoqCalculator({ color }: { color: string }) {
  const [mode, setMode] = useState<'blanks' | 'calibration'>('blanks')
  const [blanksText, setBlanksText] = useState('0.081, 0.076, 0.089, 0.083, 0.079, 0.085')
  const [slope, setSlope] = useState('0.0042')
  const [sd, setSd] = useState('0.015')

  function loadExample() {
    setMode('blanks')
    setBlanksText('0.081, 0.076, 0.089, 0.083, 0.079, 0.085')
  }

  const blankStats = useMemo(() => {
    const vals = blanksText
      .split(/[,\s]+/)
      .map((s) => parseFloat(s))
      .filter((n) => isFinite(n))
    if (vals.length < 2) return null
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length
    const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / (vals.length - 1)
    const sdVal = Math.sqrt(variance)
    return { n: vals.length, vals, mean, sd: sdVal, lod: mean + 3 * sdVal, loq: mean + 10 * sdVal }
  }, [blanksText])

  const calibResult = useMemo(() => {
    const s = toNum(slope)
    const d = toNum(sd)
    if (s === null || d === null || s === 0) return null
    return { lod: (3.3 * d) / s, loq: (10 * d) / s }
  }, [slope, sd])

  const W = 560
  const H = 90
  const padL = 20
  const padR = 20
  const plotW = W - padL - padR

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-lab-text-muted">Estimate LOD/LOQ from replicate blanks or from a calibration curve's slope and residual SD.</p>
        <ExampleButton onClick={loadExample} color={color} />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setMode('blanks')} variant="outline" size="sm" className="border-2 font-mono" style={mode === 'blanks' ? { borderColor: color, color } : { borderColor: 'hsl(var(--lab-line))', color: 'hsl(var(--lab-text-muted))' }}>From blank replicates</Button>
        <Button onClick={() => setMode('calibration')} variant="outline" size="sm" className="border-2 font-mono" style={mode === 'calibration' ? { borderColor: color, color } : { borderColor: 'hsl(var(--lab-line))', color: 'hsl(var(--lab-text-muted))' }}>From calibration curve</Button>
      </div>

      {mode === 'blanks' ? (
        <div className="space-y-3">
          <Field label="Blank replicate signals (comma or space separated)">
            <textarea
              value={blanksText}
              onChange={(e) => setBlanksText(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-lab-line bg-lab-panel-strong text-lab-text font-mono text-sm p-2"
            />
          </Field>
          {blankStats ? (
            <>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                {(() => {
                  const lo = blankStats.mean - 12 * blankStats.sd
                  const hi = blankStats.mean + 12 * blankStats.sd
                  const px = (v: number) => padL + ((v - lo) / (hi - lo || 1)) * plotW
                  return (
                    <>
                      <rect x={px(blankStats.mean - 3 * blankStats.sd)} y={20} width={px(blankStats.mean + 3 * blankStats.sd) - px(blankStats.mean - 3 * blankStats.sd)} height={30} fill="var(--color-lab-amber-soft)" />
                      <rect x={px(blankStats.mean - 10 * blankStats.sd)} y={20} width={px(blankStats.mean + 10 * blankStats.sd) - px(blankStats.mean - 10 * blankStats.sd)} height={30} fill="var(--color-lab-red-soft)" style={{ mixBlendMode: 'multiply' }} />
                      <line x1={padL} x2={W - padR} y1={50} y2={50} stroke="hsl(var(--lab-line))" strokeWidth={1.5} />
                      <line x1={px(blankStats.mean)} x2={px(blankStats.mean)} y1={20} y2={50} stroke={color} strokeWidth={2} />
                      <line x1={px(blankStats.lod)} x2={px(blankStats.lod)} y1={20} y2={50} stroke="var(--color-lab-amber)" strokeWidth={2} strokeDasharray="4 3" />
                      <line x1={px(blankStats.loq)} x2={px(blankStats.loq)} y1={20} y2={50} stroke="var(--color-lab-red)" strokeWidth={2} strokeDasharray="4 3" />
                      {blankStats.vals.map((v, i) => (
                        <circle key={i} cx={px(v)} cy={65} r={3} fill={color} />
                      ))}
                      <text x={px(blankStats.mean)} y={14} textAnchor="middle" fontSize={9} fill="var(--color-lab-text-muted)" className="font-mono">mean</text>
                      <text x={px(blankStats.lod)} y={80} textAnchor="middle" fontSize={9} fill="var(--color-lab-amber)" className="font-mono">LOD</text>
                      <text x={px(blankStats.loq)} y={80} textAnchor="middle" fontSize={9} fill="var(--color-lab-red)" className="font-mono">LOQ</text>
                    </>
                  )
                })()}
              </svg>
              <ResultBox color={color} resultKey={`${blankStats.mean}-${blankStats.sd}`}>
                n={blankStats.n}, mean={fmt(blankStats.mean)}, SD={fmt(blankStats.sd)}
                <span className="block mt-1">LOD (mean + 3·SD) = {fmt(blankStats.lod)}</span>
                <span className="block">LOQ (mean + 10·SD) = {fmt(blankStats.loq)}</span>
              </ResultBox>
            </>
          ) : (
            <p className="text-xs text-lab-text-muted font-mono">Enter at least 2 blank replicate values.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Calibration curve slope"><NumInput value={slope} onChange={setSlope} /></Field>
            <Field label="SD of response (residual or intercept SD)"><NumInput value={sd} onChange={setSd} /></Field>
          </div>
          {calibResult ? (
            <ResultBox color={color} resultKey={`${calibResult.lod}-${calibResult.loq}`}>
              LOD (3.3·SD / slope) = {fmt(calibResult.lod)}
              <span className="block">LOQ (10·SD / slope) = {fmt(calibResult.loq)}</span>
            </ResultBox>
          ) : (
            <p className="text-xs text-lab-text-muted font-mono">Enter a non-zero slope and SD.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 5. Regression / standard curve calculator
// ---------------------------------------------------------------------------

interface XYRow {
  x: string
  y: string
}

const REGRESSION_EXAMPLE: XYRow[] = [
  { x: '10', y: '0.12' },
  { x: '25', y: '0.28' },
  { x: '50', y: '0.55' },
  { x: '100', y: '1.05' },
  { x: '200', y: '2.10' },
]

function RegressionCalculator({ color }: { color: string }) {
  const [rows, setRows] = useState<XYRow[]>(REGRESSION_EXAMPLE)
  const [backY, setBackY] = useState('')

  function updateRow(i: number, field: 'x' | 'y', val: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)))
  }
  function addRow() {
    setRows((prev) => [...prev, { x: '', y: '' }])
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }
  function loadExample() {
    setRows(REGRESSION_EXAMPLE)
    setBackY('0.75')
  }

  const points = useMemo(() => {
    return rows.map((r) => ({ x: toNum(r.x), y: toNum(r.y) })).filter((p): p is { x: number; y: number } => p.x !== null && p.y !== null)
  }, [rows])

  const fit = useMemo(() => {
    if (points.length < 2) return null
    const n = points.length
    const sumX = points.reduce((s, p) => s + p.x, 0)
    const sumY = points.reduce((s, p) => s + p.y, 0)
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
    const sumXX = points.reduce((s, p) => s + p.x * p.x, 0)
    const denom = n * sumXX - sumX * sumX
    if (denom === 0) return null
    const slope = (n * sumXY - sumX * sumY) / denom
    const intercept = (sumY - slope * sumX) / n
    const yMean = sumY / n
    let ssRes = 0
    let ssTot = 0
    for (const p of points) {
      const pred = slope * p.x + intercept
      ssRes += (p.y - pred) ** 2
      ssTot += (p.y - yMean) ** 2
    }
    const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot
    return { slope, intercept, r2 }
  }, [points])

  const backX = useMemo(() => {
    const y = toNum(backY)
    if (!fit || y === null || fit.slope === 0) return null
    return (y - fit.intercept) / fit.slope
  }, [backY, fit])

  const W = 480
  const H = 260
  const padL = 50
  const padR = 16
  const padT = 12
  const padB = 32
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const xMin = xs.length ? Math.min(...xs) : 0
  const xMax = xs.length ? Math.max(...xs) : 1
  const yMin = ys.length ? Math.min(0, ...ys) : 0
  const yMax = ys.length ? Math.max(...ys) : 1
  const px = (v: number) => padL + ((v - xMin) / (xMax - xMin || 1)) * plotW
  const py = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin || 1)) * plotH

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-lab-text-muted">Paired concentration/response data → linear regression → back-calculate an unknown from a measured response.</p>
        <ExampleButton onClick={loadExample} color={color} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-lab-text-muted text-left">
              <th className="pr-2 py-1">x (concentration)</th>
              <th className="pr-2 py-1">y (response)</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="pr-2 py-1"><NumInput value={r.x} onChange={(v) => updateRow(i, 'x', v)} /></td>
                <td className="pr-2 py-1"><NumInput value={r.y} onChange={(v) => updateRow(i, 'y', v)} /></td>
                <td className="pr-2 py-1">
                  <Button onClick={() => removeRow(i)} variant="ghost" size="sm" className="text-lab-red font-mono">✕</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button onClick={addRow} variant="outline" size="sm" className="border-2 border-lab-line font-mono">+ Add row</Button>

      {fit && (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-md" role="img" aria-label="Regression fit" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <line key={f} x1={padL} x2={W - padR} y1={padT + plotH * f} y2={padT + plotH * f} stroke="var(--color-lab-grid)" strokeWidth={1} />
            ))}
            <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke="var(--color-lab-line)" strokeWidth={1.5} />
            <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke="var(--color-lab-line)" strokeWidth={1.5} />
            <line
              x1={px(xMin)} y1={py(fit.slope * xMin + fit.intercept)}
              x2={px(xMax)} y2={py(fit.slope * xMax + fit.intercept)}
              stroke={color} strokeWidth={2.5}
            />
            {points.map((p, i) => (
              <circle key={i} cx={px(p.x)} cy={py(p.y)} r={4.5} fill={color} stroke="var(--color-lab-bg)" strokeWidth={1} />
            ))}
            <text x={(padL + W - padR) / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="var(--color-lab-text-muted)" className="font-mono">x</text>
            <text x={12} y={padT + plotH / 2} textAnchor="middle" fontSize={11} fill="var(--color-lab-text-muted)" className="font-mono" transform={`rotate(-90 12 ${padT + plotH / 2})`}>y</text>
          </svg>

          <ResultBox color={color} resultKey={`${fit.slope}-${fit.intercept}`}>
            y = {fmt(fit.slope)}x + {fmt(fit.intercept)} &nbsp; R² = {fit.r2.toFixed(4)}
          </ResultBox>

          <Field label="Back-calculate x from a measured y">
            <NumInput value={backY} onChange={setBackY} placeholder="measured response" />
          </Field>
          {backX !== null && <ResultBox color={color} resultKey={`bx-${backX}`}>x = {fmt(backX)}</ResultBox>}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 6. Precision & accuracy calculator
// ---------------------------------------------------------------------------

function PrecisionAccuracyCalculator({ color }: { color: string }) {
  const [valuesText, setValuesText] = useState('98.2, 101.5, 99.8, 100.9, 97.6')
  const [trueValue, setTrueValue] = useState('100')

  function loadExample() {
    setValuesText('98.2, 101.5, 99.8, 100.9, 97.6')
    setTrueValue('100')
  }

  const stats = useMemo(() => {
    const vals = valuesText.split(/[,\s]+/).map((s) => parseFloat(s)).filter((n) => isFinite(n))
    if (vals.length < 2) return null
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length
    const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / (vals.length - 1)
    const sd = Math.sqrt(variance)
    const rsd = (sd / mean) * 100
    const t = toNum(trueValue)
    const bias = t !== null && t !== 0 ? ((mean - t) / t) * 100 : null
    const recovery = t !== null && t !== 0 ? (mean / t) * 100 : null
    return { n: vals.length, vals, mean, sd, rsd, bias, recovery }
  }, [valuesText, trueValue])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-lab-text-muted">Precision (%RSD) from replicate measurements, and accuracy (%bias) against a known/target value.</p>
        <ExampleButton onClick={loadExample} color={color} />
      </div>
      <Field label="Replicate measurements (comma or space separated)">
        <textarea value={valuesText} onChange={(e) => setValuesText(e.target.value)} rows={2} className="w-full rounded-md border border-lab-line bg-lab-panel-strong text-lab-text font-mono text-sm p-2" />
      </Field>
      <Field label="True / target value (optional, for accuracy)"><NumInput value={trueValue} onChange={setTrueValue} /></Field>

      {stats ? (
        <ResultBox color={color} resultKey={`${stats.mean}-${stats.sd}`}>
          n={stats.n}, mean={fmt(stats.mean)}, SD={fmt(stats.sd)}
          <span className={`block mt-1 ${stats.rsd <= 15 ? 'text-lab-emerald' : stats.rsd <= 20 ? 'text-lab-amber' : 'text-lab-red'}`}>%RSD (precision) = {stats.rsd.toFixed(2)}%</span>
          {stats.bias !== null && (
            <span className={`block ${Math.abs(stats.bias) <= 15 ? 'text-lab-emerald' : Math.abs(stats.bias) <= 20 ? 'text-lab-amber' : 'text-lab-red'}`}>%Bias (accuracy) = {stats.bias.toFixed(2)}% &nbsp; ({stats.recovery!.toFixed(1)}% of target)</span>
          )}
          <span className="block text-lab-text-muted mt-1 text-xs">Common bioanalytical guideline: %RSD ≤15% and bias within ±15% (≤20% at the lower limit of quantitation).</span>
        </ResultBox>
      ) : (
        <p className="text-xs text-lab-text-muted font-mono">Enter at least 2 replicate values.</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 7. Recovery calculator
// ---------------------------------------------------------------------------

function RecoveryCalculator({ color }: { color: string }) {
  const [mode, setMode] = useState<'simple' | 'extraction'>('simple')
  const [measured, setMeasured] = useState('92')
  const [nominal, setNominal] = useState('100')
  const [extractedResp, setExtractedResp] = useState('8500')
  const [unextractedResp, setUnextractedResp] = useState('9800')

  function loadExample() {
    setMode('simple')
    setMeasured('92')
    setNominal('100')
  }

  const simpleRecovery = useMemo(() => {
    const m = toNum(measured)
    const n = toNum(nominal)
    if (m === null || n === null || n === 0) return null
    return (m / n) * 100
  }, [measured, nominal])

  const extractionRecovery = useMemo(() => {
    const e = toNum(extractedResp)
    const u = toNum(unextractedResp)
    if (e === null || u === null || u === 0) return null
    return (e / u) * 100
  }, [extractedResp, unextractedResp])

  const value = mode === 'simple' ? simpleRecovery : extractionRecovery
  const recColor = value === null ? 'text-lab-text-muted' : value >= 85 && value <= 115 ? 'text-lab-emerald' : value >= 70 && value <= 130 ? 'text-lab-amber' : 'text-lab-red'

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-lab-text-muted">%Recovery for a measured-vs-nominal check, or for extraction efficiency comparing extracted vs unextracted response.</p>
        <ExampleButton onClick={loadExample} color={color} />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setMode('simple')} variant="outline" size="sm" className="border-2 font-mono" style={mode === 'simple' ? { borderColor: color, color } : { borderColor: 'hsl(var(--lab-line))', color: 'hsl(var(--lab-text-muted))' }}>Measured vs nominal</Button>
        <Button onClick={() => setMode('extraction')} variant="outline" size="sm" className="border-2 font-mono" style={mode === 'extraction' ? { borderColor: color, color } : { borderColor: 'hsl(var(--lab-line))', color: 'hsl(var(--lab-text-muted))' }}>Extraction efficiency</Button>
      </div>

      {mode === 'simple' ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Measured value"><NumInput value={measured} onChange={setMeasured} /></Field>
          <Field label="Nominal / expected value"><NumInput value={nominal} onChange={setNominal} /></Field>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Response — extracted spiked sample"><NumInput value={extractedResp} onChange={setExtractedResp} /></Field>
          <Field label="Response — unextracted standard (same conc.)"><NumInput value={unextractedResp} onChange={setUnextractedResp} /></Field>
        </div>
      )}

      {value !== null ? (
        <ResultBox color={color} resultKey={`${mode}-${value}`}>
          <span className={recColor}>%Recovery = {value.toFixed(1)}%</span>
          <span className="block text-lab-text-muted mt-1 text-xs">Typical acceptance: 85–115% (tighter methods) or 70–130% (wider, e.g. LC-MS/MS extraction recovery, if consistent and precise).</span>
        </ResultBox>
      ) : (
        <p className="text-xs text-lab-text-muted font-mono">Fill in both fields.</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 8. QC chart (Levey-Jennings)
// ---------------------------------------------------------------------------

function QCChart({ color }: { color: string }) {
  const [valuesText, setValuesText] = useState('101, 99, 103, 98, 102, 104, 97, 100, 106, 96')
  const [useHistorical, setUseHistorical] = useState(false)
  const [histMean, setHistMean] = useState('100')
  const [histSd, setHistSd] = useState('3')

  function loadExample() {
    setValuesText('101, 99, 103, 98, 102, 104, 97, 100, 106, 96')
    setUseHistorical(false)
  }

  const data = useMemo(() => {
    const vals = valuesText.split(/[,\s]+/).map((s) => parseFloat(s)).filter((n) => isFinite(n))
    if (vals.length < 2) return null
    let mean: number
    let sd: number
    if (useHistorical) {
      const hm = toNum(histMean)
      const hs = toNum(histSd)
      if (hm === null || hs === null) return null
      mean = hm
      sd = hs
    } else {
      mean = vals.reduce((s, v) => s + v, 0) / vals.length
      const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / (vals.length - 1)
      sd = Math.sqrt(variance)
    }
    const violations: string[] = []
    vals.forEach((v, i) => {
      if (Math.abs(v - mean) > 3 * sd) violations.push(`Run ${i + 1}: beyond ±3SD (1₃s — reject run)`)
    })
    for (let i = 0; i < vals.length - 1; i++) {
      const z1 = (vals[i] - mean) / sd
      const z2 = (vals[i + 1] - mean) / sd
      if (Math.abs(z1) > 2 && Math.abs(z2) > 2 && Math.sign(z1) === Math.sign(z2)) {
        violations.push(`Runs ${i + 1}–${i + 2}: two consecutive beyond ±2SD, same side (2₂s — investigate)`)
      }
    }
    return { vals, mean, sd, violations }
  }, [valuesText, useHistorical, histMean, histSd])

  const W = 600
  const H = 260
  const padL = 46
  const padR = 16
  const padT = 12
  const padB = 32
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-lab-text-muted">A Levey-Jennings control chart: plot QC values against the mean and ±SD bands, and flag simple Westgard-style violations.</p>
        <ExampleButton onClick={loadExample} color={color} />
      </div>
      <Field label="QC values across runs, in order (comma or space separated)">
        <textarea value={valuesText} onChange={(e) => setValuesText(e.target.value)} rows={2} className="w-full rounded-md border border-lab-line bg-lab-panel-strong text-lab-text font-mono text-sm p-2" />
      </Field>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setUseHistorical((v) => !v)}
          className="text-xs font-mono px-2 py-1 rounded border"
          style={useHistorical ? { borderColor: color, color } : { borderColor: 'hsl(var(--lab-line))', color: 'hsl(var(--lab-text-muted))' }}
        >
          {useHistorical ? 'Using historical mean/SD' : 'Establish mean/SD from this data'}
        </button>
      </div>
      {useHistorical && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Historical mean"><NumInput value={histMean} onChange={setHistMean} /></Field>
          <Field label="Historical SD"><NumInput value={histSd} onChange={setHistSd} /></Field>
        </div>
      )}

      {data ? (
        <>
          {(() => {
            const yMin = data.mean - 4 * data.sd
            const yMax = data.mean + 4 * data.sd
            const py = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin || 1)) * plotH
            const px = (i: number) => padL + (data.vals.length <= 1 ? plotW / 2 : (i / (data.vals.length - 1)) * plotW)
            const linePath = data.vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ')
            return (
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                <rect x={padL} y={py(data.mean + 2 * data.sd)} width={plotW} height={py(data.mean - 2 * data.sd) - py(data.mean + 2 * data.sd)} fill="var(--color-lab-emerald-soft)" />
                <rect x={padL} y={py(data.mean + 3 * data.sd)} width={plotW} height={py(data.mean + 2 * data.sd) - py(data.mean + 3 * data.sd)} fill="var(--color-lab-amber-soft)" />
                <rect x={padL} y={py(data.mean - 2 * data.sd)} width={plotW} height={py(data.mean - 3 * data.sd) - py(data.mean - 2 * data.sd)} fill="var(--color-lab-amber-soft)" />
                {[data.mean - 3 * data.sd, data.mean - 2 * data.sd, data.mean, data.mean + 2 * data.sd, data.mean + 3 * data.sd].map((v, i) => (
                  <line key={i} x1={padL} x2={W - padR} y1={py(v)} y2={py(v)} stroke="hsl(var(--lab-line))" strokeWidth={v === data.mean ? 2 : 1} strokeDasharray={v === data.mean ? undefined : '3 3'} />
                ))}
                <path d={linePath} fill="none" stroke={color} strokeWidth={2} />
                {data.vals.map((v, i) => {
                  const out = Math.abs(v - data.mean) > 3 * data.sd
                  return <circle key={i} cx={px(i)} cy={py(v)} r={4.5} fill={out ? 'var(--color-lab-red)' : color} />
                })}
                <text x={(padL + W - padR) / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="var(--color-lab-text-muted)" className="font-mono">run number</text>
              </svg>
            )
          })()}
          <ResultBox color={color} resultKey={`${data.mean}-${data.sd}`}>
            mean={fmt(data.mean)}, SD={fmt(data.sd)}
            {data.violations.length > 0 ? (
              <ul className="mt-1 space-y-0.5">
                {data.violations.map((v, i) => (
                  <li key={i} className="text-lab-red text-xs">{v}</li>
                ))}
              </ul>
            ) : (
              <span className="block mt-1 text-lab-emerald text-xs">No rule violations detected.</span>
            )}
          </ResultBox>
        </>
      ) : (
        <p className="text-xs text-lab-text-muted font-mono">Enter at least 2 QC values.</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------

const TOOLS = [
  { key: 'dilution', label: 'Dilution', color: 'var(--color-lab-cyan)', component: DilutionCalculator },
  { key: 'molarity', label: 'Molarity', color: 'var(--color-lab-emerald)', component: MolarityCalculator },
  { key: 'serial', label: 'Serial Dilution', color: 'var(--color-lab-amber)', component: SerialDilutionSimulator },
  { key: 'lodloq', label: 'LOD / LOQ', color: 'var(--color-lab-violet)', component: LodLoqCalculator },
  { key: 'regression', label: 'Regression', color: 'var(--color-lab-rose)', component: RegressionCalculator },
  { key: 'precision', label: 'Precision & Accuracy', color: 'var(--color-lab-teal)', component: PrecisionAccuracyCalculator },
  { key: 'recovery', label: 'Recovery', color: 'var(--color-lab-orange)', component: RecoveryCalculator },
  { key: 'qc', label: 'QC Chart', color: 'var(--color-lab-red)', component: QCChart },
] as const

function App() {
  const [active, setActive] = useState<(typeof TOOLS)[number]['key']>('dilution')
  const tool = TOOLS.find((t) => t.key === active)!
  const ActiveTool = tool.component

  return (
    <div className="min-h-screen bg-lab-bg text-lab-text">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-widest font-mono" style={{ color: tool.color }}>Bioanalytical Toolkit</p>
          <h1 className="text-xl font-mono font-bold text-lab-text">Bench calculators</h1>
        </header>

        <div className="flex flex-wrap gap-2">
          {TOOLS.map((t) => (
            <Button
              key={t.key}
              onClick={() => setActive(t.key)}
              variant="outline"
              size="sm"
              className="border-2 font-mono"
              style={active === t.key ? { borderColor: t.color, color: t.color, backgroundColor: toSoft(t.color) } : { borderColor: 'hsl(var(--lab-line))', color: 'hsl(var(--lab-text-muted))' }}
            >
              {t.label}
            </Button>
          ))}
        </div>

        <Card className="bg-lab-panel border-2" style={{ borderColor: tool.color }}>
          <CardHeader>
            <CardTitle className="font-mono text-lg" style={{ color: tool.color }}>{tool.label}</CardTitle>
          </CardHeader>
          <CardContent key={active} style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <ActiveTool color={tool.color} />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-lab-text-muted font-mono">built by Khan Gulrez Shagufa Fazal Ahmed</p>
      </div>
    </div>
  )
}
