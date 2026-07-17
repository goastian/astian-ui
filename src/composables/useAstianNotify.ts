import { Notify } from 'quasar'

export interface AstianNotification {
  title?: string
  body: string
  icon?: string
  type?: 'positive' | 'negative' | 'info' | 'warning'
  duration?: number
  persist?: boolean
  action?: { label: string; handler: () => void }
}

export function useAstianNotify() {
  const notify = ({ title, body, icon, type, duration = 4000, persist, action }: AstianNotification) => Notify.create({
    type,
    icon,
    timeout: persist ? 0 : duration,
    message: title ? `<strong>${title}</strong><br>${body}` : body,
    html: true,
    actions: action ? [{ label: action.label, color: 'white', handler: action.handler }] : undefined,
    classes: 'a-notification',
    progress: !persist
  })

  return { notify }
}
