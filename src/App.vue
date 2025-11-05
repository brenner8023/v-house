<template>
  <div class="city-wrapper">
    <div v-for="city in cityList" :key="city" :class="getCityBtnCls(city)" @click="handleBtnClick(city)">{{ city }}
    </div>
  </div>
  <ChartHouse :values="valuesSecond" :title="titleSecond" />
  <ChartHouse :values="valuesNew" :title="titleNew" />
</template>

<script setup lang="ts" name="chart-container">
import { computed, ref } from 'vue'

import { cityList } from './const/chart'
import { getCityNewValues, getCitySecondValues, getMaxVal } from './utils/format_data'

import ChartHouse from './components/chart_house.vue'

const currentCity = ref('深圳')
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const valuesNew = computed(() => getCityNewValues(currentCity.value))
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const valuesSecond = computed(() => getCitySecondValues(currentCity.value))
const titleNew = computed(() => {
  const arr = valuesNew.value
  const maxVal = getMaxVal(arr)
  const currVal = arr[arr.length - 1]![1]
  const val = ((currVal - maxVal) / maxVal * 100).toFixed(2)
  return `${currentCity.value}-新建商品住宅销售价格指数-K线图 (距最高点涨跌幅: ${val}%)`
})
const titleSecond = computed(() => {
  const arr = valuesSecond.value
  const maxVal = getMaxVal(arr)
  const currVal = arr[arr.length - 1]![1]
  const val = ((currVal - maxVal) / maxVal * 100).toFixed(2)
  return `${currentCity.value}-二手住宅销售价格指数-K线图 (距最高点涨跌幅: ${val}%)`
})

const getCityBtnCls = (city: string) => {
  return {
    'city-btn': true,
    'city-btn-selected': currentCity.value === city
  }
}

const handleBtnClick = (city: string) => {
  currentCity.value = city
}
</script>

<style scoped>
.city-wrapper {
  display: flex;
  gap: 10px;
}

.city-btn {
  border: 1px solid #ccc;
  padding: 4px 8px;
  border-radius: 2px;
}

.city-btn-selected {
  background-color: #f4f6fa;
  border-color: #f4f6fa;
}

.city-btn:hover {
  cursor: pointer;
  background-color: #f4f6fa;
  border-color: #f4f6fa;
}
</style>
