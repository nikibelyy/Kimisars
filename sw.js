self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open('sos').then(cache=>{
      return cache.addAll([
        './',
        './index.html',
        './siren.mp3',
        './icon.png'
      ])
    })
  )
})
