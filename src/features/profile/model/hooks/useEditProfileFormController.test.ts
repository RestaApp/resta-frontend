import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useEditProfileFormController } from './useEditProfileFormController'
import type { ProfileFormData } from '../utils/buildUpdateUserRequest'

// Детерминируем телефон-утилиты (без i18n-зависимости) и гасим хаптики.
vi.mock('@/shared/utils/phone', () => ({
  validatePhone: (p: string) => ({ valid: /^\+\d{7,}$/.test(p.trim()), message: 'invalid phone' }),
  formatPhoneInput: (v: string) => v,
}))
vi.mock('@/shared/utils/haptics', () => ({ triggerHapticFeedback: vi.fn() }))

// buildUpdateUserRequest изолируем — тестируем логику контроллера (вызов updateUser,
// маппинг ошибок), а не сборку payload (у неё свои тесты).
const built = vi.hoisted(() => ({ buildUpdateUserRequest: vi.fn() }))
vi.mock('../utils/buildUpdateUserRequest', () => ({
  buildUpdateUserRequest: built.buildUpdateUserRequest,
}))

const baseEmployee = (over: Partial<ProfileFormData> = {}): ProfileFormData => ({
  name: 'Иван',
  lastName: 'Петров',
  bio: '',
  city: 'Минск',
  location: [],
  email: '',
  phone: '+375291234567',
  website: '',
  businessHours: '',
  position: 'chef',
  experienceYears: 3,
  openToWork: true,
  skills: '',
  specializations: ['sushi_chef'],
  workHistory: [],
  restaurantFormat: '',
  cuisineTypes: [],
  supplierCategory: '',
  supplierTypes: [],
  deliveryAvailable: false,
  priceListUrl: '',
  ...over,
})

const updateUser = vi.fn()
const showToast = vi.fn()
const onSuccess = vi.fn()
const t = (key: string) => key

const setup = (over: { baseFormData?: ProfileFormData; initialStep?: 0 | 1 | 2 | null } = {}) =>
  renderHook(() =>
    useEditProfileFormController({
      apiRole: 'employee',
      userId: 1,
      baseFormData: over.baseFormData ?? baseEmployee(),
      initialStep: over.initialStep ?? null,
      onSuccess,
      updateUser,
      showToast,
      t,
    })
  )

beforeEach(() => {
  vi.clearAllMocks()
  updateUser.mockResolvedValue({ success: true })
  // По умолчанию — есть изменения (непустой user) → идёт вызов updateUser.
  built.buildUpdateUserRequest.mockReturnValue({ user: { name: 'changed' } })
})

describe('useEditProfileFormController — навигация по шагам', () => {
  it('handleNext не пускает дальше при невалидном шаге 0', () => {
    const { result } = setup({ baseFormData: baseEmployee({ name: '  ' }) })

    act(() => result.current.handleNext())

    expect(result.current.step).toBe(0)
    expect(result.current.fieldErrors.name).toBeTruthy()
    expect(showToast).toHaveBeenCalledWith('validation.fillRequired', 'warning')
  })

  it('handleNext переходит на шаг 1 при валидном шаге 0', () => {
    const { result } = setup()

    act(() => result.current.handleNext())

    expect(result.current.step).toBe(1)
    expect(result.current.fieldErrors).toEqual({})
  })

  it('handleBack уменьшает шаг и сбрасывает ошибки', () => {
    const { result } = setup({ initialStep: 1 })

    act(() => result.current.handleBack())

    expect(result.current.step).toBe(0)
    expect(result.current.fieldErrors).toEqual({})
  })
})

describe('useEditProfileFormController — валидация и сохранение', () => {
  it('handleSave блокирует при пустом обязательном поле (не city)', async () => {
    const { result } = setup({ baseFormData: baseEmployee({ phone: 'abc' }) })

    await act(async () => {
      await result.current.handleSave()
    })

    expect(result.current.fieldErrors.phone).toBeTruthy()
    expect(showToast).toHaveBeenCalledWith('validation.fillRequired', 'warning')
    expect(updateUser).not.toHaveBeenCalled()
  })

  it('handleSave при пустом только city показывает city-warning, не сохраняет', async () => {
    const { result } = setup({ baseFormData: baseEmployee({ city: '' }) })

    await act(async () => {
      await result.current.handleSave()
    })

    expect(result.current.showCityWarning).toBe(true)
    expect(updateUser).not.toHaveBeenCalled()
    expect(showToast).not.toHaveBeenCalledWith('validation.fillRequired', 'warning')
  })

  it('handleSave при валидных данных и непустом payload — вызывает updateUser + onSuccess', async () => {
    const { result } = setup()

    await act(async () => {
      await result.current.handleSave()
    })

    expect(updateUser).toHaveBeenCalledTimes(1)
    expect(showToast).toHaveBeenCalledWith('errors.profileUpdateSuccess', 'success')
    expect(onSuccess).toHaveBeenCalled()
  })

  it('handleSave при пустом payload — onSuccess без вызова updateUser', async () => {
    built.buildUpdateUserRequest.mockReturnValue({ user: {} })
    const { result } = setup()

    await act(async () => {
      await result.current.handleSave()
    })

    expect(updateUser).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('маппит серверную ошибку "phone has already been taken" в fieldErrors.phone', async () => {
    updateUser.mockResolvedValue({ success: false, errors: ['Phone has already been taken'] })
    const { result } = setup()

    await act(async () => {
      await result.current.handleSave()
    })

    expect(result.current.fieldErrors.phone).toBe('phone.alreadyTaken')
    expect(updateUser).toHaveBeenCalled()
  })
})

describe('useEditProfileFormController — updateField', () => {
  it('смена position сбрасывает специализации', () => {
    const { result } = setup()

    act(() => result.current.updateField('position', 'waiter'))

    expect(result.current.formData.position).toBe('waiter')
    expect(result.current.formData.specializations).toEqual([])
  })
})
