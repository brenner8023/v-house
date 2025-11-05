import https from 'node:https'
import fs from 'node:fs'
import * as cheerio from 'cheerio'

import { CITY_LIST, DATE_LIST } from './const.js'

/**
 * 获取网页HTML内容
 * @param {string} url - 要获取的网页URL
 * @returns {Promise<string>} - 返回HTML内容
 */
async function getHtmlContent(url) {
  return new Promise((resolve, reject) => {
    // 解析URL
    const urlObj = new URL(url)

    // 设置请求选项，添加适当的请求头以避免被反爬
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
    }

    // 发送请求
    const req = https.request(options, (res) => {
      let data = ''

      // 接收数据
      res.on('data', (chunk) => {
        data += chunk
      })

      // 请求完成
      res.on('end', () => {
        // 检查响应状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data)
        } else {
          reject(new Error(`请求失败: 状态码 ${res.statusCode}`))
        }
      })
    })

    // 处理错误
    req.on('error', (error) => {
      reject(error)
    })

    // 结束请求
    req.end()
  })
}

function addData(tableCurrent, $) {
  const result = {}

  $(tableCurrent)
    .find('td')
    .each((index, element) => {
      const text = $(element).text().trim().replace(/\s+/g, '')

      const flag = CITY_LIST.includes(text)
      if (flag) {
        const nextCellValue = $(element).next().text().trim()
        result[text] = Number(nextCellValue)
      }
    })

  return result
}

function getData(htmlContent) {
  try {
    const $ = cheerio.load(htmlContent)
    console.log('HTML解析成功！')

    const tableAll = $('table')
    const len = $(tableAll[0]).find('tr').length
    const tableNew = len !== 37 ? tableAll[1] : tableAll[0]
    const tableSecond = len !== 37 ? tableAll[2] : tableAll[1]

    const resultNew = addData(tableNew, $)
    const resultSecond = addData(tableSecond, $)

    return { new: resultNew, second: resultSecond }
  } catch (error) {
    console.error('获取网页内容失败:', error.message)
    // 输出详细错误信息以便调试
    console.error('错误详情:', error)
  }
  return null
}

// 主函数
async function main() {
  const result = []
  await Promise.all(
    DATE_LIST.map((item, index) => {
      const [date, url] = item
      return getHtmlContent(url).then((htmlContent) => {
        result[index] = [date, getData(htmlContent)]
      })
    }),
  )
  const content = `
  export default ${JSON.stringify(result, null, 2)} as const
  `
  fs.writeFileSync('./src/const/data.ts', content)
}

// 执行主函数
main()
