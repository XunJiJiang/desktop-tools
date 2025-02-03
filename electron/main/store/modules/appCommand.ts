// 指令包括
// 1. 查找文件指令, 文件路径, 不需要注册
//   查找相对于当前目录工作区的文件路径, 例如: ./src/index.ts
// 2. 用于全局搜索框的 > 开头的指令, 需要注册, 例如: > open
//   > 后的第一个单词为指令名称, 之后的单词为参数
//   允许扩展注册指令
// 3. 内部指令, 由内部注册
//   用于触发内部功能, 例如: 菜单项

const COMMAND_TYPE = {
  FILE: 'file',
  GLOBAL: 'global',
  INTERNAL: 'internal'
}

const useCommand = () => {}

export default useCommand
