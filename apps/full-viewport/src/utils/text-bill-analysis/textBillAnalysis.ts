/**
 * Worker
 */

interface Item {
  content: string
  count: string
  price: string
}

interface Transaction {
  datetime: number // 从 1970-01-01 00:00:00 UTC 算起的秒数
  status: number
  totalAmount: string
  account: string
  items: Item[]
}

onmessage = (e) => {
  const text = e.data
  const transactions = textBillAnalysis(text)
  postMessage(transactions)
}

function textBillAnalysis(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n')

  for (const _line of lines) {
    const lineWithoutComment = _line.split('--')[0]
    const line = lineWithoutComment.trim()
    if (line === '') continue

    const parts = line.split(/\s+/)
    if (parts.length < 3) continue

    const dateParts = parts[0].split('/')
    if (!dateParts || dateParts.length !== 3) continue

    const year = dateParts[0]
    const month = dateParts[1].padStart(2, '0')
    const day = dateParts[2].padStart(2, '0')
    const date = `${year}/${month}/${day}`

    const timeParts = parts[1].split(':')
    if (!timeParts || timeParts.length !== 2) continue

    const hour = timeParts[0].padStart(2, '0')
    const minute = timeParts[1].padStart(2, '0')
    const time = `${hour}:${minute}`

    const datetime = new Date(`${date} ${time}`).getTime() / 1000

    const status =
      line.includes('收入') || line.includes('退款') || line.includes('转入')
        ? 1
        : line.includes('当前余额')
          ? 2
          : 0

    const unit = parts[parts.length - 1]
    if (unit !== '元') continue

    const totalAmount = parseFloat(parts[parts.length - 2]).toFixed(2)

    const account = line.includes('微信零钱')
      ? '微信零钱'
      : line.includes('支付宝余额')
        ? '支付宝余额'
        : line.includes('建行')
          ? '建设银行'
          : '中国银行'

    const items: Item[] = []

    const partsFiltered = line
      .split(' - ')[1]
      ?.split(' : ')[0]
      ?.split(/\s+/)
      .filter(
        (x) =>
          !['微信零钱', '支付宝余额', '建行', '收入', '退款', '转入'].includes(
            x
          )
      )
      .map((x) => x.trim())

    if (partsFiltered.length === 0) {
      items.push({ content: '收入', count: '1', price: 'null' })
    }

    const n = partsFiltered.length
    for (const part of partsFiltered) {
      const cleanedPart = part
        .replace(/(微信零钱|支付宝余额|建行|收入|退款|转入)/g, '')
        .trim()
      if (cleanedPart === '') continue

      const itemParts = cleanedPart.split('x')
      const content = itemParts[0] || ''
      const count = Math.max(parseInt(itemParts[1] || '1', 10), 1).toString()

      items.push({
        content: content.replace(/\\/g, ' '),
        count,
        price: n === 1 ? totalAmount : 'null'
      })
    }

    transactions.push({
      datetime,
      status,
      totalAmount,
      account,
      items
    })
  }
  return transactions
}
