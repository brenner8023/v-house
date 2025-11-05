<template>
  <div ref="chartHouse" style="width: 100%; height: 500px;"></div>
</template>

<script setup lang="ts" name="chart-container">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

import { getChartOptions } from '../const/chart'
import type { PRICE_LIST } from '../const/chart'
import { getDateList, calculateMA } from '../utils/format_data'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  values: {
    type: Array,
    default: () => [],
  },
})

const dateList = getDateList()
let myChart: echarts.ECharts | null = null
const chartHouse = ref(null)

const option = computed(() => {
  const values = props.values as PRICE_LIST
  const ma5 = calculateMA(5, values)
  const ma10 = calculateMA(10, values)
  return getChartOptions(dateList, values, ma5, ma10, props.title)
})

onMounted(() => {
  myChart = echarts.init(chartHouse.value);

  watch(option, () => {
    myChart?.setOption(option.value);
  }, { immediate: true })

  // 自适应窗口大小
  window.addEventListener('resize', () => {
    myChart?.resize();
  })
})

onBeforeUnmount(() => {
  myChart?.dispose()

  window.removeEventListener('resize', () => {
    myChart?.resize()
  })
})
</script>
