import type { GlobalQuasarIconMapFn } from 'quasar'

const EXPLICIT_ICON_PROTOCOL = /^(?:none$|[Mm]\s?[-+]?\.?\d|r_|o_|s_|sym_[ors]_|mdi-|icon-|bt-|eva-|ion-|fa-|bi-|i-|img:|svguse:)/

/**
 * Astian product code uses readable, unprefixed Material icon names.
 * Quasar otherwise routes those names to the standard Material Icons font,
 * while Astian ships Material Icons Round. This mapping keeps one icon
 * contract across QIcon, QBtn, QInput, QSelect and product-level components.
 */
export const astianIconMapFn: GlobalQuasarIconMapFn = (iconName) => {
  if (EXPLICIT_ICON_PROTOCOL.test(iconName)) return undefined

  return {
    cls: 'notranslate material-icons-round',
    content: iconName
  }
}
