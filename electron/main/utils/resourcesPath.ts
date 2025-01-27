import { join } from 'node:path'

export const resourcesPath = () =>
  join(
    ...(process.env.NODE_ENV === 'development'
      ? [process.env.PWD ?? '']
      : [process.resourcesPath, 'app.asar']),
    'resources'
  )
