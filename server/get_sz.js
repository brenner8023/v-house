import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import { SZ_DISTRICT_MAP } from './const.js'

const outputDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'cache_sz')
const BASE_URL = 'https://fdc.zjj.sz.gov.cn'
const API_URL = `${BASE_URL}/szfdcscjy/esf/publicity/getHouseSourcelibraryList`

const DEFAULT_BODY = {
  buildAreaMax: null,
  buildAreaMin: null,
  district: 4,
  houseUsage: null,
  pageIndex: 1,
  pageSize: 100,
  priceMax: null,
  priceMin: null,
  dateSort: 1,
  name: '',
  houseStatus: null,
}

function execCurl(url, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body)
    const command = `curl -k -X POST "${url}" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -H "Referer: ${BASE_URL}/szfdcscjy/" \
      -H "X-Requested-With: XMLHttpRequest" \
      -d '${bodyStr}'`

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`curl error: ${error.message}`))
        return
      }
      // if (stderr) {
      //   console.warn('curl stderr:', stderr)
      // }
      try {
        const data = JSON.parse(stdout)
        resolve(data)
      } catch (e) {
        reject(new Error(`JSON parse error: ${e.message}, raw: ${stdout}`))
      }
    })
  })
}

async function fetchHouseData(districtCode, pageIndex = 1, pageSize = 100, retry = true) {
  const body = { ...DEFAULT_BODY, district: districtCode, pageIndex, pageSize }

  try {
    const data = await execCurl(API_URL, body)
    return data
  } catch (error) {
    console.error('Fetch failed:', error.message)
    if (retry) {
      console.log(`Retrying page ${pageIndex}...`)
      return fetchHouseData(districtCode, pageIndex, pageSize, false)
    }
    throw error
  }
}

async function getMaxPages(districtCode) {
  const result = await fetchHouseData(districtCode, 1, 100)
  return Math.ceil(result.data.total / 50)
}

async function fetchAllPagesForDistrict(districtName, districtCode, maxPages = 10) {
  const allData = []
  const idSet = new Set()
  let totalPage = maxPages
  let stopped = false

  async function fetchPage(pageNum) {
    try {
      // console.log(`${districtName}: Fetching page ${pageNum}...`)
      const result = await fetchHouseData(districtCode, pageNum, 100)

      if (!result?.data?.list || result.data.list.length === 0) {
        console.log(`${districtName}: Page ${pageNum} returned no data, stopping.`)
        stopped = true
        return
      }
      const filteredItems = result.data.list.filter((item) => !idSet.has(item.id))
      idSet.add(...filteredItems.map((item) => item.id))
      allData.push(
        ...filteredItems.map((item) => ({
          averagePriceTotal: item.averagePriceTotal,
          buildInArea: item.buildInArea,
          houseUsageSplice: item.houseUsageSplice,
          hxTypeStr: item.hxTypeStr,
          priceStr: item.priceStr,
          projectName: item.projectName,
          id: item.id,
        })),
      )
      console.log(`${districtName}: Page ${pageNum} fetched: ${filteredItems.length} items`)
    } catch (error) {
      console.error(`${districtName}: Failed to fetch page ${pageNum}:`, error.message)
    }
  }

  let pendingReqs = []
  let i = 1
  while (i <= maxPages && !stopped) {
    pendingReqs.push(fetchPage(i))
    i++
    if (i % 20 === 0) {
      await Promise.all(pendingReqs)
      await new Promise((resolve) => setTimeout(resolve, 200))
      pendingReqs = []
    }
  }
  await Promise.all(pendingReqs)
  console.log(`${districtName}: Reached total pages: ${totalPage}`)
  return allData
}

function saveDataToFile(data, districtName) {
  const filename = `${districtName}.json`
  const outputPath = path.join(outputDir, filename)

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8')
    console.log(`Data saved to ${outputPath}`)
    return outputPath
  } catch (error) {
    console.error('Failed to save data:', error.message)
    throw error
  }
}

async function fetchSingleDistrict(districtName, districtCode, maxPagesPerDistrict) {
  try {
    const districtData = await fetchAllPagesForDistrict(
      districtName,
      districtCode,
      maxPagesPerDistrict,
    )

    if (districtData.length > 0) {
      return {
        districtName,
        data: districtData,
        result: {
          success: true,
          count: districtData.length,
        },
      }
    } else {
      console.log(`No data fetched for ${districtName}.`)
      return {
        districtName,
        data: null,
        result: {
          success: false,
          count: 0,
          error: 'No data fetched',
        },
      }
    }
  } catch (error) {
    console.error(`Failed to fetch ${districtName}:`, error.message)
    return {
      districtName,
      data: null,
      result: {
        success: false,
        count: 0,
        error: error.message,
      },
    }
  }
}

async function fetchAllDistricts() {
  const results = {}
  const allData = {}

  for (const [districtName, districtCode] of Object.entries(SZ_DISTRICT_MAP)) {
    const { data, result } = await fetchSingleDistrict(
      districtName,
      districtCode,
      await getMaxPages(districtCode),
    )
    console.log(`\n========== Saving data for ${districtName} ==========`)
    saveDataToFile(data, districtName)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (data) {
      allData[districtName] = data
      result.file = `${districtName}.json`
    }
    results[districtName] = result
  }

  return { results, allData }
}

function printSummary(results) {
  console.log('\n========== Fetch Summary ==========')

  for (const [district, result] of Object.entries(results)) {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${district}: ${result.count} items`)
  }
  console.log('===================================')
}

async function main() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log('Starting to fetch Shenzhen house data...')

  let results, allData
  try {
    const fetched = await fetchAllDistricts()
    results = fetched.results
    allData = fetched.allData
  } catch (error) {
    console.error('fetchAllDistricts failed:', error.message)
    process.exit(1)
  }

  console.log('Fetch completed, results:', JSON.stringify(results))
  console.log('allData keys:', Object.keys(allData))

  printSummary(results)

  console.log('===================================')
  console.log('Fetch completed!')
}

main()
