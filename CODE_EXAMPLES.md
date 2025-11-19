# Примеры кода: Правильно vs Неправильно

Этот документ содержит практические примеры правильного и неправильного написания кода для проекта Resta.

---

## TypeScript

### Типизация

#### ✅ Правильно
```typescript
interface User {
  id: string
  name: string
  role: UserRole
  email?: string
}

function getUser(id: string): User | null {
  // ...
}
```

#### ❌ Неправильно
```typescript
function getUser(id: any): any {
  // ...
}
```

### Readonly массивы

#### ✅ Правильно
```typescript
const ROLES: readonly UserRole[] = ['chef', 'waiter', 'bartender'] as const
```

#### ❌ Неправильно
```typescript
const ROLES = ['chef', 'waiter', 'bartender'] // Можно изменить
```

---

## React компоненты

### Простые компоненты

#### ✅ Правильно
```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded-lg',
        variant === 'primary' ? 'bg-primary' : 'bg-secondary'
      )}
    >
      {children}
    </button>
  )
}
```

#### ❌ Неправильно
```typescript
export function Button(props: any) {
  return (
    <button onClick={props.onClick} style={{ padding: '8px' }}>
      {props.children}
    </button>
  )
}
```

### Условный рендеринг

#### ✅ Правильно
```typescript
function UserProfile({ user }: UserProfileProps) {
  if (!user) return null
  if (user.isLoading) return <Loader />
  
  return (
    <div>
      <h1>{user.name}</h1>
      {user.email && <p>{user.email}</p>}
    </div>
  )
}
```

#### ❌ Неправильно
```typescript
function UserProfile({ user }: UserProfileProps) {
  return (
    <div>
      {user ? (
        user.isLoading ? (
          <Loader />
        ) : (
          <div>
            <h1>{user.name}</h1>
            {user.email ? <p>{user.email}</p> : null}
          </div>
        )
      ) : null}
    </div>
  )
}
```

### Списки

#### ✅ Правильно
```typescript
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}
```

#### ❌ Неправильно
```typescript
{users.map((user, index) => (
  <UserCard key={index} user={user} />
))}
```

---

## Хуки

### Кастомные хуки

#### ✅ Правильно
```typescript
// hooks/useRole.ts
export function useRole() {
  const [role, setRole] = useState<UserRole | null>(() => getStoredRole())
  
  const updateRole = useCallback((newRole: UserRole) => {
    setRole(newRole)
    setStoredRole(newRole)
  }, [])
  
  return { role, updateRole }
}

// Использование
function Component() {
  const { role, updateRole } = useRole()
  // ...
}
```

#### ❌ Неправильно
```typescript
function Component() {
  const [role, setRole] = useState(() => getStoredRole())
  
  const updateRole = (newRole: any) => {
    setRole(newRole)
    localStorage.setItem('user_role', newRole)
  }
  // Дублирование логики в каждом компоненте
}
```

### useCallback

#### ✅ Правильно
```typescript
function Parent() {
  const [count, setCount] = useState(0)
  
  const handleClick = useCallback(() => {
    setCount(prev => prev + 1)
  }, [])
  
  return <Child onClick={handleClick} />
}
```

#### ❌ Неправильно
```typescript
function Parent() {
  const [count, setCount] = useState(0)
  
  return <Child onClick={() => setCount(prev => prev + 1)} />
  // Новая функция при каждом render
}
```

---

## Функции

### Чистые функции

#### ✅ Правильно
```typescript
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
```

#### ❌ Неправильно
```typescript
function calculateTotal(items: CartItem[]): number {
  let total = 0
  items.forEach(item => {
    total += item.price * item.quantity
    console.log(`Added ${item.name}`) // Побочный эффект
  })
  return total
}
```

### Параметры

#### ✅ Правильно
```typescript
interface CreateUserParams {
  name: string
  email: string
  role: UserRole
}

function createUser({ name, email, role }: CreateUserParams) {
  // ...
}
```

#### ❌ Неправильно
```typescript
function createUser(
  name: string,
  email: string,
  role: UserRole,
  age: number,
  city: string,
  phone: string
) {
  // Слишком много параметров
}
```

---

## Константы

### Организация констант

#### ✅ Правильно
```typescript
// constants/routes.ts
export const ROUTES = {
  HOME: 'home',
  PROFILE: 'profile',
  SETTINGS: 'settings',
} as const satisfies Record<string, Screen>

// constants/roles.ts
export const ROLE_LABELS: Record<UserRole, string> = {
  chef: 'Повар',
  waiter: 'Официант',
} as const
```

#### ❌ Неправильно
```typescript
// Магические строки разбросаны по коду
function navigate(destination: string) {
  if (destination === 'home') { // Магическая строка
    // ...
  }
}

function getLabel(role: string) {
  if (role === 'chef') return 'Повар' // Дублирование
  if (role === 'waiter') return 'Официант'
  // ...
}
```

---

## Стилизация

### Tailwind классы

#### ✅ Правильно
```typescript
import { cn } from '../utils/cn'

<div className={cn(
  'flex items-center gap-4 p-6',
  isActive && 'bg-primary text-white',
  disabled && 'opacity-50 cursor-not-allowed',
  className
)}>
```

#### ❌ Неправильно
```typescript
<div className={`flex items-center gap-4 p-6 ${isActive ? 'bg-primary' : ''} ${disabled ? 'opacity-50' : ''}`}>
```

### Группировка классов

#### ✅ Правильно
```typescript
<div className={cn(
  // Layout
  'flex items-center justify-between',
  // Spacing
  'p-6 gap-4',
  // Colors
  'bg-card border border-border',
  // Effects
  'rounded-lg shadow-sm'
)}>
```

#### ❌ Неправильно
```typescript
<div className="p-6 flex items-center bg-card rounded-lg gap-4 justify-between border border-border shadow-sm">
  // Классы в случайном порядке, сложно читать
```

---

## Обработка ошибок

### Try-catch

#### ✅ Правильно
```typescript
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Ошибка загрузки пользователя:', error)
    throw new Error('Не удалось загрузить данные пользователя')
  }
}
```

#### ❌ Неправильно
```typescript
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`)
  return await response.json() // Нет обработки ошибок
}
```

---

## Именование

### Переменные

#### ✅ Правильно
```typescript
const userName = 'John'
const isUserLoggedIn = true
const userRole = 'chef'
const handleSubmit = () => {}
```

#### ❌ Неправильно
```typescript
const un = 'John'
const isULI = true
const ur = 'chef'
const hs = () => {}
```

### Функции

#### ✅ Правильно
```typescript
function calculateTotalPrice(items: CartItem[]): number {
  // ...
}

function validateEmail(email: string): boolean {
  // ...
}

function formatDate(date: Date): string {
  // ...
}
```

#### ❌ Неправильно
```typescript
function calc(items: any): any {
  // ...
}

function val(email: string) {
  // ...
}

function fmt(d: Date) {
  // ...
}
```

---

## Комментарии

### Когда комментировать

#### ✅ Правильно
```typescript
// Используем setTimeout для обхода бага в Safari с focus
// Safari не фокусирует input при программном вызове focus()
setTimeout(() => inputRef.current?.focus(), 0)

// Кэшируем результат тяжелого вычисления
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])
```

#### ❌ Неправильно
```typescript
// Устанавливаем значение в state
setValue(newValue)

// Проверяем, является ли пользователь сотрудником
if (isEmployee(role)) {
  // ...
}
```

---

## Импорты

### Порядок импортов

#### ✅ Правильно
```typescript
// 1. React и библиотеки
import { useState, useCallback } from 'react'
import { motion } from 'motion/react'

// 2. Внутренние компоненты
import { Button } from './ui/button'
import { Card } from './ui/card'

// 3. Хуки и утилиты
import { useRole } from '../hooks/useRole'
import { cn } from '../utils/cn'

// 4. Типы
import type { UserRole } from '../types'

// 5. Константы
import { ROUTES } from '../constants/routes'
```

#### ❌ Неправильно
```typescript
import { ROUTES } from '../constants/routes'
import { useState } from 'react'
import type { UserRole } from '../types'
import { Button } from './ui/button'
// Импорты в случайном порядке
```

---

## Производительность

### Мемоизация

#### ✅ Правильно
```typescript
// Мемоизируем только дорогие вычисления
const expensiveValue = useMemo(() => {
  return items.reduce((sum, item) => {
    // Сложные вычисления
    return sum + complexCalculation(item)
  }, 0)
}, [items])

// Мемоизируем функции, передаваемые в дочерние компоненты
const handleClick = useCallback(() => {
  onAction(id)
}, [id, onAction])
```

#### ❌ Неправильно
```typescript
// Избыточная мемоизация простых операций
const simpleValue = useMemo(() => data.length, [data])

// Мемоизация функции, которая не передается в дочерние компоненты
const handleClick = useCallback(() => {
  setCount(prev => prev + 1)
}, []) // Не нужно, если не передается в дочерний компонент
```

### React.memo

#### ✅ Правильно
```typescript
// Мемоизируем только дорогие компоненты
export const ExpensiveChart = React.memo(({ data }: Props) => {
  return <div>{/* Сложный рендеринг графика */}</div>
})
```

#### ❌ Неправильно
```typescript
// Мемоизация простых компонентов не нужна
export const SimpleText = React.memo(({ text }: Props) => {
  return <div>{text}</div> // Не нужно
})
```

---

## Структура компонента

### ✅ Правильно - разделение логики и UI

```typescript
// hooks/useProfile.ts
export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchProfile(userId).then(data => {
      setProfile(data)
      setIsLoading(false)
    })
  }, [userId])
  
  return { profile, isLoading }
}

// components/ProfileCard.tsx
export function ProfileCard({ userId }: ProfileCardProps) {
  const { profile, isLoading } = useProfile(userId)
  
  if (isLoading) return <Loader />
  if (!profile) return null
  
  return <div>{profile.name}</div>
}
```

### ❌ Неправильно - все в одном компоненте

```typescript
export function ProfileCard({ userId }: ProfileCardProps) {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data)
        setIsLoading(false)
      })
  }, [userId])
  
  if (isLoading) return <Loader />
  if (!profile) return null
  
  return <div>{profile.name}</div>
  // Логика и UI смешаны
}
```

---

## Типизация событий

### ✅ Правильно

```typescript
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()
  // ...
}

function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  const value = event.target.value
  // ...
}

function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  // ...
}
```

### ❌ Неправильно

```typescript
function handleSubmit(event: any) {
  event.preventDefault()
  // ...
}
```

---

## Утилиты

### ✅ Правильно - переиспользуемые утилиты

```typescript
// utils/roles.ts
export function isEmployeeRole(role: UserRole | null): role is EmployeeRole {
  if (!role) return false
  return EMPLOYEE_ROLES.includes(role as EmployeeRole)
}

export function canViewShifts(role: UserRole | null): boolean {
  return isEmployeeRole(role) || isVenueRole(role)
}

// Использование
if (isEmployeeRole(role)) {
  // TypeScript знает, что role - EmployeeRole
}
```

### ❌ Неправильно - дублирование логики

```typescript
// В каждом компоненте
if (role === 'chef' || role === 'waiter' || role === 'bartender') {
  // Дублирование
}
```

---

Эти примеры помогут поддерживать единый стиль кода в проекте и избегать распространенных ошибок.

