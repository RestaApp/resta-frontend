import { useTranslation } from 'react-i18next'
import { CheckboxField, TextAreaField } from '../../fields'
import type { AddShiftDrawerStep2Props } from './types'

export const AddShiftDrawerStep2 = ({
  descriptionRef,
  requirementsRef,
  description,
  onDescriptionChange,
  descriptionError,
  requirements,
  onRequirementsChange,
  requirementsError,
  urgent,
  onUrgentChange,
  isVacancyType,
}: AddShiftDrawerStep2Props) => {
  const { t } = useTranslation()
  const urgentLabel = isVacancyType
    ? t('shift.urgentVacancy', { defaultValue: 'Срочная вакансия' })
    : t('shift.urgent')
  const descriptionPlaceholder = isVacancyType
    ? t('shift.descriptionPlaceholderVacancy', {
        defaultValue: 'Коротко опишите вакансию и обязанности',
      })
    : t('shift.descriptionPlaceholder')

  return (
    <>
      <div ref={descriptionRef}>
        <TextAreaField
          label={t('common.description')}
          value={description}
          onChange={onDescriptionChange}
          placeholder={descriptionPlaceholder}
          minHeight="96px"
          error={descriptionError}
        />
      </div>

      <div ref={requirementsRef}>
        <TextAreaField
          label={t('common.requirements')}
          value={requirements}
          onChange={onRequirementsChange}
          placeholder={t('shift.requirementsPlaceholder')}
          minHeight="80px"
          error={requirementsError}
        />
      </div>

      <CheckboxField
        id="urgent-shift"
        label={urgentLabel}
        checked={urgent}
        onChange={onUrgentChange}
      />
    </>
  )
}
