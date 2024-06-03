var margin = { top: 40, right: 40, bottom: 60, left: 70 },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Tooltip element
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 0 10px rgba(0,0,0,0.5)");

var svgBar = d3.select("#suicidesAgeGroupChart")
    .attr("viewBox", "0 0 960 600")  // Set viewBox to enable responsive sizing
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Adjust scaling
var xScale = d3.scaleBand().range([0, 960 - margin.left - margin.right]).padding(0.1);
var yScale = d3.scaleLinear().range([600 - margin.top - margin.bottom, 0]);

svgBar.append("g")
    .attr("transform", "translate(0,500)")
    .attr("class", "x-axis");

svgBar.append("g")
    .attr("class", "y-axis");

// Add x-axis label
svgBar.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Age Group");

// Add y-axis label
svgBar.append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Suicides Count");

// Add chart title
svgBar.append("text")
    .attr("class", "bar-chart-title")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Suicide Rates Across Age Group");

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
        .attr("height", d => 500 - yScale(d[1]))
        .attr("fill", "#667fc1")
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                   .html(`Age Group: ${d[0]}<br>Suicide Rate: ${d3.format(".2f")(d[1])}`)
                   .style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 25) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 25) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    bars.exit().remove();

    svgBar.select(".x-axis")
        .call(d3.axisBottom(xScale));

    svgBar.select(".y-axis")
        .call(d3.axisLeft(yScale));
}