var margin = { top: 50, right: 40, bottom: 70, left: 100 },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var tooltipGeneration = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 0 10px rgba(0,0,0,0.5)");

var svgSuicidesGeneration = d3.select("#suicidesGenerationChart")
    .attr("viewBox", "0 0 960 600")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScaleSuicidesGeneration = d3.scaleLinear().range([0, width]);
    var yScaleSuicidesGeneration = d3.scaleBand().range([0, height]).padding(0.1);

svgSuicidesGeneration.append("g")
    .attr("class", "x-axis");

svgSuicidesGeneration.append("g")
    .attr("class", "y-axis");

svgSuicidesGeneration.append("text")
    .attr("class", "gen-chart-title")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Median Suicides per Generation");

svgSuicidesGeneration.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 20)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Median Suicides");

svgSuicidesGeneration.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Generation");

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
        .attr("fill", "#667fc1")
        .on("mouseover", function(event, d) {
            tooltipGeneration.style("visibility", "visible")
                .html(`Generation: ${d[0]}<br>Median Suicides: ${d3.format(".2f")(d[1].medianSuicides)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 25) + "px");
        })
        .on("mousemove", function(event) {
            tooltipGeneration.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 25) + "px");
        })
        .on("mouseout", function() {
            tooltipGeneration.style("visibility", "hidden");
        });

    bars.exit().remove();

    svgSuicidesGeneration.select(".x-axis")
        .attr("transform", "translate(0,480)")
        .call(d3.axisBottom(xScaleSuicidesGeneration));

    svgSuicidesGeneration.select(".y-axis")
        .call(d3.axisLeft(yScaleSuicidesGeneration));
}
