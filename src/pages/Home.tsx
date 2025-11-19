import { getStoredRole } from '../utils/storage'

function Home() {
  const role = getStoredRole()

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Добро пожаловать в Resta</h1>
        <p className="text-lg text-muted-foreground">
          Ваша роль:{' '}
          {role === 'chef' ? 'Повар / Официант' : role === 'venue' ? 'Заведение' : 'Поставщик'}
        </p>
      </div>
    </div>
  )
}

export default Home
