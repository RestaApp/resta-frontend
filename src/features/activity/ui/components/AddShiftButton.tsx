import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AddShiftButtonProps {
  onClick?: () => void
}

export const AddShiftButton = ({ onClick }: AddShiftButtonProps) => {
  const { t } = useTranslation()
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-3 rounded-full"
      style={{ background: 'var(--gradient-primary)' }}
      aria-label={t('shift.addShiftAria')}
    >
      <Plus className="w-4 h-4 text-white" />
    </motion.button>
  )
}
