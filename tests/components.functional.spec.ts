import { mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import iconSet from 'quasar/icon-set/material-icons-round'

import ACodeInput from '@/components/ACodeInput.vue'
import AInput from '@/components/AInput.vue'
import APortal from '@/components/APortal.vue'
import AToast from '@/components/AToast.vue'
import AToggle from '@/components/AToggle.vue'
import { astianIconMapFn } from '@/utils/iconSystem'

const global = {
  plugins: [[Quasar, { iconSet, config: { iconMapFn: astianIconMapFn } }]] as const
}

describe('contratos funcionales críticos', () => {
  it('limpia caracteres no numéricos y envía el código al completarlo', async () => {
    const wrapper = mount(ACodeInput, {
      props: { codeLength: 3, modelValue: '', 'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }) },
      global
    })
    const fields = wrapper.findAll('input')

    await fields[0].setValue('a1')
    await fields[1].setValue('2')
    await fields[2].setValue('3')

    expect(wrapper.props('modelValue')).toBe('123')
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('expone error, ayuda y modelo en los campos', async () => {
    const wrapper = mount(AInput, {
      props: { modelValue: '', label: 'Correo', hint: 'Sólo para el equipo', error: true, errorMessage: 'Correo inválido' },
      global
    })

    expect(wrapper.text()).toContain('Correo inválido')
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('input').attributes('aria-describedby')).toContain('-hint')
    expect(wrapper.get('label').attributes('for')).toBe(wrapper.get('input').attributes('id'))
    await wrapper.get('input').setValue('equipo@astian.org')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['equipo@astian.org'])
  })

  it('mantiene el modelo booleano y respeta disabled', async () => {
    const wrapper = mount(AToggle, { props: { modelValue: false, label: 'Privado' }, global })
    await wrapper.get('.q-toggle').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])

    await wrapper.setProps({ disabled: true })
    expect(wrapper.get('[role="switch"]').attributes('aria-disabled')).toBe('true')
  })

  it('teletransporta contenido al destino solicitado', () => {
    const target = document.createElement('div')
    target.id = 'portal-test-target'
    document.body.append(target)
    const wrapper = mount(APortal, { props: { to: '#portal-test-target' }, slots: { default: '<p>Contenido contextual</p>' } })

    expect(target.textContent).toContain('Contenido contextual')
    wrapper.unmount()
    target.remove()
  })

  it('cierra un toast controlado y emite el evento de salida', async () => {
    const wrapper = mount(AToast, {
      attachTo: document.body,
      props: { modelValue: true, title: 'Guardado', body: 'Cambios disponibles' },
      global
    })

    expect(document.body.textContent).toContain('Cambios disponibles')
    const closeButton = document.body.querySelector<HTMLButtonElement>('[aria-label="Cerrar notificación"]')
    expect(closeButton).not.toBeNull()
    closeButton?.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })
})
