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
