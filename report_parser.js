const csv = require('csvtojson');
const fs = require('fs');
const xlsx = require('node-xlsx');
var parse = require('csv-parse');
const Mutex = require('async-mutex');

var currNewDocRow = 6;
let clientLock = new Mutex.Mutex();

async function appendNewDataToExistingFile(firstMonth, transPerMonth, insertRows, rows, firstMonthIndex, months, resolve, reject) {
    let release = await clientLock.acquire();
    console.log("oldfile")
    await fs.createReadStream(`csv/${firstMonth}.csv`)
        .pipe(parse.parse(({ delimiter: ';' })))
        .on('data', (element) => {
            // Add currently exisitng data (in exisint file) to a hashmap
            if (element[0] !== 'Date') {
                var mapIndex = parseInt(element[0].split('-')[0]) - 1
                if (!transPerMonth[mapIndex].has(element[3])) {//if transaction id does not exists in the same day
                    insertRows.push(element.join(";"))//add row to write in final doc 
                    transPerMonth[mapIndex].set(element[3], element)
                }
            }
        }).on('end', () => {
            var currRowDateElements;
            if (rows[currNewDocRow][0] != "Printed On" && rows[currNewDocRow][0] != "Printed By") {
                currRowDateElements = rows[currNewDocRow][0].split('-')
            }
            while (rows[currNewDocRow][0] != "Printed On" && rows[currNewDocRow][0] != "Printed By" && currRowDateElements[1] == months[firstMonthIndex]) {
                if (!transPerMonth[parseInt(currRowDateElements[0]) - 1].has(rows[currNewDocRow][3])) {
                    insertRows.push(rows[currNewDocRow].join(";"))
                    transPerMonth[parseInt(currRowDateElements[0]) - 1].set(rows[currNewDocRow][3], rows[currNewDocRow])
                }
                currNewDocRow++;
                currRowDateElements = rows[currNewDocRow][0].split('-')
            }
            release();
            var insertRowsString = 'Date;Value Date;Transaction Description 1;Transaction Description 2;Debit;Credit;Running Balance\n'
            for (var j = 0; j < insertRows.length; j++) {
                insertRowsString += (insertRows[j] + '\n')
            }
            // write new csv\update exist csv in drive by insertRows list
            fs.writeFile(`csv/${firstMonth}.csv`, insertRowsString, function (err) {
                if (err) {
                    // I'd prefer to call "reject" here and add try/catch outside for sending 400
                    return reject(res.status(400).send({ 'error': err }));
                }
                console.log(`${firstMonth}.csv was saved in the current directory!`);
                resolve();
            });
        })
}
async function appendNewDataToNewFile(firstMonth, listOfExistTrans, insertRows, rows, firstMonthIndex, months, resolve, reject) {
    let release = await clientLock.acquire();
    var currentRowDate;
    if (rows[currNewDocRow][0] != "Printed On" && rows[currNewDocRow][0] != "Printed By")
        currentRowDate = rows[currNewDocRow][0].split('-')
    console.log("currNewDocRow", currNewDocRow)
    console.log("== months[firstMonthIndex]", months[firstMonthIndex])
    while (rows[currNewDocRow][0] != "Printed On" && rows[currNewDocRow][0] != "Printed By" && currentRowDate[1] == months[firstMonthIndex]) {
        if (!listOfExistTrans[parseInt(currentRowDate[0]) - 1].has(rows[currNewDocRow][3])) {//if the index exists in a specific date
            insertRows.push(rows[currNewDocRow].join(";"))
            listOfExistTrans[parseInt(currentRowDate[0]) - 1].set(rows[currNewDocRow][3], rows[currNewDocRow])
        }
        currNewDocRow++;
        currentRowDate = rows[currNewDocRow][0].split('-')
    }
    release();
    var insertRowsString = 'Date;Value Date;Transaction Description 1;Transaction Description 2;Debit;Credit;Running Balance\n'
    for (var j = 0; j < insertRows.length; j++) {
        insertRowsString += (insertRows[j] + '\n')
    }
    // write new csv\update exist csv in drive by insertRows list
    await fs.writeFile(`csv/${firstMonth}.csv`, insertRowsString, function (err) {
        if (err) {
            // I'd prefer to call "reject" here and add try/catch outside for sending 400
            return reject(res.status(400).send({ 'error': err }));
        }
        console.log(`${firstMonth}.csv was saved in the current directory!`);
        resolve();
    });
}
const parser = async (req, res) => {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    console.log(`new upload = ${req.file.filename}\n`);
    console.log(req.file);
    res.json({ msg: 'Upload Works' });
    let csvFilePath = req.file.path;
    let fileType = req.file.mimetype;
    const convertToCSV = async _ => {
        return new Promise((resolve, reject) => {
            if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                fileType === 'application/vnd.ms-excel') {
                let obj = xlsx.parse(csvFilePath);//convert to CSV
                let rows = [];
                for (let i = 0; i < obj.length; i++) {
                    let sheet = obj[i];
                    for (let j = 0; j < sheet['data'].length; j++) {
                        rows.push(sheet['data'][j]);
                    }
                }
                let firstMonth = rows[6][0].split('-')
                let firstMonthIndex = months.indexOf(firstMonth[1])
                let year = firstMonth[2]
                firstMonth = String(firstMonthIndex + 1) + '.' + firstMonth[2]
                let lastMonth = rows[rows.length - 3][0].split('-')
                let lastMonthIndex = months.indexOf(lastMonth[1])
                lastMonth = String(lastMonthIndex + 1) + '.' + lastMonth[2]
                let gap = 0
                if (lastMonthIndex >= firstMonthIndex) {
                    gap = lastMonthIndex - firstMonthIndex + 1 //amount of months in the same year 
                }
                else {
                    gap = 12 - firstMonthIndex + lastMonthIndex + 1
                }

                for (var i = 0; i < gap; i++) {
                    const insertRows = []
                    const listOfExistTrans = [];
                    for (var k = 0; k < 31; k++) {
                        listOfExistTrans.push(new Map());
                    }
                    // take the old sheet of the current month index
                    if (fs.existsSync(`csv/${firstMonth}.csv`)) {//if there is a file for this date
                        //read csv rows and insert to insertRows and listOfExistTrans[date.day - 1].set(trans id)
                        const data = []//old file data
                        console.log("yes")
                        appendNewDataToExistingFile(firstMonth, listOfExistTrans, insertRows, rows, firstMonthIndex, months, resolve, reject);
                    }
                    else {
                        console.log("no")
                        appendNewDataToNewFile(firstMonth, listOfExistTrans, insertRows, rows, firstMonthIndex, months, resolve, reject);
                    }
                    firstMonthIndex++;
                    firstMonthIndex = (firstMonthIndex) % 12
                    if (firstMonthIndex == 0) {
                        year = String(parseInt(year) + 1)
                    }
                    firstMonth = String(firstMonthIndex + 1) + '.' + year
                }
            }
        }).then((result) => {
            console.log('success:', result);
        }).catch((err) => {
            console.log('got promise error:', err);
        });
    }
    await convertToCSV().then(async _ => {
        const jsonArray = await csv({ flatKeys: true })
            .fromFile(csvFilePath)
            .then(async (jsonObj) => {
                currNewDocRow = 6
                //Few more functions

            }).catch(err => {
                return res.status(400).send(err);
            });
    });
};
module.exports = {
    parser
};