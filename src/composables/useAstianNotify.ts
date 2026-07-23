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

export type AstianNotificationDismiss = () => void

export function useAstianNotify() {
  const notify = ({ title, body, icon, type, duration = 4000, persist, action }: AstianNotification): AstianNotificationDismiss => {
    const dismiss = Notify.create({
      type,
      icon,
      timeout: persist ? 0 : duration,
      message: title ?? body,
      caption: title ? body : undefined,
      html: false,
      actions: action ? [{ label: action.label, handler: action.handler }] : undefined,
      classes: 'a-notification',
      progress: !persist
    })

    return () => dismiss()
  }

  return { notify }
}
