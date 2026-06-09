import { AddShiftDrawer } from '@/features/activity/ui/components/AddShiftDrawer'
import { SuccessOverlay } from '@/components/ui/success-overlay'
import { Toast } from '@/components/ui/toast'
import { ActivityListTab } from './ActivityListTab'
import type { useActivityPageModel } from '../../model/hooks/useActivityPageModel'

type ActivityPageModel = ReturnType<typeof useActivityPageModel>

interface EmployeeActivityContentProps {
  model: ActivityPageModel
}

export const EmployeeActivityContent = ({ model }: EmployeeActivityContentProps) => {
  return (
    <>
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
      />

      <Toast
        message={model.toast.message}
        type={model.toast.type}
        isVisible={model.toast.isVisible}
        onClose={model.hideToast}
      />

      <SuccessOverlay state={model.successState} onClose={model.closeSuccess} />
    </>
  )
}
