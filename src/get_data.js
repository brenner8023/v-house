/**
 * x年x月份70个大中城市商品住宅销售价格变动情况
 */

function addData(tableCurrent) {
  const result = {}
  Array.from(tableCurrent.querySelectorAll('tr>td')).forEach(($td) => {
    const text = $td.textContent
    const flag =
      (text.includes('三') && text.includes('亚'))
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
