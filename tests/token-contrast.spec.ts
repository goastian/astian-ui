import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type Oklch = readonly [lightness: number, chroma: number, hue: number]

const tokenSource = readFileSync(resolve(process.cwd(), 'tokens.css'), 'utf8')
const darkStart = tokenSource.indexOf(":root[data-theme='dark']")
const scopes = {
  light: tokenSource.slice(0, darkStart),
  dark: tokenSource.slice(darkStart)
}

const readColor = (source: string, name: string): Oklch => {
  const match = source.match(new RegExp(`--color-${name}:\\s*oklch\\(([\\d.]+)%\\s+([\\d.]+)\\s+([\\d.]+)`))
  if (!match) throw new Error(`Missing OKLCH token: --color-${name}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

const relativeLuminance = ([lightness, chroma, hue]: Oklch) => {
  const l = lightness / 100
  const radians = hue * Math.PI / 180
  const a = chroma * Math.cos(radians)
  const b = chroma * Math.sin(radians)
  const long = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const medium = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const short = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  const channels = [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short
  ].map((channel) => Math.max(0, Math.min(1, channel)))

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

const contrast = (left: Oklch, right: Oklch) => {
  const leftLuminance = relativeLuminance(left)
  const rightLuminance = relativeLuminance(right)
  return (Math.max(leftLuminance, rightLuminance) + 0.05)
    / (Math.min(leftLuminance, rightLuminance) + 0.05)
}

describe.each(Object.entries(scopes))('%s token contrast', (_theme, source) => {
  const paper = readColor(source, 'paper')

  it.each(['ink', 'ink-2', 'muted', 'accent', 'success', 'error', 'warning', 'info'])(
    'keeps --color-%s readable on paper',
    (token) => expect(contrast(paper, readColor(source, token))).toBeGreaterThanOrEqual(4.5)
  )

  it('keeps text readable on the accent fill', () => {
    expect(contrast(readColor(source, 'accent'), readColor(source, 'accent-ink')))
      .toBeGreaterThanOrEqual(4.5)
  })

  it('keeps focus indication distinct from the canvas', () => {
    expect(contrast(paper, readColor(source, 'focus'))).toBeGreaterThanOrEqual(3)
  })
})
