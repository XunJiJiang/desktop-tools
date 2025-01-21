import usePath from './handle/path'
import useFs from './handle/fs'

const useHandle = () => {
  usePath()
  useFs()
}

const useIpc = () => {
  useHandle()
}

export default useIpc
