import '@goastian/astian-ui/tokens.css'
import '@goastian/astian-ui/marketing.css'

import { ALocaleSwitch } from '@goastian/astian-ui/locale-switch'
import { AMarketingAction } from '@goastian/astian-ui/marketing-action'
import { AMarketingNavigation } from '@goastian/astian-ui/marketing-navigation'
import { defineComponent, h } from 'vue'

import { mountProfile } from './mount'

mountProfile(defineComponent({
  name: 'MarketingProfile',
  setup: () => () => h('header', [
    h(AMarketingNavigation, {
      ariaLabel: 'Navegación principal',
      mobileTitle: 'Navegación',
      mobileOpenLabel: 'Abrir navegación',
      mobileCloseLabel: 'Cerrar navegación',
      entries: [{ kind: 'link', id: 'home', label: 'Inicio', href: '/' }]
    }),
    h(ALocaleSwitch, {
      label: 'Cambiar idioma',
      currentLocale: 'es',
      locales: [
        { locale: 'es', label: 'Español', shortLabel: 'ES', href: '/es' },
        { locale: 'en', label: 'English', shortLabel: 'EN', href: '/en' }
      ]
    }),
    h(AMarketingAction, { href: '/registro' }, { default: () => 'Crear cuenta' })
  ])
}))
