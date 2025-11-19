# Руководство по интеграции новостей из внешних источников

## Варианты получения новостей

### 1. **News API (newsapi.org)**
Популярный сервис для получения новостей из различных источников.

**Преимущества:**
- Бесплатный план (100 запросов/день)
- Множество источников
- Простой REST API
- Поддержка фильтрации по категориям, языку, стране

**Пример использования:**
```typescript
// src/services/newsApi.ts
const NEWS_API_KEY = 'your-api-key-here'
const NEWS_API_URL = 'https://newsapi.org/v2'

export async function fetchNews() {
  const response = await fetch(
    `${NEWS_API_URL}/everything?q=restaurant OR catering OR horeca&language=ru&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
  )
  const data = await response.json()
  return data.articles
}
```

**Регистрация:** https://newsapi.org/register

---

### 2. **RSS Feed**
Многие новостные сайты предоставляют RSS-ленты бесплатно.

**Преимущества:**
- Бесплатно
- Не требует API ключей
- Много источников

**Недостатки:**
- Нужен парсер RSS
- Может быть нестабильным

**Пример использования с библиотекой:**
```bash
npm install rss-parser
```

```typescript
// src/services/rssService.ts
import Parser from 'rss-parser'

const parser = new Parser()

export async function fetchRSSNews() {
  const feeds = [
    'https://www.restoran.ru/rss/',
    'https://www.horeca.ru/rss/',
    // другие RSS источники
  ]
  
  const allNews = []
  for (const feed of feeds) {
    try {
      const feedData = await parser.parseURL(feed)
      allNews.push(...feedData.items)
    } catch (error) {
      console.error(`Ошибка загрузки ${feed}:`, error)
    }
  }
  
  return allNews
}
```

---

### 3. **Meduza.io API**
Российский новостной агрегатор с открытым API.

**Пример:**
```typescript
export async function fetchMeduzaNews() {
  const response = await fetch('https://meduza.io/api/v3/search?chrono=news&locale=ru&page=0&per_page=10')
  const data = await response.json()
  return data.documents
}
```

---

### 4. **Reddit API**
Можно получать новости из тематических сабреддитов.

**Пример:**
```typescript
export async function fetchRedditNews() {
  const response = await fetch('https://www.reddit.com/r/restaurantowners/hot.json?limit=10')
  const data = await response.json()
  return data.data.children.map(item => item.data)
}
```

---

## Рекомендуемая реализация для вашего проекта

### Вариант 1: News API (рекомендуется для начала)

1. **Установите зависимости:**
```bash
npm install axios
```

2. **Создайте сервис:**
```typescript
// src/services/newsService.ts
import axios from 'axios'

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || ''
const NEWS_API_URL = 'https://newsapi.org/v2'

export interface NewsItem {
  id: string
  title: string
  description: string
  date: string
  imageUrl: string
  url?: string
}

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const response = await axios.get(`${NEWS_API_URL}/everything`, {
      params: {
        q: 'ресторан OR кафе OR бар OR HoReCa',
        language: 'ru',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: NEWS_API_KEY,
      },
    })

    return response.data.articles.map((article: any, index: number) => ({
      id: `news-${index}`,
      title: article.title || '',
      description: article.description || '',
      date: new Date(article.publishedAt).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      imageUrl: article.urlToImage || 'https://via.placeholder.com/400x300',
      url: article.url,
    }))
  } catch (error) {
    console.error('Ошибка загрузки новостей:', error)
    return []
  }
}
```

3. **Добавьте переменную окружения:**
```env
# .env
VITE_NEWS_API_KEY=your-api-key-here
```

4. **Обновите WorkerHome:**
```typescript
import { useEffect, useState } from 'react'
import { fetchNews, type NewsItem } from '../services/newsService'

export function WorkerHome({ onNavigate }: WorkerHomeProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNews() {
      setLoading(true)
      const news = await fetchNews()
      setNewsItems(news)
      setLoading(false)
    }
    loadNews()
  }, [])

  // ... остальной код
}
```

---

### Вариант 2: Собственный бэкенд

Если хотите больше контроля, создайте свой API endpoint:

```typescript
// src/services/newsService.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function fetchNews() {
  const response = await fetch(`${API_URL}/api/news`)
  return response.json()
}
```

---

## Безопасность

⚠️ **Важно:**
- Никогда не храните API ключи в коде
- Используйте переменные окружения (`.env`)
- Для production используйте backend proxy для скрытия ключей
- Ограничьте частоту запросов (rate limiting)

---

## Пример с кэшированием

```typescript
// src/services/newsService.ts
let cachedNews: NewsItem[] | null = null
let cacheTime = 0
const CACHE_DURATION = 1000 * 60 * 30 // 30 минут

export async function fetchNews(forceRefresh = false): Promise<NewsItem[]> {
  const now = Date.now()
  
  if (!forceRefresh && cachedNews && (now - cacheTime) < CACHE_DURATION) {
    return cachedNews
  }

  const news = await fetchNewsFromAPI()
  cachedNews = news
  cacheTime = now
  
  return news
}
```

---

## Рекомендации

1. **Для начала:** Используйте News API (newsapi.org) - простой и надежный
2. **Для production:** Создайте backend proxy для безопасности
3. **Для экономии:** Используйте RSS + кэширование
4. **Для специфики:** Комбинируйте несколько источников



