export interface Settings {
  language?: string
  theme?: `${string}:${string}`
  'bg-transparency'?: false | number
  'title-bar'?: {
    style?: 'windows' | 'macos'
  }
  workspace?: {
    path?: string
  }
}
