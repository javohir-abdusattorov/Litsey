
const ExcelJS = require('exceljs')

// const workbook = new ExcelJS.Workbook()
// workbook.properties.date1904 = true

// const worksheet = workbook.addWorksheet('My Sheet', {
// 	properties: { tabColor:{ argb:'D40000' } },
//   pageSetup: { paperSize: 9, orientation:'landscape' }
// })

// worksheet.columns = [
//   { header: 'Id', key: 'id' },
//   { header: 'Name', key: 'name', style: { font: { name: 'Arial' } } },
//   { header: 'Email', key: 'email' }
// ];

// worksheet.addRow({
//   id: "well st",
//   name: "1800367104fw4ef4we4f8w84f8ew4f84we8f48ewf",
//   email: `GRRFEF@`
// }).commit()

// worksheet.columns.forEach(function (column, i) {
//   let maxLength = 0
//   column["eachCell"]({ includeEmpty: true }, function (cell) {
//     const columnLength = cell.value ? cell.value.toString().length : 10
//     if (columnLength > maxLength ) maxLength = columnLength * 1.25
//   })
//   column.width = maxLength < 10 ? 10 : maxLength
// })

// ;(async () => {
// 	await workbook.xlsx.writeFile(`./my.xlsx`)
// 	console.log(`D O N E !`);
// })()


module.exports = class ExelService {

  applyMaxWidthToCols = (worksheet) => {
    worksheet.columns.forEach((column, i) => {
      let maxLength = 0
      column["eachCell"]({ includeEmpty: true }, (cell) => {
        const columnLength = (cell.value ? cell.value.toString().length : 5) * 1.5
        if (columnLength > maxLength) maxLength = columnLength
      })
      column.width = maxLength < 5 ? 5 : maxLength
    })
  }

  designWorksheet = (worksheet) => {
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.font = {
          name: 'Arial',
          family: 2,
          bold: Boolean(rowNumber == 1),
          size: 11,
        }
        cell.fill = {
          type: 'pattern',
          pattern:'solid',
          fgColor: { argb: (rowNumber % 2 == 0) ? 'E7E7E7' : 'FFFFFF' },
        }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = {
          top: { style:'thin' },
          left: { style:'thin' },
          bottom: { style:'thin' },
          right: { style:'thin' }
        }
        row.height = 25
      })
    })
  }

  exportToExel = async (data, headers, req, title="Statistika") => {

    // Initilazing worksheet
    const workbook = new ExcelJS.Workbook()
    workbook.properties.date1904 = true
    const worksheet = workbook.addWorksheet(title, {
      properties: { tabColor: { argb: 'D40000' } },
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    })

    worksheet.columns = [{}, ...headers.map(item => ({ header: item.name, key: item.key, style: { font: { name: 'Arial' } } }))]
    for (const item of data) worksheet.addRow(item).commit()

    // Designing worksheet
    this.applyMaxWidthToCols(worksheet)
    this.designWorksheet(worksheet)

    // Saving and returning .xlsx file
    const date = new Date().getTime()
    await workbook.xlsx.writeFile(`./public/exel/${date}.xlsx`)

    return `${req.protocol}://${req.get('host')}/exel/${date}.xlsx`
  }

}