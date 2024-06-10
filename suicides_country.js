var margin = { top: 50, right: 40, bottom: 70, left: 100 },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var tooltipCountry = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 0 10px rgba(0,0,0,0.5)");

var svgSuicidesGdp = d3.select("#suicidesCountryChart")
    .attr("viewBox", "0 0 960 600")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xScaleSuicidesGdp = d3.scaleLinear().range([0, width]);
var yScaleSuicidesGdp = d3.scaleBand().range([0, height]).padding(0.1);

svgSuicidesGdp.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")");

svgSuicidesGdp.append("g")
    .attr("class", "y-axis");

// Add x-axis label
svgSuicidesGdp.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Average Suicides");

// Add y-axis label
svgSuicidesGdp.append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Country");

// Add chart title
svgSuicidesGdp.append("text")
    .attr("class", "bar-chart-title")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Average Number of Suicides per Country");

function updateSuicidesCountryChart(data, selectedYear) {
    selectedYear = parseInt(selectedYear);
    var filteredData;
    if(selectedYear !== 1) {
        filteredData = data.filter(d => d.year === selectedYear);
    } else {
        filteredData = data;
    }
    var countryData = d3.rollups(filteredData, v => {
        return {
            averageSuicides: d3.mean(v, d => d.suicides_no / d.population * 100000)
        };
    }, d => d.country);

    // Sort countries by average suicides and get the top 20
    countryData = countryData.sort((a, b) => b[1].averageSuicides - a[1].averageSuicides).slice(0, 20);

    xScaleSuicidesGdp.domain([0, d3.max(countryData, d => d[1].averageSuicides)]);
    yScaleSuicidesGdp.domain(countryData.map(d => d[0]));

    var bars = svgSuicidesGdp.selectAll(".bar")
        .data(countryData);

    bars.enter().append("rect")
        .attr("class", "bar")
        .merge(bars)
        .attr("x", 0)
        .attr("y", d => yScaleSuicidesGdp(d[0]))
        .attr("width", d => xScaleSuicidesGdp(d[1].averageSuicides))
        .attr("height", yScaleSuicidesGdp.bandwidth())
        .attr("fill", "#667fc1")
        .on("mouseover", function(event, d) {
            tooltipCountry.style("visibility", "visible")
                .html(`Country: ${d[0]}<br>Average Suicides: ${d3.format(".2f")(d[1].averageSuicides)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 25) + "px");
        })
        .on("mousemove", function(event) {
            tooltipCountry.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 25) + "px");
        })
        .on("mouseout", function() {
            tooltipCountry.style("visibility", "hidden");
        });

    bars.exit().remove();

    svgSuicidesGdp.select(".x-axis")
        .call(d3.axisBottom(xScaleSuicidesGdp));

    svgSuicidesGdp.select(".y-axis")
        .call(d3.axisLeft(yScaleSuicidesGdp));
}
