import type { PRICE_LIST } from '../const/chart'

/**
 * 计算相对强弱指标（RSI）
 * @param {Array} dailyData - 日线数据数组
 * @param {number} period - 计算周期，默认为14
 * @returns {number} RSI值
 */
function calcRSI(dailyData: PRICE_LIST, period = 14) {
  if (!dailyData || dailyData.length < period + 1) {
    return 50 // 数据不足时返回默认值50
  }

  // 提取收盘价
  const closes = dailyData.map((item) => item[1])

  // 计算价格变化
  const changes = []
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i]! - closes[i - 1]!)
  }

  // 计算平均上涨和平均下跌
  let avgGain = 0
  let avgLoss = 0

  // 计算初始平均值
  for (let i = 0; i < period; i++) {
    if (changes[i]! > 0) {
      avgGain += changes[i]!
    } else {
      avgLoss += Math.abs(changes[i]!)
    }
  }

  avgGain /= period
  avgLoss /= period

  // 使用平滑平均计算剩余值
  for (let i = period; i < changes.length; i++) {
    const change = changes[i]!
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? Math.abs(change) : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }

  // 计算RS和RSI
  if (avgLoss === 0) {
    return 100 // 避免除以零
  }

  const rs = avgGain / avgLoss
  const rsi = 100 - 100 / (1 + rs)

  return +rsi.toFixed(2)
}

export function getRsiVal(values: PRICE_LIST) {
  const rsi6 = calcRSI(values, 6)
  const rsi12 = calcRSI(values, 12)
  const rsi18 = calcRSI(values, 18)
  return [rsi6, rsi12, rsi18].join(',')
}
