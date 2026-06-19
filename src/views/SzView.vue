<template>
  <div class="sz-view">
    <h1>深圳各区域房价统计</h1>
    <div class="district-stats">
      <div v-for="(stat, district) in statsMap" :key="district" class="district-card">
        <h2>{{ district }}</h2>
        <div class="stat-row">
          <span class="stat-label">最大值:</span>
          <span class="stat-value">{{ formatPrice(stat.max) }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">最小值:</span>
          <span class="stat-value">{{ formatPrice(stat.min) }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">平均值:</span>
          <span class="stat-value">{{ formatPrice(stat.avg) }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">中位数:</span>
          <span class="stat-value">{{ formatPrice(stat.median) }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">样本数:</span>
          <span class="stat-value">{{ stat.count }}</span>
        </div>

        <h3 class="type-title">按户型分类统计</h3>
        <div
          v-for="(typeStat, hxType) in typeStatsMap[district]"
          :key="hxType"
          class="type-section"
        >
          <div class="type-header">{{ hxType }}</div>
          <div class="stat-row sub-stat">
            <span class="stat-label">最大值:</span>
            <span class="stat-value">{{ formatPrice(typeStat.max) }}</span>
          </div>
          <div class="stat-row sub-stat">
            <span class="stat-label">最小值:</span>
            <span class="stat-value">{{ formatPrice(typeStat.min) }}</span>
          </div>
          <div class="stat-row sub-stat">
            <span class="stat-label">平均值:</span>
            <span class="stat-value">{{ formatPrice(typeStat.avg) }}</span>
          </div>
          <div class="stat-row sub-stat">
            <span class="stat-label">中位数:</span>
            <span class="stat-value">{{ formatPrice(typeStat.median) }}</span>
          </div>
          <div class="stat-row sub-stat">
            <span class="stat-label">样本数:</span>
            <span class="stat-value">{{ typeStat.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import 南山 from '../../server/cache_sz_20260618/南山.json' with { type: 'json' }
import 宝安 from '../../server/cache_sz_20260618/宝安.json' with { type: 'json' }
import 福田 from '../../server/cache_sz_20260618/福田.json' with { type: 'json' }
import 光明 from '../../server/cache_sz_20260618/光明.json' with { type: 'json' }
import 龙岗 from '../../server/cache_sz_20260618/龙岗.json' with { type: 'json' }
import 龙华 from '../../server/cache_sz_20260618/龙华.json' with { type: 'json' }
import 罗湖 from '../../server/cache_sz_20260618/罗湖.json' with { type: 'json' }
import 坪山 from '../../server/cache_sz_20260618/坪山.json' with { type: 'json' }

interface HouseItem {
  averagePriceTotal: string
  buildInArea: string
  houseUsageSplice: string
  hxTypeStr: string
  priceStr: string
  projectName: string
  id: number
}

interface Stats {
  max: number
  min: number
  avg: number
  median: number
  count: number
}

const districtMap: Record<string, HouseItem[]> = {
  南山,
  宝安,
  福田,
  光明,
  龙岗: 龙岗 as HouseItem[],
  龙华,
  罗湖,
  坪山,
}

function getPrices(data: HouseItem[]): number[] {
  return data
    .map((item) => parseFloat(item.averagePriceTotal))
    .filter((price) => !isNaN(price) && price > 0)
}

function calculateStats(prices: number[]): Stats {
  if (prices.length === 0) {
    return { max: 0, min: 0, avg: 0, median: 0, count: 0 }
  }

  const sorted = [...prices].sort((a, b) => a - b)
  const max = sorted[sorted.length - 1] ?? 0
  const min = sorted[0] ?? 0
  const sum = prices.reduce((acc, val) => acc + val, 0)
  const avg = sum / prices.length

  let median: number
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    median = ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
  } else {
    median = sorted[mid] ?? 0
  }

  return { max, min, avg, median, count: prices.length }
}

const statsMap = Object.entries(districtMap).reduce(
  (acc, [district, data]) => {
    const prices = getPrices(data)
    acc[district] = calculateStats(prices)
    return acc
  },
  {} as Record<string, Stats>,
)

function groupByHxType(data: HouseItem[]): Record<string, HouseItem[]> {
  return data.reduce(
    (acc, item) => {
      const hxType = item.hxTypeStr || '未知'
      if (!acc[hxType]) {
        acc[hxType] = []
      }
      acc[hxType].push(item)
      return acc
    },
    {} as Record<string, HouseItem[]>,
  )
}

const typeStatsMap = Object.entries(districtMap).reduce(
  (acc, [district, data]) => {
    const grouped = groupByHxType(data)
    acc[district] = Object.entries(grouped).reduce(
      (typeAcc, [hxType, items]) => {
        const prices = getPrices(items)
        typeAcc[hxType] = calculateStats(prices)
        return typeAcc
      },
      {} as Record<string, Stats>,
    )
    return acc
  },
  {} as Record<string, Record<string, Stats>>,
)

function formatPrice(price: number): string {
  if (price === 0) return '-'
  return `${Math.round(price).toLocaleString()} 元/㎡`
}
</script>

<style scoped>
.sz-view {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
}

.district-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.district-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.district-card h2 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 18px;
  color: #333;
}

.type-title {
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 16px;
  color: #555;
  border-top: 1px solid #ddd;
  padding-top: 12px;
}

.type-section {
  margin-bottom: 12px;
  padding-left: 8px;
}

.type-header {
  font-size: 14px;
  font-weight: 600;
  color: #444;
  margin-bottom: 4px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed #eee;
}

.stat-row:last-child {
  border-bottom: none;
}

.sub-stat {
  padding: 4px 0;
  font-size: 13px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.sub-stat .stat-label {
  font-size: 13px;
}

.stat-value {
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.sub-stat .stat-value {
  font-size: 13px;
}
</style>
