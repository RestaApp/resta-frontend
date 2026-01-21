/**
 * Компонент-обертка для анимации полей формы
 */

import { memo } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface AnimatedFieldProps {
    children: ReactNode
    withAnimation?: boolean
    animationDelay?: number
}

export const AnimatedField = memo(function AnimatedField({
    children,
    withAnimation = false,
    animationDelay = 0,
}: AnimatedFieldProps) {
    if (withAnimation) {
        return (
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: animationDelay }}
            >
                {children}
            </motion.div>
        )
    }

    return <div>{children}</div>
})
