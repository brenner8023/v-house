export const cityList = [
  '北京',
  '深圳',
  '上海',
  '广州',
  '成都',
  '杭州',
  '长沙',
  '武汉',
  '三亚',
  // '南京',
]

// 开盘价、收盘价、最低价、最高价
export type PRICE_LIST = [number, number, number, number][]

export const getChartOptions = (
  dateList: string[],
  values: PRICE_LIST,
  ma5: string[],
  ma10: string[],
  title: string,
) => ({
  title: {
    text: title,
    left: 10,
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    },
  },
  xAxis: {
    type: 'category',
    data: dateList,
    scale: true,
    boundaryGap: false,
    axisLine: { onZero: false },
    splitLine: { show: false },
    min: 'dataMin',
    max: 'dataMax',
  },
  yAxis: {
    scale: true,
    splitArea: {
      show: true,
    },
  },
  series: [
    {
      name: 'MA5',
      type: 'line',
      data: ma5,
      smooth: true,
      lineStyle: {
        opacity: 0.7,
        width: 1,
      },
      showSymbol: false,
      itemStyle: {
        color: '#FF6E27',
      },
    },
    {
      name: 'MA10',
      type: 'line',
      data: ma10,
      smooth: true,
      lineStyle: {
        opacity: 0.7,
        width: 1,
      },
      showSymbol: false,
      itemStyle: {
        color: '#cc76d1',
      },
    },
    {
      name: 'K线',
      type: 'candlestick',
      data: values,
      itemStyle: {
        color: '#FD1050',
        color0: '#0CF49B',
        borderColor: '#FD1050',
        borderColor0: '#0CF49B',
      },
    },
  ],
})
