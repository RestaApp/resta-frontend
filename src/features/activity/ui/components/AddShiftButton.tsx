import { forwardRef } from 'react'
import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface AddShiftButtonProps {
  onClick?: () => void
}

export const AddShiftButton = forwardRef<HTMLButtonElement, AddShiftButtonProps>(
  ({ onClick }, ref) => {
    const { t } = useTranslation()
    return (
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          ref={ref}
          type="button"
          variant="gradient"
          size="sm"
          onClick={onClick}
          aria-label={t('shift.addShiftAria')}
          className="p-3 rounded-full"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </motion.div>
    )
  }
)

AddShiftButton.displayName = 'AddShiftButton'
