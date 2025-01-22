import { onMounted, useTemplateRef } from 'vue'
import config from '@apps/utils/config'
import { setOpenData, type OpenData } from '@apps/store/modules/useWorkspace'

class DropNode {
  readonly [Symbol.toStringTag]: 'DropNode' | 'FileNode' | 'DirectoryNode' =
    'DropNode'
  constructor(
    protected _name: string,
    protected _path: string
  ) {}

  get name() {
    return this._name
  }

  get path() {
    return this._path
  }

  isFile() {
    return this instanceof FileNode
  }

  isDirectory() {
    return this instanceof DirectoryNode
  }
}

class FileNode extends DropNode {
  readonly [Symbol.toStringTag] = 'FileNode'
  async content(encoding = 'utf-8') {
    const path = this.path
    const res = await window.ipcRenderer.invoke('fs:readfile', path, {
      encoding: encoding
    })
    return res
  }
}

class DirectoryNode extends DropNode {
  readonly [Symbol.toStringTag] = 'DirectoryNode'
  get children() {
    const path = this.path
    const res = window.ipcRenderer.invoke('fs:readdir', path, {
      withFileTypes: true
    })
    return res
  }
}

export const useFileDrop = (
  dropPoint: string,
  ondrop: (files: FileNode[] | DirectoryNode) => void
) => {
  const dropPointRef = useTemplateRef<HTMLElement>(dropPoint)

  const _ondrop = (nodes: FileNode[] | DirectoryNode) => {
    const { paths, type } = ((nodes): OpenData => {
      if (nodes instanceof DirectoryNode) {
        return {
          paths: [nodes.path],
          type: 'dir'
        }
      } else {
        return {
          paths: nodes.map((node) => node.path),
          type: 'files'
        }
      }
    })(nodes)

    setOpenData(paths, type)

    ondrop(nodes)
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    const len = e.dataTransfer?.files.length ?? 0
    if (e.dataTransfer?.files && len > 0) {
      const files = e.dataTransfer.files
      const nodes = []
      for (let i = 0; i < len; i++) {
        const file = files[i]
        const path = window.ipcRenderer.getPathForFile(file)
        if ((await window.ipcRenderer.invoke('fs:stat', path)).isDirectory) {
          if (i === 0) {
            _ondrop(new DirectoryNode(file.name, path))
            if (len > 1) {
              // TODO: 提示 文件夹不支持多选
            }
            break
          }
          if (len > 1) {
            // TODO: 提示 文件夹和文件不能同时打开
            continue
          }
        } else {
          nodes.push(new FileNode(file.name, path))
        }
      }
      if (nodes.length) {
        _ondrop(nodes)
      }
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
  }

  onMounted(() => {
    const el = dropPointRef.value
    if (!el) return
    el.addEventListener('drop', handleDrop)
    el.addEventListener('dragover', handleDragOver)
    el.addEventListener('dragleave', handleDragLeave)
    el.addEventListener('dragenter', handleDragEnter)
  })

  return {}
}
