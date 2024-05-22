var svgSuicidesGeneration = d3.select("#suicidesGenerationChart")
    .attr("width", 700)
    .attr("height", 500)
    .append("g")
    .attr("transform", "translate(50,50)");

var xScaleSuicidesGeneration = d3.scaleLinear().range([0, 600]);
var yScaleSuicidesGeneration = d3.scaleBand().range([0, 400]).padding(0.1);

svgSuicidesGeneration.append("g")
    .attr("class", "x-axis");

svgSuicidesGeneration.append("g")
    .attr("class", "y-axis");

function updateSuicidesGenerationChart(data, selectedYear) {
    selectedYear = parseInt(selectedYear);
    var filteredData;
    if(selectedYear !== 1) {
        filteredData = data.filter(d => d.year === selectedYear);
    } else {
        filteredData = data;
    }

    var generationData = d3.rollups(filteredData, v => {
        return {
            medianSuicides: d3.median(v, d => d.suicides_no / d.population * 100000)
        };
    }, d => d.generation);

    // Sort generations by median suicides
    generationData = generationData.sort((a, b) => b[1].medianSuicides - a[1].medianSuicides);

    xScaleSuicidesGeneration.domain([0, d3.max(generationData, d => d[1].medianSuicides)]);
    yScaleSuicidesGeneration.domain(generationData.map(d => d[0]));

    var bars = svgSuicidesGeneration.selectAll(".bar")
        .data(generationData);

    bars.enter().append("rect")
        .attr("class", "bar")
        .merge(bars)
        .attr("x", 0)
        .attr("y", d => yScaleSuicidesGeneration(d[0]))
        .attr("width", d => xScaleSuicidesGeneration(d[1].medianSuicides))
        .attr("height", yScaleSuicidesGeneration.bandwidth())
        .attr("fill", "#ff7f0e");

    bars.exit().remove();

    svgSuicidesGeneration.select(".x-axis")
        .attr("transform", "translate(0,400)")
        .call(d3.axisBottom(xScaleSuicidesGeneration));

    svgSuicidesGeneration.select(".y-axis")
        .call(d3.axisLeft(yScaleSuicidesGeneration));
}
