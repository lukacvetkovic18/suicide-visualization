var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svgBubble = d3.select("#suicidesTrendChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
var color = d3.scaleSequential(d3.interpolateBlues);
var size = d3.scaleSqrt().range([5, 20]);

svgBubble.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")");

svgBubble.append("g")
    .attr("class", "y-axis");

svgBubble.append("text")
    .attr("class", "bubble-title")
    .attr("x", width / 2)
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Suicides Trends Over the Years");

// Function to calculate median
function median(values) {
    if (values.length === 0) return 0;
    values.sort((a, b) => a - b);
    var half = Math.floor(values.length / 2);
    if (values.length % 2) {
        return values[half];
    } else {
        return (values[half - 1] + values[half]) / 2.0;
    }
}

// Function to create or update the bubble plot
function updateSuicidesTrendChart(data) {
    // Aggregate data by year to calculate the median suicides
    var yearMedianData = Array.from(d3.group(data, d => d.year), ([year, values]) => {
        var suicides = values.map(v => v.suicides_no);
        var medianSuicides = median(suicides);
        return { year: year, medianSuicides: medianSuicides };
    });

    // Sort data by year
    yearMedianData.sort((a, b) => a.year - b.year);

    // Set the domains for the scales
    x.domain(d3.extent(yearMedianData, d => d.year)).nice();
    y.domain([0, d3.max(yearMedianData, d => d.medianSuicides)]).nice();
    color.domain(d3.extent(yearMedianData, d => d.medianSuicides));
    size.domain(d3.extent(yearMedianData, d => d.medianSuicides));

    // Update the X Axis
    svgBubble.select(".x-axis")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Update the Y Axis
    svgBubble.select(".y-axis")
        .call(d3.axisLeft(y));

    // Update the bubbles
    var bubbles = svgBubble.selectAll(".bubble")
        .data(yearMedianData);

    bubbles.enter().append("circle")
        .attr("class", "bubble")
        .merge(bubbles)
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.medianSuicides))
        .attr("r", d => size(d.medianSuicides))
        .style("fill", d => color(d.medianSuicides))
        .style("opacity", 0.7)
        .style("stroke", "black");

    // Add line that connects the dots
    var line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.medianSuicides));

    svgBubble.selectAll(".line").remove(); // Remove existing lines
    svgBubble.append("path")
        .datum(yearMedianData) // Use datum instead of data to bind array directly
        .attr("class", "line")
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", "steelblue")
        .style("stroke-width", 2);

    bubbles.exit().remove();
}
