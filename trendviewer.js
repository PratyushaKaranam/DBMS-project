/* summary data from server */
var financialSummaryData;
var tripSummaryData;
const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');
const startdate = urlParams.get('startdate').split("-");
const startyear = startdate[0], startmonth = startdate[1], startday = startdate[2];
const enddate = urlParams.get('enddate').split("-");
const endyear = enddate[0], endmonth = enddate[1], endday = enddate[2];

//temporary global variables for testing
var arr1, arr2, arr3;

var charts = new Array();
var stages = new Array();

$(document).ready(function () {
    switch (type) {
        case "financial":
            buildFinancialCharts()
                .then(drawCharts);
            break;
        case "trips":
            buildTripCharts()
                .then(drawCharts);
            break;

        default:
            alert("WAHT");
            break;
    }
})

async function queryServer() {
    const result = await $.ajax(
        {
            url: "/api/test/trends?type=" + type
                + "&s_y=" + startyear
                + "&s_mo=" + startmonth
                + "&s_d=" + startday
                + "&e_y=" + endyear
                + "&e_mo=" + endmonth
                + "&e_d=" + endday,
            type: "GET",
        }
    )
    // console.log(result);

    return result;
}

function saveChartPDF(chart_number) {
    charts[chart_number].saveAsPdf('a2', true, 5, 5, 'Chart_' + chart_number);
}

function switchLayer(stage_number) {
    stages[stage_number].stage.suspend();
    for (i = 0; i < stages[stage_number].layers.length; i++) {
        stages[stage_number].layers[i].zIndex(0);
    }
    stages[stage_number].active++;
    if (stages[stage_number].active == stages[stage_number].layers.length) {
        stages[stage_number].active = 0;
    }

    stages[stage_number].layers[stages[stage_number].active].zIndex(1000000);
    stages[stage_number].stage.resume();
}

async function buildFinancialCharts() {
    financialSummaryData = await queryServer();

    // console.log(financialSummaryData);

    stage0 = anychart.graphics.create("chart0")
    s0layer0 = stage0.layer();
    s0layer0.zIndex(80);
    s0layer1 = stage0.layer();
    s0layer1.zIndex(100);
    stages.push({ stage: stage0, active: 0, layers: [s0layer0, s0layer1] });

    charts.push(
        createLineChart(
            "Daily average of total payments",
            "Days",
            "Daily average",
            getDataset(financialSummaryData.StatisticsPerDay.Days,
                financialSummaryData.StatisticsPerDay.AverageTotal.YellowAvg,
                financialSummaryData.StatisticsPerDay.AverageTotal.GreenAvg),
            { slabels: ["Yellow Taxi", "Green Taxi"], colors: ["gold", "green"] }
        ).container(s0layer0)
    );


    charts.push(
        createLineChart(
            "Daily median of total payments",
            "Days",
            "Daily median",
            getDataset(financialSummaryData.StatisticsPerDay.Days,
                financialSummaryData.StatisticsPerDay.MedianTotal.YellowMedian,
                financialSummaryData.StatisticsPerDay.MedianTotal.GreenMedian),
            { slabels: ["Yellow Taxi", "Green Taxi"], colors: ["gold", "green"] }
        ).container(s0layer1)
    );

    stage1 = anychart.graphics.create("chart1")
    s1layer0 = stage1.layer();
    s1layer0.zIndex(80);
    s1layer1 = stage1.layer();
    s1layer1.zIndex(100);
    stages.push({ stage: stage1, active: 0, layers: [s1layer0, s1layer1] });

    charts.push(
        createLineChart(
            "Daily average of total payments in Manhattan vs Not Manhattan",
            "Days",
            "Daily average",
            getDataset(financialSummaryData.StatisticsPerDay.Days,
                financialSummaryData.StatisticsPerDay.AverageTotal.ManhattanAvg,
                financialSummaryData.StatisticsPerDay.AverageTotal.NotManhattanAvg),
            { slabels: ["Manhattan", "Other Boroughs"], }
        ).container(s1layer0)
    );

    charts.push(
        createLineChart(
            "Daily median of total payments in Manhattan vs Not Manhattan",
            "Days",
            "Daily median",
            getDataset(financialSummaryData.StatisticsPerDay.Days,
                financialSummaryData.StatisticsPerDay.MedianTotal.ManhattanMedian,
                financialSummaryData.StatisticsPerDay.MedianTotal.NotManhattanMedian),
            { slabels: ["Manhattan", "Other Boroughs"], }
        ).container(s1layer1)
    );

    stage2 = anychart.graphics.create("chart2")
    s2layer0 = stage2.layer();
    s2layer0.zIndex(80);
    s2layer1 = stage2.layer();
    s2layer1.zIndex(100);
    stages.push({ stage: stage2, active: 0, layers: [s2layer0, s2layer1] });

    charts.push(
        createLineChart(
            "Total Tips:Passenger Count ratio as a function of rounded trip distance",
            "Trip distance (Rounded)",
            "Tip per passenger",
            getDataset(financialSummaryData.TipsAsFunctionOfDistance.Distances,
                financialSummaryData.TipsAsFunctionOfDistance.Values,
                undefined),
            { slabels: ["Tips"] }
        ).container(s2layer0)
    );

    document.getElementById("dateinfo").innerHTML =
        'Date in range:<br />' +
        'Start: ' + startdate.join('/') + '<br />' +
        'End: ' + enddate.join('/')
    document.getElementById('summary').innerHTML =

        `
        <div>
            Summary Information <br />
            Most pickups: ${financialSummaryData.placeholder}
        </div>
        `

}

async function buildTripCharts() {
    tripSummaryData = await queryServer();
    stage0 = anychart.graphics.create("chart0")
    s0layer0 = stage0.layer();
    s0layer0.zIndex(80);
    s0layer1 = stage0.layer();
    s0layer1.zIndex(100);
    stages.push({ stage: stage0, active: 0, layers: [s0layer0, s0layer1] });

    charts.push(
        createPieChart(
            "Top Early Pickup Locations",
            getPieDataset(
                tripSummaryData.BoroughSummary.TopLocationsByTime.TopEarlyLocations.Pickup.Zone,
                tripSummaryData.BoroughSummary.TopLocationsByTime.TopEarlyLocations.Pickup.Count,
            ), 1
        ).container(s0layer0)
    )
    charts.push(
        createPieChart(
            "Top Early Dropoff Locations",
            getPieDataset(
                tripSummaryData.BoroughSummary.TopLocationsByTime.TopEarlyLocations.Dropoff.Zone,
                tripSummaryData.BoroughSummary.TopLocationsByTime.TopEarlyLocations.Dropoff.Count,
            ), 2
        ).container(s0layer1)
    )

    stage1 = anychart.graphics.create("chart1")
    s1layer0 = stage1.layer();
    s1layer0.zIndex(80);
    s1layer1 = stage1.layer();
    s1layer1.zIndex(100);
    stages.push({ stage: stage1, active: 0, layers: [s1layer0, s1layer1] });

    charts.push(
        createPieChart(
            "Top Late Pickup Locations",
            getPieDataset(
                tripSummaryData.BoroughSummary.TopLocationsByTime.TopLateLocations.Pickup.Zone,
                tripSummaryData.BoroughSummary.TopLocationsByTime.TopLateLocations.Pickup.Count,
            ), 3
        ).container(s1layer0)
    )

    charts.push(
        createPieChart(
            "Top Late Dropoff Locations",
            getPieDataset(
                tripSummaryData.BoroughSummary.TopLocationsByTime.TopLateLocations.Dropoff.Zone,
                tripSummaryData.BoroughSummary.TopLocationsByTime.TopLateLocations.Dropoff.Count,
            ), 4
        ).container(s1layer1)
    )

    document.getElementById("dateinfo").innerHTML =
        'Date in range:<br />' +
        'Start: ' + startdate.join('/') + '<br />' +
        'End: ' + enddate.join('/')

    // document.getElementById('summary').innerHTML =

    //     `
    //     <div>
    //         Summary Information <br />
    //         Most pickups: ${tripSummaryData.MostPickups}
    //     </div>
    //     `
    // console.log(charts.length);
}

function drawCharts() {

    // var stage = anychart.graphics.create("chartView");
    var customTheme = {
        "defaultFontSettings": {
            "fontSize": 9
        },
        //     "chart": {

        //     }
    }

    // anychart.theme(customTheme);

    for (i = 0; i < charts.length; i++) {
        // set container id for the chart
        // charts[i].container("chart" + i);
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
        dataset[i][2] = yData2 == undefined ? undefined : yData2[i];
    }
    return anychart.data.set(dataset);
}

function getPieDataset(labels, values) {
    let dataset = new Array(labels.length);

    for (i = 0; i < dataset.length; i++) {
        dataset[i] = new Array(2); //! This could be made more generic
    }
    for (i = 0; i < dataset.length; i++) {
        dataset[i][0] = labels[i];
        dataset[i][1] = values[i];
    }
    return anychart.data.set(dataset);
}

/**
 * Configure chart series
 * 
 * !: This function only works with the average total per day trend.
 * 
 * TODO: generalize this function to work with other trends.
 */

function createPieChart(title, dataset, order) {
    const data = dataset.mapAs({ 'x': 0, 'value': 1 });

    var chart = anychart.pie(data);

    chart.animation(true);

    chart.title(title)

    // switch (order) {
    //     case 1:
    //         chart.bounds(0, 0, 400, 400);
    //         break;
    //     case 2:
    //         chart.bounds(400, 0, 400, 800);
    //         break;
    //     case 3:
    //         chart.bounds(0, 400, 400, 800);
    //         break;
    //     case 4:
    //         chart.bounds(400, 400, 800, 800);
    //         break;
    // }

    return chart;
}

function createLineChart(title, xlabel, ylabel, dataset, { numSeries = 2, slabels = ["1", "2"], colors = ["blue", "orange"] } = {}) {

    /* yellow data */
    const seriesData_1 = dataset.mapAs({ 'x': 0, 'value': 1 });


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

    chart.legend()
        .enabled(true)
        .fontSize(13)
        .padding([0, 0, 10, 0]);



    /* First series configuration */
    let series1 = chart.line(seriesData_1);

    series1.name(slabels[0]);

    series1.markers()
        .enabled(true)
        .type('circle')
        .size(1)
        .stroke({
            color: colors[0],
            thickness: 2
        })
    series1.stroke({
        color: colors[0],
        thickness: 1
    })
    series1.tooltip()
        .position('right')
        .anchor('left-center')
        .offsetX(5)
        .offsetY(5);


    // if (dataset[0] != undefined) {

    /* green data */
    const seriesData_2 = dataset.mapAs({ 'x': 0, 'value': 2 });

    /* Second series configuration */
    let series2 = chart.line(seriesData_2);

    series2.name(slabels[1]);

    series2.stroke({
        color: colors[1],
        thickness: 1
    })
    series2.markers()
        .enabled(true)
        .type('circle')
        .size(1)
        .stroke({
            color: colors[1],
            thickness: 2
        });
    series2.tooltip()
        .position('right')
        .anchor('left-center')
        .offsetX(5)
        .offsetY(5);
    // }

    return chart;
}