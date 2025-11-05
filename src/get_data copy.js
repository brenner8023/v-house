/**
 * x年x月份70个大中城市商品住宅销售价格变动情况
 */

function addData(tableCurrent) {
  const result = {}
  Array.from(tableCurrent.querySelectorAll('tr>td:first-child')).forEach(($td) => {
    const text = $td.textContent
    const flag =
      (text.includes('北') && text.includes('京')) ||
      (text.includes('上') && text.includes('海')) ||
      (text.includes('广') && text.includes('州')) ||
      (text.includes('深') && text.includes('圳')) ||
      (text.includes('成') && text.includes('都')) ||
      (text.includes('杭') && text.includes('州')) ||
      (text.includes('武') && text.includes('汉')) ||
      (text.includes('长') && text.includes('沙'))
    if (flag) {
      result[text.replace(/\s+/g, '')] = Number($td.nextElementSibling.textContent)
    }
  })
  return result
}

const tableAll = document.querySelectorAll('table')
const tableNew = tableAll[0]
const tableSecond = tableAll[1]
const resultNew = addData(tableNew)
const resultSecond = addData(tableSecond)

console.log({ new: resultNew, second: resultSecond })
