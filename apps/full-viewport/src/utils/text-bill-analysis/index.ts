import CreateWorker from '@fu/utils/CreateWorker'
import BillAnalysis from './textBillAnalysis?worker'

const cpuCoresNumber = navigator.hardwareConcurrency / 2

export default function textBillAnalysis(text: string) {
  return new Promise((resolve, reject) => {
    const worker = new CreateWorker(BillAnalysis, text, {}, cpuCoresNumber ?? 3)
    worker.split((text) => {
      const lines = text.split('\n')
      const chunks = []
      let chunk = ''
      for (const line of lines) {
        chunk += line + '\n'
        if (chunk.length > 1024 * 1024) {
          chunks.push(chunk)
          chunk = ''
        }
      }
      if (chunk.length > 0) {
        chunks.push(chunk)
      }

      return chunks
    })
    worker.onDone((e) => {
      resolve(e)
    })
    worker.onerror((e) => {
      reject(e)
    })
    worker.start()
  })
}
