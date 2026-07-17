import { mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import iconSet from 'quasar/icon-set/material-icons-round'

import AIconButton from '@/components/AIconButton.vue'
import { astianIconMapFn } from '@/utils/iconSystem'

describe('Astian icon system', () => {
  it('maps an unprefixed product icon to Material Icons Round', () => {
    expect(astianIconMapFn('search')).toEqual({
      cls: 'notranslate material-icons-round',
      content: 'search'
    })
  })

  it.each(['r_search', 'o_search', 's_search', 'sym_r_search', 'mdi-home', 'img:/icons/search.svg', 'svguse:/icons.svg#search', 'M10 10'])('leaves explicit icon protocols to Quasar: %s', (name) => {
    expect(astianIconMapFn(name)).toBeUndefined()
  })

  it('renders icon-only controls with a round glyph and an accessible label', () => {
    const wrapper = mount(AIconButton, {
      props: { icon: 'notifications', label: 'Notificaciones' },
      global: {
        plugins: [[Quasar, { iconSet, config: { iconMapFn: astianIconMapFn } }]]
      }
    })

    expect(wrapper.get('button').attributes('aria-label')).toBe('Notificaciones')
    expect(wrapper.get('.material-icons-round').text()).toBe('notifications')
    expect(wrapper.find('.material-icons').exists()).toBe(false)
  })
})
