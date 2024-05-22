var svgSuicidesGdp = d3.select("#suicidesGdpChart")
    .attr("width", 700)
    .attr("height", 500)
    .append("g")
    .attr("transform", "translate(50,50)");

var xScaleSuicidesGdp = d3.scaleLinear().range([0, 600]);
var yScaleSuicidesGdp = d3.scaleBand().range([0, 400]).padding(0.1);

svgSuicidesGdp.append("g")
    .attr("class", "x-axis");

svgSuicidesGdp.append("g")
    .attr("class", "y-axis");

function updateSuicidesGdpChart(data, selectedYear) {
    selectedYear = parseInt(selectedYear);
    var filteredData;
    if(selectedYear !== 1) {
        filteredData = data.filter(d => d.year === selectedYear);
    } else {
        filteredData = data;
    }
    var countryData = d3.rollups(filteredData, v => {
        return {
            medianSuicides: d3.median(v, d => d.suicides_no / d.population * 100000),
            gdpPerCapita: d3.median(v, d => +d['gdp_per_capita ($)'])
        };
    }, d => d.country);

    // Sort countries by median suicides and get the top 20
    countryData = countryData.sort((a, b) => b[1].medianSuicides - a[1].medianSuicides).slice(0, 20);

    xScaleSuicidesGdp.domain([0, d3.max(countryData, d => d[1].medianSuicides)]);
    yScaleSuicidesGdp.domain(countryData.map(d => d[0]));

    var bars = svgSuicidesGdp.selectAll(".bar")
        .data(countryData);

    bars.enter().append("rect")
        .attr("class", "bar")
        .merge(bars)
        .attr("x", 0)
        .attr("y", d => yScaleSuicidesGdp(d[0]))
        .attr("width", d => xScaleSuicidesGdp(d[1].medianSuicides))
        .attr("height", yScaleSuicidesGdp.bandwidth())
        .attr("fill", "#ff7f0e");

    bars.exit().remove();

    svgSuicidesGdp.select(".x-axis")
        .attr("transform", "translate(0,400)")
        .call(d3.axisBottom(xScaleSuicidesGdp));

    svgSuicidesGdp.select(".y-axis")
        .call(d3.axisLeft(yScaleSuicidesGdp));
}