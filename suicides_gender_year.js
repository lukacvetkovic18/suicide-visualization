var marginScatter = {top: 50, right: 20, bottom: 50, left: 70},
    widthScatter = 960 - marginScatter.left - marginScatter.right,
    heightScatter = 600 - marginScatter.top - marginScatter.bottom;

var tooltipScatter = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 0 10px rgba(0,0,0,0.5)");

var svgScatter = d3.select("#suicidesGenderYearChart")
    .attr("viewBox", "0 0 960 600")
    .append("g")
    .attr("transform", "translate(" + marginScatter.left + "," + marginScatter.top + ")");

var xScatter = d3.scaleLinear().range([0, widthScatter]);
var yScatter = d3.scaleLinear().range([heightScatter, 0]);
var colorScatter = d3.scaleOrdinal().domain(["male", "female"]).range(["#667fc1", "#c904c9"]);

var xAxisScatter = d3.axisBottom(xScatter);
var yAxisScatter = d3.axisLeft(yScatter).tickFormat(d3.format(".0f"));

svgScatter.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + heightScatter + ")");

svgScatter.append("g")
    .attr("class", "y axis");

svgScatter.append("text")
    .attr("x", (widthScatter / 2))             
    .attr("y", 0 - (marginScatter.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "16px") 
    .style("text-decoration", "underline")  
    .text("Number of Suicides Each Year Among Men & Women");

svgScatter.append("text")
    .attr("class", "x-axis-label")
    .attr("x", widthScatter / 2)
    .attr("y", heightScatter + marginScatter.bottom - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Number of Suicides");

svgScatter.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -heightScatter / 2)
    .attr("y", -marginScatter.left + 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Year");

var legendScatter = svgScatter.selectAll(".legend")
    .data(colorScatter.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legendScatter.append("rect")
    .attr("x", widthScatter - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", colorScatter);

legendScatter.append("text")
    .attr("x", widthScatter - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });

function updateSuicidesGenderYearChart(data) {
    xScatter.domain([0, d3.max(data, function(d) { return d.suicides_no; })]).nice();
    yScatter.domain(d3.extent(data, function(d) { return d.year; })).nice();

    svgScatter.select(".x.axis")
        .call(xAxisScatter)
        .append("text")
        .attr("class", "label")
        .attr("x", widthScatter)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Number of Suicides");

    svgScatter.select(".y.axis")
        .call(yAxisScatter)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Year");

    var dots = svgScatter.selectAll(".dot")
        .data(data);

    dots.enter().append("circle")
        .attr("class", "dot")
        .merge(dots)
        .attr("r", 3.5)
        .attr("cx", function(d) { return xScatter(d.suicides_no); })
        .attr("cy", function(d) { return yScatter(d.year); })
        .style("fill", function(d) { return colorScatter(d.sex); })
        .style("opacity", 0.6)
        .style("stroke", "black")
        .on("mouseover", function(event, d) {
            tooltipScatter.style("visibility", "visible")
                .html(`Year: ${d.year}<br>Suicides: ${d.suicides_no}<br>Sex: ${d.sex}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 25) + "px");
        })
        .on("mousemove", function(event) {
            tooltipScatter.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 25) + "px");
        })
        .on("mouseout", function() {
            tooltipScatter.style("visibility", "hidden");
        });

    dots.exit().remove();
}
