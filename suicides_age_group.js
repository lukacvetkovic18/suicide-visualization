var svgBar = d3.select("#suicidesAgeGroupChart")
    .attr("width", 600)
    .attr("height", 500)
    .append("g")
    .attr("transform", "translate(50,50)");

var xScale = d3.scaleBand().range([0, 500]).padding(0.1);
var yScale = d3.scaleLinear().range([400, 0]);

svgBar.append("g")
    .attr("transform", "translate(0,400)")
    .attr("class", "x-axis");

svgBar.append("g")
    .attr("class", "y-axis");

var ageOrder = ["5-14 years", "15-24 years", "25-34 years", "35-54 years", "55-74 years", "75+ years"];

function updateSuicidesAgeGroupChart(data, year) {
    year = parseInt(year);
    var filteredData;
    if(year !== 1) {
        filteredData = data.filter(d => d.year == year);
    } else {
        filteredData = data;
    }
    var ageData = d3.rollups(filteredData, v => d3.sum(v, d => d.suicides_no / d.population * 100000), d => d.age);

    ageData = ageData.sort((a, b) => ageOrder.indexOf(a[0]) - ageOrder.indexOf(b[0]));

    xScale.domain(ageOrder);
    yScale.domain([0, d3.max(ageData, d => d[1])]);

    var bars = svgBar.selectAll(".bar")
        .data(ageData);

    bars.enter().append("rect")
        .attr("class", "bar")
        .merge(bars)
        .attr("x", d => xScale(d[0]))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d[1]))
        .attr("height", d => 400 - yScale(d[1]))
        .attr("fill", "#1e90ff");

    bars.exit().remove();

    svgBar.select(".x-axis")
        .call(d3.axisBottom(xScale));

    svgBar.select(".y-axis")
        .call(d3.axisLeft(yScale));
}