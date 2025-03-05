/**
 * Command type
 * 'run' - 直接执行
 * 'fill' - 填充到输入框
 * 'info' - 仅显示信息
 */
export type CommentType = 'run' | 'fill' | 'info'

export type Comment = {
  command: string
  comment: string
  type: CommentType
}
