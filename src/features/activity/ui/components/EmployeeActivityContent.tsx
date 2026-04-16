import type { TFunction } from 'i18next'
import { AddShiftDrawer } from '@/features/activity/ui/components/AddShiftDrawer'
import { Toast } from '@/components/ui/toast'
import { ActivityHeader } from './ActivityHeader'
import { ActivityListTab } from './ActivityListTab'
import type { useActivityPageModel } from '../../model/hooks/useActivityPageModel'

type ActivityPageModel = ReturnType<typeof useActivityPageModel>

interface EmployeeActivityContentProps {
  t: TFunction
  model: ActivityPageModel
}

export const EmployeeActivityContent = ({ t, model }: EmployeeActivityContentProps) => {
  return (
    <>
      <ActivityHeader activeTab={model.activeTab} onChange={model.setActiveTab} />

      <div className="ui-density-page ui-density-py">
        <div className="ui-density-stack">
          <ActivityListTab
            activeTab={model.activeTab}
            isLoading={model.isLoading}
            isAppliedLoading={model.isAppliedLoading}
            isError={model.isError}
            shifts={model.shifts}
            appliedShifts={model.appliedShifts}
            isDeleting={model.isDeleting}
            onEdit={model.handleEdit}
            onDelete={model.handleDelete}
            showToast={model.showToast}
            onRefresh={model.refreshList}
          />
        </div>
      </div>

      <AddShiftDrawer
        open={model.isDrawerOpen}
        onOpenChange={open => {
          model.setIsDrawerOpen(open)
          if (!open) model.setEditingShift(null)
        }}
        initialValues={model.editingShift}
        onSave={() => {
          model.setIsDrawerOpen(false)
          model.setEditingShift(null)
          model.showToast(t('shift.saved'), 'success')
        }}
      />

      <Toast
        message={model.toast.message}
        type={model.toast.type}
        isVisible={model.toast.isVisible}
        onClose={model.hideToast}
      />
    </>
  )
}
