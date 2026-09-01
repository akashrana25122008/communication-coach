import { useEffect, useState } from 'react'

export function useDemoResource<T>(fetcher: () => Promise<T>): {
  data: T | null
  loading: boolean
  error: boolean
  reload: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [fetcher, tick])

  const reload = () => {
    setLoading(true)
    setError(false)
    setTick((t) => t + 1)
  }

  return { data, loading, error, reload }
}
