;(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    document.documentElement.classList.add('reduce-motion')
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'))
    return
  }

  document.documentElement.classList.add('motion-ready')

  const revealItems = document.querySelectorAll('.reveal')
  if (!('IntersectionObserver' in window) || revealItems.length === 0) {
    revealItems.forEach((el) => el.classList.add('is-visible'))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px'
    }
  )

  revealItems.forEach((el) => observer.observe(el))
})()
