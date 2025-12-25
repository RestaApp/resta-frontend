import { motion } from 'motion/react'
import { Map } from 'lucide-react'

interface MapFABProps {
    onOpen: () => void
    className?: string
}

export const MapFAB = ({ onOpen, className }: MapFABProps => {
    return (
        <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            onClick={onOpen}
            className={`fixed bottom-24 right-4 w-14 h-14 gradient-primary rounded-full shadow-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity ${className ?? ''}`}
        >
            <Map className="w-6 h-6" />
        </motion.button>
    )
}


