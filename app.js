// var express = require('express');
// var app = express();
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
// const router = express.Router();
// const csv = require('csvtojson');
// const fs = require('fs');
// var sem = require('semaphore')(2);
// const xlsx = require('node-xlsx');
// var parse = require('csv-parse');
// // const {
// //     ReadStream, WriteStream,
// //     SyncReadStream, SyncWriteStream,

// //     createReadStream, createWriteStream,
// //     createSyncReadStream, createSyncWriteStream
// // } = require('fs-stream-sync');
// // import * as fs from "fs-extra";
// // import * as FsStream from "fs-stream-sync";
// // router.get('/', function (req, res) {
// //     res.send('Hello World');
// // })

// async function func1(firstMonth, currentTransIndex, listOfExistTrans, insertRows, rows, firstMonthIndex, months) {
//     await fs.createReadStream(`csv/${firstMonth}.csv`)
//         .pipe(parse.parse(({ delimiter: ';' })))
//         .on('data', (element) => {
//             console.log("firstMonth2", firstMonth)
//             // data.push(r);
//             if (element[0] !== 'Date') {
//                 var dayIndex = parseInt(element[0].split('-')[0]) - 1
//                 if (!listOfExistTrans[dayIndex].has(element[3])) {//if transaction id does not exists in the same day
//                     insertRows.push(element.join(";"))//add row to write in final doc 
//                     // console.log("listOfExistTrans", listOfExistTrans[dayIndex])
//                     listOfExistTrans[parseInt(dayIndex) - 1].set(element[3], element)
//                     // console.log("element", element)
//                 }
//             }
//         }).on('end', () => {
//             if (rows[currentTransIndex][0] != "Printed On" && rows[currentTransIndex][0] != "Printed By") {
//                 var currentRowDate = rows[currentTransIndex][0].split('-')
//                 console.log("rows[currentTransIndex][0].split('-')", rows[currentTransIndex][0].split('-'))
//             }
//             // console.log("currentRowDate[1]", currentRowDate[1])
//             // console.log("months[firstMonthIndex]", months[firstMonthIndex])
//             while (currentRowDate[1] == months[firstMonthIndex]) {
//                 console.log("parseInt(currentRowDate[0]) - 1", parseInt(currentRowDate[0]) - 1)//3
//                 // console.log("listOfExistTrans[parseInt(currentRowDate[0]) - 1]", listOfExistTrans[parseInt(currentRowDate[0]) - 1].get())
//                 for await (const [key, value] of listOfExistTrans[parseInt(currentRowDate[0]) - 1]) {
//                     console.log("key and value of map", key + ' = ' + value)
//                 }
//                 console.log("rows[currentTransIndex][3]", rows[currentTransIndex][3])
//                 if (!listOfExistTrans[parseInt(currentRowDate[0]) - 1].has(rows[currentTransIndex][3])) {
//                     insertRows.push(rows[currentTransIndex].join(";"))
//                     // console.log("insertRows", insertRows)
//                     listOfExistTrans[parseInt(currentRowDate[0]) - 1].set(rows[currentTransIndex][3], rows[currentTransIndex])
//                     console.log("rows[currentTransIndex]", rows[currentTransIndex])
//                 }
//                 currentTransIndex++;
//                 console.log("currentTransIndex", currentTransIndex)
//                 currentRowDate = rows[currentTransIndex][0].split('-')
//                 console.log("currentRowDate", currentRowDate)
//             }
//             insertRowsString = 'Date;Value Date;Transaction Description 1;Transaction Description 2;Debit;Credit;Running Balance\n'
//             for (var j = 0; j < insertRows.length; j++) {
//                 insertRowsString += (insertRows[j] + '\n')
//             }
//             // write new csv\update exist csv in drive by insertRows list
//             fs.writeFile(`csv/${firstMonth}.csv`, insertRowsString, function (err) {
//                 if (err) {
//                     // I'd prefer to call "reject" here and add try/catch outside for sending 400
//                     return resolve(res.status(400).send({ 'error': err }));
//                 }
//                 console.log(`${firstMonth}.csv was saved in the current directory!`);
//                 // resolve();
//             });
//         })
// }
// const parser = async (req, res) => { }
// app.post('/upload', upload.single('singleFile'), async (req, res) => {//new file
//     var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
//         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     console.log(`new upload = ${req.file.filename}\n`);
//     console.log(req.file);
//     res.json({ msg: 'Upload Works' });
//     let csvFilePath = req.file.path;
//     let fileType = req.file.mimetype;
//     const convertToCSV = async _ => {
//         return new Promise((resolve, reject) => {
//             if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
//                 fileType === 'application/vnd.ms-excel') {
//                 let obj = xlsx.parse(csvFilePath);//convert to CSV
//                 let rows = [];
//                 let writeStr = "";

//                 for (let i = 0; i < obj.length; i++) {
//                     let sheet = obj[i];
//                     for (let j = 0; j < sheet['data'].length; j++) {
//                         rows.push(sheet['data'][j]);
//                     }
//                 }
//                 //creates the csv string to write it to a file
//                 for (let i = 5; i < rows.length - 2; i++) {
//                     writeStr += rows[i].join(";") + "\n";//delimiter - ';'
//                 }
//                 let firstMonth = rows[6][0].split('-')
//                 let firstMonthIndex = months.indexOf(firstMonth[1])
//                 let year = firstMonth[2]
//                 firstMonth = String(firstMonthIndex + 1) + '.' + firstMonth[2]
//                 let lastMonth = rows[rows.length - 3][0].split('-')
//                 let lastMonthIndex = months.indexOf(lastMonth[1])
//                 lastMonth = String(lastMonthIndex + 1) + '.' + lastMonth[2]
//                 let gap = 0
//                 if (lastMonthIndex >= firstMonthIndex) {
//                     gap = lastMonthIndex - firstMonthIndex + 1 //amount of months in the same year 
//                 }
//                 else {
//                     gap = 12 - firstMonthIndex + lastMonthIndex + 1
//                 }

//                 let currentTransIndex = 6;
//                 for (var i = 0; i < gap; i++) {
//                     const insertRows = []
//                     const listOfExistTrans = [];
//                     for (var k = 0; k < 31; k++) {
//                         listOfExistTrans.push(new Map());
//                     }
//                     // take the old sheet of the current month index
//                     if (fs.existsSync(`csv/${firstMonth}.csv`)) {//if there is a file for this date
//                         //read csv rows and insert to insertRows and listOfExistTrans[date.day - 1].set(trans id)
//                         console.log("firstMonth1", firstMonth)
//                         const data = []//old file data
//                         func1(firstMonth, currentTransIndex, listOfExistTrans, insertRows, rows, firstMonthIndex, months)
//                         // fs.createReadStream(`csv/${firstMonth}.csv`)
//                         //     .pipe(parse.parse(({ delimiter: ';' })))
//                         //     .on('data', (element) => {
//                         //         console.log("firstMonth2", firstMonth)
//                         //         // data.push(r);
//                         //         if (element[0] !== 'Date' && element[0] != "Printed On" && element[0] != "Printed By") {
//                         //             var dayIndex = parseInt(element[0].split('-')[0]) - 1
//                         //             if (!listOfExistTrans[dayIndex].has(element[3])) {//if transaction id does not exists in the same day
//                         //                 insertRows.push(element.join(";"))//add row to write in final doc 
//                         //                 listOfExistTrans[parseInt(dayIndex) - 1].set(element[3], element)
//                         //             }
//                         //         }
//                         //     }).on('end', () => {
//                         //         if (rows[currentTransIndex][0] != "Printed On" && rows[currentTransIndex][0] != "Printed By")
//                         //             var currentRowDate = rows[currentTransIndex][0].split('-')
//                         //         console.log("im here", currentRowDate[1])
//                         //         while (currentRowDate[1] == months[firstMonthIndex]) {
//                         //             if (!listOfExistTrans[parseInt(currentRowDate[0]) - 1].has(rows[currentTransIndex][3])) {
//                         //                 insertRows.push(rows[currentTransIndex].join(";"))
//                         //                 console.log("insertRows", insertRows)
//                         //                 listOfExistTrans[parseInt(currentRowDate[0]) - 1].set(rows[currentTransIndex][3], rows[currentTransIndex])
//                         //             }
//                         //             currentTransIndex++;
//                         //             currentRowDate = rows[currentTransIndex][0].split('-')
//                         //         }
//                         //         insertRowsString = 'Date;Value Date;Transaction Description 1;Transaction Description 2;Debit;Credit;Running Balance\n'
//                         //         for (var j = 0; j < insertRows.length; j++) {
//                         //             insertRowsString += (insertRows[j] + '\n')
//                         //         }
//                         //         // write new csv\update exist csv in drive by insertRows list
//                         //         fs.writeFile(`csv/${firstMonth}.csv`, insertRowsString, function (err) {
//                         //             if (err) {
//                         //                 // I'd prefer to call "reject" here and add try/catch outside for sending 400
//                         //                 return resolve(res.status(400).send({ 'error': err }));
//                         //             }
//                         //             console.log(`${firstMonth}.csv was saved in the current directory!`);
//                         //             resolve();
//                         //         });
//                         //     })

//                     }
//                     else {
//                         if (rows[currentTransIndex][0] != "Printed On" && rows[currentTransIndex][0] != "Printed By")
//                             var currentRowDate = rows[currentTransIndex][0].split('-')
//                         while (currentRowDate[1] == months[firstMonthIndex]) {
//                             if (!listOfExistTrans[parseInt(currentRowDate[0]) - 1].has(rows[currentTransIndex][3])) {//if the index exists in a specific date
//                                 insertRows.push(rows[currentTransIndex].join(";"))
//                                 listOfExistTrans[parseInt(currentRowDate[0]) - 1].set(rows[currentTransIndex][3], rows[currentTransIndex])
//                             }
//                             currentTransIndex++;
//                             currentRowDate = rows[currentTransIndex][0].split('-')
//                         }
//                         insertRowsString = 'Date;Value Date;Transaction Description 1;Transaction Description 2;Debit;Credit;Running Balance\n'
//                         for (var j = 0; j < insertRows.length; j++) {
//                             insertRowsString += (insertRows[j] + '\n')
//                         }
//                         // write new csv\update exist csv in drive by insertRows list
//                         fs.writeFile(`csv/${firstMonth}.csv`, insertRowsString, function (err) {
//                             if (err) {
//                                 // I'd prefer to call "reject" here and add try/catch outside for sending 400
//                                 return resolve(res.status(400).send({ 'error': err }));
//                             }
//                             console.log(`${firstMonth}.csv was saved in the current directory!`);
//                             resolve();
//                         });
//                     }
//                     firstMonthIndex++;
//                     firstMonthIndex = (firstMonthIndex) % 12
//                     if (firstMonthIndex == 0) {
//                         year = String(parseInt(year) + 1)
//                     }
//                     firstMonth = String(firstMonthIndex + 1) + '.' + year
//                 }

//             }
//         })
//     }
//     await convertToCSV().then(async _ => {
//         const jsonArray = await csv({ flatKeys: true })
//             .fromFile(csvFilePath)
//             .then(async (jsonObj) => {

//                 //Few more functions

//             }).catch(err => {
//                 return res.status(400).send(err);
//             });
//     });
// });

// var server = app.listen(8081, function () {
//     var host = server.address().address
//     var port = server.address().port

//     console.log("Example app listening at http://%s:%s", host, port)
// })