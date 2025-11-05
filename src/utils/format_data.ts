import data from '../const/data'
import type { PRICE_LIST } from '../const/chart'

export function getDateList() {
  return data.map((item) => item[0])
}

export function getCityNewValues(cityName: keyof (typeof data)[number][1]['new']) {
  const result: PRICE_LIST = [
    [
      data[0][1].new[cityName],
      data[0][1].new[cityName],
      data[0][1].new[cityName],
      data[0][1].new[cityName],
    ],
  ]
  data.forEach((item, index) => {
    if (index === 0) {
      return
    }
    const currData = item[1].new[cityName]
    const prevClosingPrice = result[index - 1]![1]
    const currClosingPrice = Number(((currData / 100) * prevClosingPrice).toFixed(3))
    result.push([
      prevClosingPrice,
      currClosingPrice,
      Math.min(prevClosingPrice, currClosingPrice),
      Math.max(prevClosingPrice, currClosingPrice),
    ])
  })

  return result
}

export function getCitySecondValues(cityName: keyof (typeof data)[number][1]['second']) {
  const result: PRICE_LIST = [
    [
      data[0][1].second[cityName],
      data[0][1].second[cityName],
      data[0][1].second[cityName],
      data[0][1].second[cityName],
    ],
  ]
  data.forEach((item, index) => {
    if (index === 0) {
      return
    }
    const currData = item[1].second[cityName]
    const prevClosingPrice = result[index - 1]![1]
    const currClosingPrice = Number((((currData - 100) / 100 + 1) * prevClosingPrice).toFixed(3))
    result.push([
      prevClosingPrice,
      currClosingPrice,
      Math.min(prevClosingPrice, currClosingPrice),
      Math.max(prevClosingPrice, currClosingPrice),
    ])
  })

  return result
}

export function getMaxVal(values: PRICE_LIST) {
  let maxRes = -1
  values.forEach((item) => {
    maxRes = Math.max(...item, maxRes)
  })
  return maxRes
}

export function calculateMA(dayCount: number, values: PRICE_LIST) {
  const result = []
  const dateList = getDateList()
  for (let i = 0; i < dateList.length; i++) {
    if (i < dayCount - 1) {
      result.push('-') // 前几天无均线数据，显示为空（或 null）
      continue
    }
    let sum = 0
    for (let j = 0; j < dayCount; j++) {
      sum += values[i - j]![1]! // 收盘价位置是数据数组中索引1
    }
    result.push((sum / dayCount).toFixed(2))
  }
  return result
}
