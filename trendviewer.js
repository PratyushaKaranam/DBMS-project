/* summary data from server */
var financialSummaryData;

//temporary global variables for testing
var arr1, arr2, arr3;
var charts = new Array();

$(document).ready(function () {
    buildCharts()
        .then(drawCharts);
})

async function queryServer() {
    const urlParams = new URLSearchParams(window.location.search);
    const startdate = urlParams.get('startdate').split("-");
    const startyear = startdate[0], startmonth = startdate[1], startday = startdate[2];

    const enddate = urlParams.get('enddate').split("-");
    const endyear = enddate[0], endmonth = enddate[1], endday = enddate[2];


    document.getElementById("startdatename").innerHTML = 'START DATE:';
    document.getElementById("enddatename").innerHTML = 'END DATE:';
    document.getElementById("startdate").innerHTML = urlParams.get('startdate');
    document.getElementById("enddate").innerHTML = urlParams.get('enddate');

    const result = await $.ajax(
        {
            url: "/api/test/trends?type=financial"
                + "&s_y=" + startyear
                + "&s_mo=" + startmonth
                + "&s_d=" + startday
                + "&e_y=" + endyear
                + "&e_mo=" + endmonth
                + "&e_d=" + endday,
            type: "GET",
        }
    )

    return result
}

function saveChartPDF(chart_number) {
    charts[chart_number].saveAsPdf('a2', true, 5, 5, 'Chart #' + chart_number);
}

async function buildCharts() {
    financialSummaryData = await queryServer();
    arr1 = financialSummaryData.Days
    arr2 = financialSummaryData.GrossRevPerDayYellow
    arr3 = financialSummaryData.GrossRevPerDayGreen

    await charts.push(
        createLineChart(
            "Daily average of total amount paid by taxi riders",
            "Days in range",
            "Daily average",
            getDataset(arr1, arr2, arr3))
    );
    console.log(charts.length);
}

function drawCharts() {
    for (i = 0; i < charts.length; i++) {
        charts[i].draw();
    }
}

function getDataset(xData, yData1, yData2) {
    let dataset = new Array(xData.length);

    for (i = 0; i < dataset.length; i++) {
        dataset[i] = new Array(3); //! This could be made more generic
    }
    for (i = 0; i < dataset.length; i++) {
        dataset[i][0] = xData[i];
        dataset[i][1] = yData1[i];
        dataset[i][2] = yData2[i];
    }
    return anychart.data.set(dataset);
}

function createLineChart(title, xlabel, ylabel, dataset) {

    //? yellow data
    const seriesData_1 = dataset.mapAs({ 'x': 0, 'value': 1 });

    //? green data
    const seriesData_2 = dataset.mapAs({ 'x': 0, 'value': 2 });

    /* Create line chart */
    var chart = anychart.line();

    /* Configure chart settings */
    chart.animation(true);


    chart.crosshair()
        .enabled(true)
        .yLabel(false)
        .yStroke(null);

    chart.tooltip().positionMode('point');

    chart.title(title);

    chart.xAxis().title(xlabel);
    chart.yAxis().title(ylabel);

    let series1 = chart.line(seriesData_1);
    series1.markers()
        .enabled(true)
        .type('circle')
        .size(1)
        .stroke({
            color: "gold",
            thickness: 2
        })
    series1.stroke({
        color: "gold",
        thickness: 1
    })
    series1.tooltip()
        .position('right')
        .anchor('left-center')
        .offsetX(5)
        .offsetY(5);

    let series2 = chart.line(seriesData_2);
    series2.stroke({
        color: "green",
        thickness: 1
    })
    series2.markers()
        .enabled(true)
        .type('circle')
        .size(1)
        .stroke({
            color: "green",
            thickness: 2
        });
    series2.tooltip()
        .position('right')
        .anchor('left-center')
        .offsetX(5)
        .offsetY(5);

    chart.legend()
        .enabled(true)
        .fontSize(13)
        .padding([0, 0, 10, 0]);
    // set container id for the chart
    chart.container('myChart2');

    return chart;
}


/**
 * Unsure if the rest of this code will be necessary
 */

// Extracting dates/months from the URL

var URLparameters = location.search.substring(1).split('&');
var parameterKeyValue;
//var text = "";
var label = new Array();
var parametervalues = new Array();
var day;
var month;
var year;
var type = URLparameters[0].split("=");
var builder = unescape(type[1]);                                        // builder stores whether tripAndLocation or Financial
//alert(builder);                                               
for (var i = 1; i < URLparameters.length; i++) {
    parameterKeyValue = URLparameters[i].split("=");
    label.push(unescape(parameterKeyValue[1]));                             // label stores the months or dates to be used in the graph
    parametervalues.push(unescape(parameterKeyValue[1]));
    //text += "<br>" + unescape(parameterKeyValue[1]);
}
//document.getElementById("result").innerHTML += text;
if (parameterKeyValue[0] == 'enddate') {                                  // Checking if dates were selected
    var sdate = new Date(parametervalues[0]);
    var edate = new Date(parametervalues[1]);

    Date.prototype.addDay = function (days) {                 // This function generates the date after n days
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }


    label = getDateArray(sdate.addDay(1), edate.addDay(1));     // label stores the generated dates
    //alert(label);

    //alert(label);
    //document.getElementById("result1").innerHTML = label;
}
else {
    var text = "";
    for (var i = 0; i < label.length; i++) {
        text += label[i] + ", ";
    }
    document.getElementById("startdatename").innerHTML = 'SELECTED MONTHS:';
    document.getElementById("startdate").innerHTML = text;
    document.getElementById("enddatename").style.border = '0px black solid';
    document.getElementById("enddate").style.border = '0px black solid';
}

var dataset1 = new Array();                                   // generates random data for the graph --->NOT IMPORTANT (will be removed later)
var dataset2 = new Array();
for (var i = 0; i < label.length; i++) {
    dataset1.push(Math.floor(Math.random() * label.length));
    dataset2.push(Math.floor(Math.random() * label.length));
}

function savePDF1() {
    chart1.saveAsPdf('a2', true, 5, 5, 'PdfChart1');
}
function savePDF2() {
    chart.saveAsPdf('a2', true, 5, 5, 'PdfChart2');
}

// creating chart dataset from data
function getData(arr1, arr2, arr3) {
    var dataset = new Array(arr1.length);
    for (i = 0; i < dataset.length; i++) {
        dataset[i] = new Array(3);
    }
    for (i = 0; i < dataset.length; i++) {
        dataset[i][0] = arr3[i];
        dataset[i][1] = arr1[i];
        dataset[i][2] = arr2[i];
    }
    // function getData(label,dataset2) {
    //   var dataset = new Array(label.length);
    //   for(i=0;i<dataset.length;i++){
    //     dataset[i] = new Array(2);
    //   }
    //   for(i=0;i<dataset.length;i++){
    //     dataset[i][0] = label[i];
    //     dataset[i][1] = dataset2[i];
    //   }
    console.log(dataset);
    return dataset;
}

function getDateArray(start, end) {                       // The function generates dates between Start and End date in MM-DD-YYYY format
    var arr = new Array();
    var dt = start;
    while (dt <= end) {
        date = new Date(dt);
        //alert(date);
        day = date.getDate();
        //alert(day);
        month = date.getMonth() + 1;
        //alert(month);
        year = date.getFullYear();
        //alert(year);
        if (day < 10) {
            //alert(day);
            day = '0' + day;
            //alert(day);
        }
        if (month < 10) {
            //alert(month)
            month = '0' + month;
            //alert(month);
        }
        var date1 = month + '-' + day + '-' + year;
        //alert(date1);
        arr.push(date1);
        dt = dt.addDay(1);                                     // call to the function addDay to generate the date for the next day
    }                                                        // this is done till all dates between the start and the end date are generated
    //alert(arr);
    return arr;
}