import { useTranslation } from 'react-i18next'
import { AddShiftDrawer } from '@/features/activity/ui/components/AddShiftDrawer'
import { useActivityPageModel } from '../model/hooks/useActivityPageModel'
import { ActivityHeader } from './components/ActivityHeader'
import { ActivityListTab } from './components/ActivityListTab'
import { ActivityCalendarTab } from './components/ActivityCalendarTab'

export const ActivityPage = () => {
  const { t } = useTranslation()
  const m = useActivityPageModel()

  return (
    <div className="bg-background">
      <ActivityHeader activeTab={m.activeTab} onChange={m.setActiveTab} />

      <div className="p-4">
        {m.activeTab === 'list' ? (
          <div className="space-y-4">
            <ActivityListTab
              isLoading={m.isLoading}
              isAppliedLoading={m.isAppliedLoading}
              isError={m.isError}
              shifts={m.shifts}
              appliedShifts={m.appliedShifts}
              isDeleting={m.isDeleting}
              onEdit={m.handleEdit}
              onDelete={m.handleDelete}
              showToast={m.showToast}
            />
          </div>
        ) : (
          <ActivityCalendarTab
            isLoading={m.isLoading}
            isError={m.isError}
            weekDays={m.weekDays}
            groupedShifts={m.groupedShifts}
            selectedDayKey={m.selectedDayKey}
            onSelectDay={m.setSelectedDayKey}
            selectedDayShifts={m.selectedDayShifts}
            onEdit={m.handleEdit}
            onDelete={m.handleDelete}
            isDeleting={m.isDeleting}
            showToast={m.showToast}
            onFindShift={m.handleFindShift}
          />
        )}
      </div>

      <AddShiftDrawer
        open={m.isDrawerOpen}
        onOpenChange={open => {
          m.setIsDrawerOpen(open)
          if (!open) m.setEditingShift(null)
        }}
        initialValues={m.editingShift}
        onSave={() => {
          m.setIsDrawerOpen(false)
          m.setEditingShift(null)
          m.showToast(t('shift.saved'), 'success')
        }}
      />
    </div>
  )
}
