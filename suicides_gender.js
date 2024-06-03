var svgPie = d3.select("#suicidesGenderChart")
    .attr("viewBox", "0 0 960 600")  // Set viewBox to enable responsive sizing
    .append("g")
    .attr("transform", "translate(450,300)");

var radius = 250;
var colorPie = d3.scaleOrdinal()
    .domain(["female", "male"])
    .range(["#c904c9", "#667fc1"]);

// Add legend
var legend = svgPie.selectAll(".legend")
    .data(colorPie.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(200," + (i * 20 - 180) + ")"; }); // Adjust position as needed

legend.append("rect")
    .attr("x", 200)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", colorPie);

function updateSuicidesGenderChart(data, year) {
    var filteredData;
    if(year !== 1) {
        filteredData = data.filter(d => d.year == year);
    } else {
        filteredData = data;
    }
    var sexData = d3.rollups(filteredData, v => d3.sum(v, d => d.suicides_no), d => d.sex);

    var pie = d3.pie()
        .value(d => d[1]);

    var arcs = pie(sexData);

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    var path = svgPie.selectAll("path")
        .data(arcs);

    path.enter().append("path")
        .merge(path)
        .attr("d", arc)
        .attr("fill", d => colorPie(d.data[0]))
        .attr("stroke", "white")
        .attr("stroke-width", "2px");

    path.exit().remove();

    svgPie.selectAll("text").remove();

    svgPie.selectAll("text")
        .data(arcs)
        .enter()
        .append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "white") // Set text color to white
        .text(d => `${((d.data[1] / d3.sum(sexData, d => d[1])) * 100).toFixed(1)}%`);
        
    // Add chart title
    svgPie.append("text")
        .attr("x", 0)
        .attr("y", -275) // Adjust as needed
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Distribution of Suicides by Gender");

        
    legend.append("text")
        .attr("x", 190)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
}