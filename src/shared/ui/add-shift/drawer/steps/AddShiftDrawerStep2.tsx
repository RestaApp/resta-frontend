import { useTranslation } from 'react-i18next'
import { TextAreaField } from '../../fields'
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
  isVacancyType,
}: AddShiftDrawerStep2Props) => {
  const { t } = useTranslation()
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
    </>
  )
}
