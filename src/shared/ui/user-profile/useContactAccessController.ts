import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRevealContactMutation } from '@/services/api/usersApi'
import type { ContactAccessMeta } from '@/services/api/usersApi'
import { isContactRevealPaymentRequired } from '@/shared/lib/monetization/paymentRequired'
import { useToast } from '@/shared/lib/hooks/useToast'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'

interface UseContactAccessControllerOptions {
  userId: number | null
  contactAccess?: ContactAccessMeta
}

export const useContactAccessController = ({
  userId,
  contactAccess,
}: UseContactAccessControllerOptions) => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [revealContact, { isLoading: isRevealing }] = useRevealContactMutation()
  const [packagesOpen, setPackagesOpen] = useState(false)

  const reveal = async () => {
    if (userId == null) return false
    try {
      await revealContact(userId).unwrap()
      showToast(t('monetization.contactReveal.success'), 'success')
      return true
    } catch (error) {
      if (isContactRevealPaymentRequired(error)) {
        setPackagesOpen(true)
        return false
      }
      showToast(getErrorMessage(error) ?? t('monetization.contactReveal.error'), 'error')
      return false
    }
  }

  return {
    contactAccess,
    isRevealing,
    packagesOpen,
    setPackagesOpen,
    reveal,
  }
}
