type CustomWorker = new (options?: { name?: string }) => Worker

enum WorkerState {
  Running,
  Done
}

export default class CreateWorker<T> {
  private Worker: CustomWorker
  private data: T
  private threads: number
  private workers: Worker[] = []
  private chunks: T[] = []
  private chunksLen = 0
  private index = 0
  private _onmessage: (e: MessageEvent) => void = () => {}
  private _onerror: (e: ErrorEvent) => void = (e) => {
    throw e
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _onDone: (result: any) => void = () => {}
  private state: WorkerState = WorkerState.Done
  private result: unknown[] = []
  private finishCount = 0

  private options: WorkerOptions

  constructor(
    worker: CustomWorker,
    data: T,
    option?: WorkerOptions,
    threads = 3
  ) {
    this.Worker = worker
    this.data = data
    this.options = option ?? {}
    this.threads = threads
  }

  private next() {
    if (this.index < this.chunksLen) {
      const i = this.index
      const chunk = this.chunks[i]
      const worker = new this.Worker(this.options)
      worker.onmessage = (e) => {
        this.result[i] = e.data
        this.finishCount++
        this._onmessage(e)
        worker.terminate()
        if (this.finishCount === this.chunksLen) {
          this.state = WorkerState.Done
          this._onDone(this.result.flat())
        } else {
          this.next()
        }
      }
      worker.onerror = this._onerror
      worker.postMessage(chunk)
      this.workers.push(worker)
      this.index++
    }
  }

  split(callback: (data: T) => T[]) {
    this.chunks = callback(this.data)
    this.chunksLen = this.chunks.length
  }

  onmessage<K = unknown>(callback: (e: MessageEvent<K>) => void) {
    this._onmessage = callback
  }

  onerror(callback: (e: ErrorEvent) => void) {
    this._onerror = (e) => {
      this.state = WorkerState.Done
      this.terminate()
      callback(e)
    }
  }

  onDone<K = unknown>(callback: (result: K) => void) {
    this._onDone = callback
  }

  terminate() {
    for (const worker of this.workers) {
      worker.terminate()
    }
  }

  start() {
    if (this.state === WorkerState.Running) return
    this.state = WorkerState.Running
    this.finishCount = 0

    if (this.chunksLen === 0) {
      this.split((data) => [data])
    }

    for (; this.index < this.threads; this.index++) {
      if (this.index >= this.chunksLen) break

      const i = this.index

      const chunk = this.chunks[i]
      const worker = new this.Worker(this.options)
      worker.onmessage = (e) => {
        this.result[i] = e.data
        this.finishCount++
        this._onmessage(e)
        worker.terminate()
        if (this.finishCount === this.chunksLen) {
          this.state = WorkerState.Done
          this._onDone(this.result.flat())
        } else {
          this.next()
        }
      }
      worker.onerror = this._onerror
      worker.postMessage(chunk)
      this.workers.push(worker)
    }
  }
}
