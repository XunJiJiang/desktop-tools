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
  menu?: {
    file?: {
      autoSave?: boolean
    }
    view?: {
      primarySidebar?: boolean
      auxiliarySidebar?: boolean
      statusBar?: boolean
      panel?: boolean
      thumbnail?: boolean
      autoLineBreak?: boolean
    }
  }
}
