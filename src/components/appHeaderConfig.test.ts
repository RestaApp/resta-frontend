import { describe, expect, it } from 'vitest'
import { Edit2, Plus } from 'lucide-react'
import { getHeaderAction } from './appHeaderConfig'

const t = (key: string, options?: Record<string, unknown>) =>
  typeof options?.defaultValue === 'string' ? options.defaultValue : key

type EmployeeFlags = { canEmployeeOfferShift: boolean; canEmployeeEditShift?: boolean }

const employeeMyShifts = (flags: EmployeeFlags) =>
  getHeaderAction({
    activeTab: 'myshifts',
    t,
    role: 'chef',
    isEmployeeFlow: true,
    ...flags,
  })

describe('getHeaderAction · «Мои смены» сотрудника', () => {
  it('без активной смены показывает «+»', () => {
    expect(employeeMyShifts({ canEmployeeOfferShift: true })?.Icon).toBe(Plus)
  })

  it('с редактируемой активной сменой показывает «Редактировать»', () => {
    const action = employeeMyShifts({ canEmployeeOfferShift: false, canEmployeeEditShift: true })

    expect(action?.Icon).toBe(Edit2)
  })

  it('скрывает действие, если активная смена заполнена, закрыта или кандидат выбран', () => {
    const action = employeeMyShifts({ canEmployeeOfferShift: false, canEmployeeEditShift: false })

    expect(action).toBeNull()
  })
})
