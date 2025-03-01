export type MenuItem = {
  label: string
  type?:
    | 'normal'
    | 'separator'
    | 'submenu'
    | 'checkbox'
    | 'radio'
    | 'remaining'
    | 'all remaining'
  submenu?: MenuItem[]
  command?: string
}
