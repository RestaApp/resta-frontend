/**
 * Экран выбора позиции сотрудника
 */

import { memo } from 'react'
import { CardSelect } from '../../../../../components/ui/card-select'
import { SectionHeader } from '../../../../../components/ui/section-header'
import { POSITION_EMOJI_MAP } from '../../../../../constants/roles'
import type { EmployeeSubRole, EmployeeRole } from '../../../../../types'
import type { JSX } from 'react'

interface PositionSelectionScreenProps {
    subRoles: EmployeeSubRole[]
    selectedSubRole: string | null
    onPositionSelect: (role: EmployeeRole, positionValue: string) => void
}

export const PositionSelectionScreen = memo(function PositionSelectionScreen({
    subRoles,
    selectedSubRole,
    onPositionSelect,
}: PositionSelectionScreenProps): JSX.Element {
    return (
        <div className="min-h-screen bg-background flex flex-col px-6 py-12">
            <SectionHeader
                title="Кем вы работаете?"
                description="Выберите вашу основную позицию"
                className="mb-8"
            />

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
                {subRoles.map((subRole, index) => {
                    const isSelected = selectedSubRole === subRole.id
                    const emoji = POSITION_EMOJI_MAP[subRole.originalValue || ''] || '💼'

                    return (
                        <CardSelect
                            key={subRole.originalValue || subRole.id}
                            id={subRole.id}
                            title={subRole.title}
                            image={emoji}
                            imageType="emoji"
                            isSelected={isSelected}
                            index={index}
                            layout="vertical"
                            onSelect={id => {
                                const role = subRoles.find(r => r.id === id)
                                if (role) {
                                    onPositionSelect(role.id, role.originalValue || role.id)
                                }
                            }}
                            ariaLabel={`Выбрать: ${subRole.title}`}
                        />
                    )
                })}
            </div>
        </div>
    )
})
