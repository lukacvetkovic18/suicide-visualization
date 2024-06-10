var margin = { top: 40, right: 200, bottom: 70, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var tooltipBubble = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 0 10px rgba(0,0,0,0.5)");

var svgBubble = d3.select("#suicidesTrendChart")
    .attr("viewBox", "0 0 960 600")  // Set viewBox to enable responsive sizing
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
var color = d3.scaleSequential(d3.interpolateBlues).domain([0, 1]);
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
    .text("Median Suicides Over the Years");

// Add x-axis label
svgBubble.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Year");

// Add y-axis label
svgBubble.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Median Suicides");

// Add color legend
var legendColorWidth = 30;
var legendColorHeight = 80;

var legendColor = svgBubble.append("g")
    .attr("class", "legend-color")
    .attr("transform", "translate(" + (width + 60) + "," + (margin.top + 20) + ")");

var defs = legendColor.append("defs");

var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

legendColor.append("rect")
    .attr("width", legendColorWidth)
    .attr("height", legendColorHeight)
    .style("fill", "url(#linear-gradient)");

legendColor.append("text")
    .attr("class", "legend-title")
    .attr("x", legendColorWidth / 2)
    .attr("y", -25)
    .style("text-anchor", "middle")
    .text("Median Suicides")
    .style("font-size", "14px");

legendColor.append("text")
    .attr("class", "legend-min")
    .attr("x", legendColorWidth / 2)
    .attr("y", legendColorHeight + 15)
    .style("text-anchor", "middle")
    .style("font-size", "12px");

legendColor.append("text")
    .attr("class", "legend-max")
    .attr("x", legendColorWidth / 2)
    .attr("y", -5)
    .style("text-anchor", "middle")
    .style("font-size", "12px");

// Add size legend
var legendSize = svgBubble.append("g")
    .attr("class", "legend-size")
    .attr("transform", "translate(" + (width + 70) + "," + (margin.top + legendColorHeight + 260) + ")");

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
        .style("stroke", "black")
        .on("mouseover", function(event, d) {
            tooltipBubble.style("visibility", "visible")
                .html(`Year: ${d.year}<br>Median Suicides: ${d.medianSuicides}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 25) + "px");
        })
        .on("mousemove", function(event) {
            tooltipBubble.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 25) + "px");
        })
        .on("mouseout", function() {
            tooltipBubble.style("visibility", "hidden");
        });

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

    // Update color legend
    var legendColors = d3.extent(yearMedianData, d => d.medianSuicides).reverse();
    var legendColorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain(legendColors);

    linearGradient.selectAll("stop").remove();

    linearGradient.selectAll("stop")
        .data(legendColorScale.ticks().map((t, i, n) => ({
            offset: `${100 * i / n.length}%`,
            color: legendColorScale(t)
        })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    svgBubble.select(".legend-min")
        .text(d3.format(".1f")(legendColors[0]));

    svgBubble.select(".legend-max")
        .text(d3.format(".1f")(legendColors[1]));

    // Update size legend dynamically
    var sizeValues = size.ticks(4);
    sizeValues = sizeValues.slice(0, 4);
    legendSize.selectAll("*").remove();

    legendSize.append("text")
        .attr("x", 50)
        .attr("y", -170)
        .style("text-anchor", "end")
        .text("Median Suicides")
        .style("font-size", "14px");

    console.log(sizeValues)
    sizeValues.forEach((d, i) => {
        legendSize.append("circle")
            .attr("cx", 0)
            .attr("cy", -(i * 2 * size(d) + (i * 10)))
            .attr("r", size(d))
            .style("fill", "none")
            .style("stroke", "black");

        legendSize.append("text")
            .attr("x", 30)
            .attr("y", -(i * 2 * size(d) + (i * 10)))
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d);
    });
}
