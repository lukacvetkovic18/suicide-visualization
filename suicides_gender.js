var svgPie = d3.select("#suicidesGenderChart")
    .attr("width", 500)
    .attr("height", 500)
    .append("g")
    .attr("transform", "translate(250,250)");

var radius = 200;
var colorPie = d3.scaleOrdinal()
    .domain(["female", "male"])
    .range(["#ff69b4", "#1e90ff"]);

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
        .attr("font-size", "14px")
        .text(d => `${d.data[0]}: ${((d.data[1] / d3.sum(sexData, d => d[1])) * 100).toFixed(1)}%`);
}