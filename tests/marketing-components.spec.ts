import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

import ALocaleSwitch from '@/components/ALocaleSwitch.vue'
import AMarketingAction from '@/components/AMarketingAction.vue'
import AMarketingNavigation from '@/components/AMarketingNavigation.vue'
import type { AMarketingNavEntry } from '@/types/marketing'

const entries: AMarketingNavEntry[] = [
  { kind: 'link', id: 'inicio', label: 'Inicio', href: '/es' },
  {
    kind: 'menu',
    id: 'productos',
    label: 'Productos',
    columns: [
      {
        id: 'privacidad',
        label: 'Privacidad',
        items: [
          { id: 'midori', label: 'Midori', description: 'Navegación privada', href: '/es/midori' },
          { id: 'vpn', label: 'MidoriVPN', description: 'Red privada', href: '/es/vpn' }
        ]
      },
      {
        id: 'productividad',
        label: 'Productividad',
        items: [
          { id: 'cloud', label: 'Astian Cloud', description: 'Archivos protegidos', href: '/es/cloud' }
        ]
      }
    ],
    cta: { id: 'todos', label: 'Ver todos los productos', href: '/es/productos' }
  }
]

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.overflow = ''
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('componentes de marketing', () => {
  it('renderiza acciones externas seguras y permite inyectar Link de Inertia', () => {
    const external = mount(AMarketingAction, {
      props: {
        href: 'https://astian.org',
        target: '_blank',
        rel: 'nofollow'
      },
      slots: { default: 'Conocer Astian' }
    })

    const anchor = external.get('a')
    expect(anchor.attributes('rel')?.split(' ')).toEqual(expect.arrayContaining([
      'nofollow',
      'noopener',
      'noreferrer'
    ]))

    const InertiaLink = defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => h('a', { ...attrs, 'data-inertia-link': 'true' }, slots.default?.())
      }
    })
    const inertia = mount(AMarketingAction, {
      props: {
        href: '/cms',
        linkComponent: InertiaLink,
        linkProps: { preserveScroll: true }
      },
      slots: { default: 'Abrir CMS' }
    })

    expect(inertia.get('a').attributes('href')).toBe('/cms')
    expect(inertia.get('a').attributes('data-inertia-link')).toBe('true')
  })

  it('publica URLs reales, hreflang y locale actual sin Vue Router', () => {
    const wrapper = mount(ALocaleSwitch, {
      props: {
        currentLocale: 'ES-co',
        locales: [
          { locale: 'es-CO', label: 'Español', shortLabel: 'ES', href: '/es/articulo?draft=1#contenido' },
          { locale: 'en-US', label: 'English', shortLabel: 'EN', href: '/en/article?draft=1#content' }
        ]
      }
    })

    const links = wrapper.findAll('a')
    expect(links).toHaveLength(2)
    expect(links[0].attributes()).toMatchObject({
      href: '/es/articulo?draft=1#contenido',
      hreflang: 'es-CO',
      'aria-current': 'page'
    })
    expect(links[1].attributes('aria-current')).toBeUndefined()
  })

  it('mantiene el selector compacto con cuatro idiomas y cierra por click exterior', async () => {
    const wrapper = mount(ALocaleSwitch, {
      attachTo: document.body,
      props: {
        currentLocale: 'es',
        locales: [
          { locale: 'es', label: 'Español', href: '/es' },
          { locale: 'en', label: 'English', href: '/en' },
          { locale: 'fr', label: 'Français', href: '/fr' },
          { locale: 'de', label: 'Deutsch', href: '/de' }
        ]
      }
    })

    const details = wrapper.get('details').element as HTMLDetailsElement
    details.open = true
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(details.open).toBe(false)
    wrapper.unmount()
  })

  it('abre por click, recorre el panel con teclado y restaura foco con Escape', async () => {
    const wrapper = mount(AMarketingNavigation, {
      attachTo: document.body,
      props: { entries }
    })
    const trigger = wrapper.get('.a-marketing-navigation__trigger')

    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')

    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(wrapper.find('.a-marketing-navigation__panel-link').element)

    await wrapper.find('.a-marketing-navigation__panel-link').trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('respeta hover intencional y cierra el panel por click exterior', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AMarketingNavigation, {
      attachTo: document.body,
      props: { entries, hoverOpenDelay: 160 }
    })
    const trigger = wrapper.get('.a-marketing-navigation__trigger')

    await trigger.trigger('pointerenter', { pointerType: 'mouse' })
    vi.advanceTimersByTime(159)
    await wrapper.vm.$nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('false')

    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('true')

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('atrapa foco en el drawer móvil, cierra con Escape y devuelve foco', async () => {
    const wrapper = mount(AMarketingNavigation, {
      attachTo: document.body,
      props: { entries }
    })
    const trigger = wrapper.get('.a-marketing-navigation__mobile-trigger')

    await trigger.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.activeElement).toBe(wrapper.get('[data-a-mobile-close]').element)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('rechaza modelos incompatibles con el breakpoint activo', async () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>()
    const media = {
      matches: true,
      media: '(min-width: 48rem)',
      onchange: null,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true
    } satisfies MediaQueryList
    vi.stubGlobal('matchMedia', () => media)

    const desktop = mount(AMarketingNavigation, {
      attachTo: document.body,
      props: { entries, mobileOpen: false }
    })
    await desktop.setProps({ mobileOpen: true })
    await desktop.vm.$nextTick()
    expect(desktop.emitted('update:mobileOpen')?.at(-1)).toEqual([false])
    expect(document.body.style.overflow).toBe('')
    desktop.unmount()

    media.matches = false
    const mobile = mount(AMarketingNavigation, {
      attachTo: document.body,
      props: { entries, openMenu: 'productos' }
    })
    await mobile.vm.$nextTick()
    expect(mobile.emitted('update:openMenu')?.at(-1)).toEqual([null])
    mobile.unmount()
  })
})
