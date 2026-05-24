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
  '惠州',
]

// 开盘价、收盘价、最低价、最高价
export type PRICE_LIST = [number, number, number, number][]

export const getChartOptions = (
  dateList: string[],
  values: PRICE_LIST,
  ma5: string[],
  ma10: string[],
  title: string,
  macdData?: { dif: string[]; dea: string[]; macd: string[] },
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
  legend: {
    data: ['MA5', 'MA10', 'K线', 'DIF', 'DEA', 'MACD'],
    top: 30,
  },
  grid: [
    {
      left: 60,
      right: 60,
      top: 80,
      height: '50%',
    },
    {
      left: 60,
      right: 60,
      top: '65%',
      height: '20%',
    },
  ],
  xAxis: [
    {
      type: 'category',
      data: dateList,
      scale: true,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax',
      gridIndex: 0,
    },
    {
      type: 'category',
      data: dateList,
      scale: true,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax',
      gridIndex: 1,
    },
  ],
  yAxis: [
    {
      scale: true,
      splitArea: {
        show: true,
      },
      gridIndex: 0,
    },
    {
      scale: true,
      gridIndex: 1,
      splitNumber: 2,
    },
  ],
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
        color: 'blue',
      },
      xAxisIndex: 0,
      yAxisIndex: 0,
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
        color: '#ffca27',
      },
      xAxisIndex: 0,
      yAxisIndex: 0,
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
      xAxisIndex: 0,
      yAxisIndex: 0,
    },
    {
      name: 'DIF',
      type: 'line',
      data: macdData?.dif ?? [],
      smooth: true,
      lineStyle: {
        opacity: 0.7,
        width: 1,
      },
      showSymbol: false,
      itemStyle: {
        color: '#00bcd4',
      },
      xAxisIndex: 1,
      yAxisIndex: 1,
    },
    {
      name: 'DEA',
      type: 'line',
      data: macdData?.dea ?? [],
      smooth: true,
      lineStyle: {
        opacity: 0.7,
        width: 1,
      },
      showSymbol: false,
      itemStyle: {
        color: '#ff9800',
      },
      xAxisIndex: 1,
      yAxisIndex: 1,
    },
    {
      name: 'MACD',
      type: 'bar',
      data: macdData?.macd ?? [],
      itemStyle: {
        color: (params: { value: number }) => {
          return params.value >= 0 ? '#FD1050' : '#0CF49B'
        },
      },
      xAxisIndex: 1,
      yAxisIndex: 1,
    },
  ],
})
