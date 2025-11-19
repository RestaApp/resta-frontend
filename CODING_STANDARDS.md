# Стандарты написания кода проекта Resta

## Содержание

1. [Общие принципы](#общие-принципы)
2. [Архитектура проекта](#архитектура-проекта)
3. [TypeScript стандарты](#typescript-стандарты)
4. [React стандарты](#react-стандарты)
5. [Стилизация](#стилизация)
6. [Производительность](#производительность)
7. [Безопасность](#безопасность)
8. [Тестирование](#тестирование)
9. [Документация](#документация)
10. [Git workflow](#git-workflow)

---

## Общие принципы

### SOLID принципы

#### Single Responsibility Principle (SRP)
Каждый модуль, класс или функция должны иметь одну причину для изменения.

```typescript
// ✅ Правильно
// Компонент отвечает только за отображение профиля
export function ProfileCard({ user }: ProfileCardProps) {
  return <div>{user.name}</div>
}

// Утилита отвечает только за форматирование
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU')
}

// ❌ Неправильно
// Компонент делает слишком много
export function ProfileCard({ user }: ProfileCardProps) {
  const formattedDate = user.createdAt.toLocaleDateString('ru-RU')
  const isValid = validateUser(user)
  const apiData = fetchUserData(user.id)
  return <div>{user.name}</div>
}
```

#### Open/Closed Principle (OCP)
Модули должны быть открыты для расширения, но закрыты для модификации.

```typescript
// ✅ Правильно - используем композицию
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}

export function Button({ variant = 'primary', children }: ButtonProps) {
  return <button className={getVariantClass(variant)}>{children}</button>
}

// Расширяем через props, не модифицируя компонент
<Button variant="primary">Click</Button>
```

#### Liskov Substitution Principle (LSP)
Подтипы должны быть заменяемы базовыми типами.

```typescript
// ✅ Правильно
interface BaseComponent {
  render(): React.ReactNode
}

interface ButtonComponent extends BaseComponent {
  onClick: () => void
}

// ButtonComponent может заменить BaseComponent
```

#### Interface Segregation Principle (ISP)
Клиенты не должны зависеть от интерфейсов, которые они не используют.

```typescript
// ✅ Правильно - разделенные интерфейсы
interface Readable {
  read(): string
}

interface Writable {
  write(data: string): void
}

// ❌ Неправильно - один большой интерфейс
interface ReadWrite {
  read(): string
  write(data: string): void
  delete(): void
  update(): void
}
```

#### Dependency Inversion Principle (DIP)
Зависимости должны быть на абстракциях, а не на конкретных реализациях.

```typescript
// ✅ Правильно - зависимость от абстракции
interface Storage {
  get(key: string): string | null
  set(key: string, value: string): void
}

function useStorage(storage: Storage) {
  return {
    get: storage.get,
    set: storage.set,
  }
}

// ❌ Неправильно - зависимость от конкретной реализации
function useStorage() {
  return {
    get: (key: string) => localStorage.getItem(key),
    set: (key: string, value: string) => localStorage.setItem(key, value),
  }
}
```

### DRY (Don't Repeat Yourself)

```typescript
// ✅ Правильно - выносим в константу
const ROLE_LABELS: Record<UserRole, string> = {
  chef: 'Повар',
  waiter: 'Официант',
} as const

// ❌ Неправильно - дублирование
function getRoleLabel(role: UserRole) {
  if (role === 'chef') return 'Повар'
  if (role === 'waiter') return 'Официант'
  // ...
}
```

### KISS (Keep It Simple, Stupid)

```typescript
// ✅ Правильно - просто и понятно
function isEmployee(role: UserRole): boolean {
  return role === 'chef' || role === 'waiter' || role === 'bartender'
}

// ❌ Неправильно - излишне сложно
function isEmployee(role: UserRole): boolean {
  const employeeRoles = ['chef', 'waiter', 'bartender', 'barista', 'admin']
  return employeeRoles.some(r => r === role) && 
         role !== 'venue' && 
         role !== 'supplier' &&
         typeof role === 'string'
}
```

---

## Архитектура проекта

### Структура директорий

```
src/
├── components/          # React компоненты
│   ├── ui/             # Переиспользуемые UI компоненты (Button, Card, etc.)
│   ├── figma/          # Компоненты из Figma
│   └── [Feature]/      # Компоненты по функциональности
├── constants/          # Константы приложения
│   ├── routes.ts       # Маршруты
│   ├── roles.ts        # Конфигурации ролей
│   └── animations.ts   # Константы анимаций
├── hooks/              # Кастомные React хуки
│   ├── useRole.ts
│   └── useNavigation.ts
├── types/              # TypeScript типы и интерфейсы
│   └── index.ts
├── utils/              # Утилитарные функции
│   ├── cn.ts           # Утилита для классов
│   ├── storage.ts       # Работа с localStorage
│   ├── roles.ts         # Утилиты для ролей
│   └── telegram.ts      # Интеграция с Telegram
└── pages/               # Страницы (если используется роутинг)
```

### Правила организации файлов

1. **Один компонент = один файл**
   - Имя файла должно совпадать с именем компонента
   - Используйте `PascalCase` для имен файлов компонентов

2. **Группировка по функциональности**
   - Компоненты одной фичи группируйте в папку
   - Общие компоненты в `ui/`

3. **Экспорты**
   - Используйте именованные экспорты для компонентов
   - Default экспорты только для страниц/роутов

```typescript
// ✅ Правильно: components/Button.tsx
export function Button({ children }: ButtonProps) {
  return <button>{children}</button>
}

// ❌ Неправильно
export default function Button() { }
```

---

## TypeScript стандарты

### Типизация

#### Всегда используйте типы

```typescript
// ✅ Правильно
function getUser(id: string): User | null {
  // ...
}

// ❌ Неправильно
function getUser(id: any): any {
  // ...
}
```

#### Используйте `type` vs `interface`

- `type` для примитивных типов, объединений, пересечений
- `interface` для объектов, компонентов, расширяемых структур

```typescript
// ✅ type для объединений
type UserRole = 'chef' | 'waiter' | 'bartender'

// ✅ interface для объектов
interface User {
  id: string
  name: string
  role: UserRole
}

// ✅ type для сложных типов
type UserWithPermissions = User & {
  permissions: Permission[]
}
```

#### Readonly для неизменяемых данных

```typescript
// ✅ Правильно
const ROLES: readonly UserRole[] = ['chef', 'waiter'] as const

interface Config {
  readonly apiUrl: string
  readonly timeout: number
}
```

#### Строгая типизация функций

```typescript
// ✅ Правильно
function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
  event.preventDefault()
  // ...
}

// ❌ Неправильно
function handleSubmit(event: any) {
  // ...
}
```

### Именование типов

```typescript
// ✅ Правильно
type UserRole = 'chef' | 'waiter'
interface UserProfile {
  name: string
}
interface ButtonProps {
  onClick: () => void
}

// ❌ Неправильно
type userRole = 'chef'
interface userProfile { }
interface buttonProps { }
```

### Утилитарные типы

Используйте встроенные утилитарные типы TypeScript:

```typescript
// ✅ Правильно
type PartialUser = Partial<User>
type RequiredUser = Required<User>
type UserKeys = keyof User
type UserName = Pick<User, 'name'>
type UserWithoutId = Omit<User, 'id'>
```

---

## React стандарты

### Компоненты

#### Функциональные компоненты

```typescript
// ✅ Правильно
export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>
}

// ❌ Неправильно - классовые компоненты устарели
class UserCard extends React.Component {
  // ...
}
```

#### Размер компонента

- Максимум 300 строк на компонент
- Если больше - разбивайте на подкомпоненты

#### Props типизация

```typescript
// ✅ Правильно
interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  className?: string
}

export function UserCard({ user, onEdit, className }: UserCardProps) {
  // ...
}

// ❌ Неправильно
export function UserCard(props: any) {
  // ...
}
```

### Хуки

#### Кастомные хуки

```typescript
// ✅ Правильно: hooks/useRole.ts
export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null)
  
  const setUserRole = useCallback((newRole: UserRole) => {
    setRole(newRole)
    setStoredRole(newRole)
  }, [])
  
  return { role, setUserRole }
}

// Использование
const { role, setUserRole } = useRole()
```

#### Правила хуков

1. Вызывайте хуки только на верхнем уровне
2. Не вызывайте хуки в условиях, циклах, вложенных функциях
3. Именуйте хуки с префиксом `use`

```typescript
// ✅ Правильно
function Component() {
  const [state, setState] = useState(0)
  const value = useMemo(() => computeValue(state), [state])
  return <div>{value}</div>
}

// ❌ Неправильно
function Component() {
  if (condition) {
    const [state, setState] = useState(0) // Ошибка!
  }
}
```

### State Management

#### Локальное состояние

```typescript
// ✅ Правильно
function Counter() {
  const [count, setCount] = useState(0)
  
  const increment = useCallback(() => {
    setCount(prev => prev + 1)
  }, [])
  
  return <button onClick={increment}>{count}</button>
}
```

#### Мемоизация

```typescript
// ✅ Правильно - мемоизируем только при необходимости
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

const handleClick = useCallback(() => {
  // Функция передается в дочерний компонент
  onAction(id)
}, [id, onAction])

// ❌ Неправильно - избыточная мемоизация
const simpleValue = useMemo(() => data.length, [data]) // Не нужно
```

### Условный рендеринг

```typescript
// ✅ Правильно - ранний возврат
function UserProfile({ user }: UserProfileProps) {
  if (!user) return null
  if (user.isLoading) return <Loader />
  
  return <div>{user.name}</div>
}

// ✅ Правильно - логические операторы
{isVisible && <Component />}
{error && <ErrorMessage error={error} />}

// ❌ Неправильно - сложные тернарные операторы
{condition1 ? (condition2 ? <A /> : <B />) : (condition3 ? <C /> : <D />)}
```

### Списки и ключи

```typescript
// ✅ Правильно
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}

// ❌ Неправильно
{users.map((user, index) => (
  <UserCard key={index} user={user} /> // index нестабилен
))}
```

---

## Стилизация

### Tailwind CSS

#### Использование классов

```typescript
// ✅ Правильно
<div className="flex items-center gap-4 p-6 bg-card rounded-lg">
  <span className="text-lg font-semibold">Title</span>
</div>

// ❌ Неправильно - инлайн стили
<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
```

#### Условные классы

```typescript
// ✅ Правильно - используем cn()
import { cn } from '../utils/cn'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' && 'primary-class',
  className
)}>

// ❌ Неправильно
<div className={`base-class ${isActive ? 'active-class' : ''}`}>
```

#### Группировка классов

Группируйте классы логически:
1. Layout (flex, grid, position)
2. Spacing (padding, margin, gap)
3. Sizing (width, height)
4. Typography (text, font)
5. Colors (bg, text, border)
6. Effects (shadow, opacity, transition)

```typescript
// ✅ Правильно
<div className={cn(
  // Layout
  'flex items-center justify-between',
  // Spacing
  'p-6 gap-4',
  // Sizing
  'w-full',
  // Colors
  'bg-card border border-border',
  // Effects
  'rounded-lg shadow-sm transition-all'
)}>
```

---

## Производительность

### Оптимизация рендеринга

```typescript
// ✅ Правильно - React.memo для дорогих компонентов
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{/* сложный рендеринг */}</div>
})

// ❌ Неправильно - мемоизация простых компонентов
export const SimpleComponent = React.memo(({ text }: Props) => {
  return <div>{text}</div> // Не нужно
})
```

### Избегайте создания объектов в render

```typescript
// ✅ Правильно
const styles = useMemo(() => ({
  width: '100%',
  height: '200px',
}), [])

// ❌ Неправильно
function Component() {
  return <div style={{ width: '100%', height: '200px' }}> // Новый объект каждый render
}
```

### Ленивая загрузка

```typescript
// ✅ Правильно - lazy loading для больших компонентов
const HeavyComponent = React.lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

---

## Безопасность

### XSS защита

```typescript
// ✅ Правильно - React автоматически экранирует
<div>{userInput}</div>

// ❌ Неправильно - dangerouslySetInnerHTML без санитизации
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Валидация данных

```typescript
// ✅ Правильно
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function handleSubmit(data: FormData) {
  if (!validateEmail(data.email)) {
    throw new Error('Invalid email')
  }
  // ...
}
```

### Хранение чувствительных данных

```typescript
// ✅ Правильно - не храним пароли в localStorage
// Используем токены с истечением срока действия

// ❌ Неправильно
localStorage.setItem('password', password) // Никогда!
```

---

## Тестирование

### Структура тестов

```typescript
// ✅ Правильно
describe('UserCard', () => {
  it('отображает имя пользователя', () => {
    const user = { id: '1', name: 'John' }
    render(<UserCard user={user} />)
    expect(screen.getByText('John')).toBeInTheDocument()
  })
  
  it('вызывает onEdit при клике', () => {
    const onEdit = jest.fn()
    const user = { id: '1', name: 'John' }
    render(<UserCard user={user} onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onEdit).toHaveBeenCalledWith(user)
  })
})
```

### Принципы тестирования

1. Тестируйте поведение, а не реализацию
2. Один тест = один сценарий
3. Используйте описательные имена тестов
4. Избегайте тестирования деталей реализации

---

## Документация

### JSDoc для функций

```typescript
/**
 * Вычисляет общую стоимость товаров в корзине
 * 
 * @param items - Массив товаров в корзине
 * @returns Общая стоимость в рублях
 * @throws {Error} Если массив пуст
 * 
 * @example
 * const total = calculateTotal([
 *   { price: 100, quantity: 2 },
 *   { price: 50, quantity: 1 }
 * ])
 * // Returns: 250
 */
export function calculateTotal(items: CartItem[]): number {
  if (items.length === 0) {
    throw new Error('Корзина пуста')
  }
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
```

### README для компонентов

Для сложных компонентов создавайте README:

```markdown
# UserCard

Компонент для отображения карточки пользователя.

## Props

- `user: User` - Объект пользователя
- `onEdit?: (user: User) => void` - Callback при редактировании
- `className?: string` - Дополнительные CSS классы

## Примеры

\`\`\`tsx
<UserCard 
  user={{ id: '1', name: 'John' }}
  onEdit={(user) => console.log(user)}
/>
\`\`\`
```

---

## Git workflow

### Commit messages

Формат: `тип(область): описание`

```bash
feat(auth): добавить форму входа
fix(profile): исправить отображение аватара
refactor(components): вынести логику в хук useRole
style(ui): форматировать код через Prettier
docs(readme): обновить документацию
test(utils): добавить тесты для formatDate
chore(deps): обновить зависимости
```

### Типы коммитов

- `feat`: Новая функциональность
- `fix`: Исправление бага
- `refactor`: Рефакторинг кода
- `style`: Форматирование, стили
- `docs`: Документация
- `test`: Тесты
- `chore`: Рутинные задачи (deps, config)
- `perf`: Улучшение производительности
- `ci`: CI/CD изменения

### Branch naming

```bash
feature/user-profile
fix/login-error
refactor/role-selector
hotfix/critical-bug
```

---

## Чеклист перед коммитом

- [ ] Код проходит линтер (`npm run lint`)
- [ ] Код отформатирован (`npm run format`)
- [ ] TypeScript компилируется без ошибок (`npm run build`)
- [ ] Нет `console.log` в production коде
- [ ] Нет закомментированного кода
- [ ] Все типы экспортированы правильно
- [ ] Компоненты не превышают 300 строк
- [ ] Нет дублирования кода
- [ ] Имена переменных/функций описательные
- [ ] Добавлены комментарии для сложной логики

---

## Полезные команды

```bash
# Форматирование
npm run format

# Проверка форматирования
npm run format:check

# Линтинг
npm run lint

# Автоисправление линтера
npm run lint:fix

# Сборка
npm run build

# Разработка
npm run dev
```

---

## Дополнительные ресурсы

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

