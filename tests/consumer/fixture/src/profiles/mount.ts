import { createApp, type Component } from 'vue'

export function mountProfile(component: Component) {
  const host = document.createElement('div')
  document.body.append(host)
  createApp(component).mount(host)
}
