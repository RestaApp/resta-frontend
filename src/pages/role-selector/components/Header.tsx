/**
 * Компонент заголовка страницы выбора роли
 */

import { motion } from 'motion/react'
import {
  logoAnimation,
  textAnimation,
  ANIMATION_DURATION,
} from '../../../constants/animations'

interface HeaderProps {
  logo: string
}

export function Header({ logo }: HeaderProps) {
  return (
    <div className="pb-4 px-3 text-center">
      <motion.div
        initial={logoAnimation.initial}
        animate={logoAnimation.animate}
        transition={{ duration: ANIMATION_DURATION }}
        className="mb-4 pt-4 flex flex-col items-center"
      >
        <img src={logo} alt="Resta" className="w-40 h-40 mx-auto" width={160} height={160} />

        <motion.p
          initial={textAnimation.initial}
          animate={textAnimation.animate}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground w-80"
        >
          Профессиональная платформа для индустрии HoReCa
        </motion.p>
      </motion.div>
    </div>
  )
}


