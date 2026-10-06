import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import i18n from '@/shared/i18n/config'
import { ApplicantPreviewCard } from './ApplicantPreviewCard'

const renderAcceptedApplicant = (onSelect = vi.fn()) => {
  render(
    <ApplicantPreviewCard
      applicant={{
        id: 10,
        user_id: 20,
        shift_application_status: 'accepted',
        full_name: 'Иван Петров',
        position: 'chef',
      }}
      getEmployeePositionLabel={() => 'Повар'}
      getSpecializationLabel={value => value}
      onSelect={onSelect}
      t={i18n.t}
      variant="moderation"
    />
  )
  return onSelect
}

describe('ApplicantPreviewCard · выбранный кандидат', () => {
  it('не показывает отдельную кнопку профиля', () => {
    renderAcceptedApplicant()

    expect(screen.queryByRole('button', { name: i18n.t('tabs.employee.profileShort') })).toBeNull()
  })

  it('показывает бейдж в правом верхнем углу', () => {
    renderAcceptedApplicant()

    expect(
      screen.getByText(i18n.t('shift.applicantSelected')).parentElement?.parentElement
    ).toHaveClass('absolute', 'right-3', 'top-3')
  })

  it('открывает профиль по клику на всю карточку', () => {
    const onSelect = renderAcceptedApplicant()

    fireEvent.click(screen.getByRole('button', { name: /Иван Петров/ }))

    expect(onSelect).toHaveBeenCalledWith(20, 10)
  })
})

const renderPendingApplicant = (onAccept?: (applicationId: number) => void) => {
  render(
    <ApplicantPreviewCard
      applicant={{
        id: 11,
        user_id: 21,
        shift_application_status: 'pending',
        full_name: 'Пётр Сидоров',
        position: 'chef',
      }}
      getEmployeePositionLabel={() => 'Повар'}
      getSpecializationLabel={value => value}
      onSelect={vi.fn()}
      t={i18n.t}
      variant="moderation"
      onAccept={onAccept}
    />
  )
}

describe('ApplicantPreviewCard · кнопка «Принять»', () => {
  it('не рендерит кнопку найма без onAccept (публикация закрыта или заполнена)', () => {
    renderPendingApplicant()

    expect(screen.queryByRole('button', { name: i18n.t('shift.hireShort') })).toBeNull()
  })

  it('рендерит кнопку найма при переданном onAccept и вызывает его с id заявки', () => {
    const onAccept = vi.fn()
    renderPendingApplicant(onAccept)

    fireEvent.click(screen.getByRole('button', { name: i18n.t('shift.hireShort') }))

    expect(onAccept).toHaveBeenCalledWith(11)
  })
})
