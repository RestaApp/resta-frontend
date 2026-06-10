import { InlineAlert } from '@/components/ui/inline-alert'

export const AddShiftDrawerBanner = ({ message }: { message: string | null }) => (
  <InlineAlert message={message} />
)
