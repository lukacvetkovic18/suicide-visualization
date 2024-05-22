let selectedCountry = null;
let zoomed = false;
let yearFilterEnabled = false;

var width = 960, height = 600;
var projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 1.5]);
var path = d3.geoPath().projection(projection);
var svg = d3.select("svg");

Promise.all([
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json'),
    d3.json('suicide-data.json') // Ensure this path is correct
]).then(function([world, data]) {
    var countries = topojson.feature(world, world.objects.countries).features;
    
    var yearData = new Map();
    data.forEach(d => {
        if (!yearData.has(d.year)) {
            yearData.set(d.year, new Map());
        }
        var countryData = yearData.get(d.year);
        if (countryData.has(d.country)) {
            countryData.get(d.country).suicides += d['suicides_no'];
            countryData.get(d.country).population += d['population'];
        } else {
            countryData.set(d.country, {
                suicides: d['suicides_no'],
                population: d['population']
            });
        }
    });

    var colorScale = d3.scaleLinear()
        .domain([0, 100])
        .range(["#add8e6", "#00008b"]);

    function updateMap(year) {
        var suicideData = yearData.get(parseInt(year));
        svg.selectAll(".country")
            .data(countries)
            .join("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", function(d) {
                if (yearFilterEnabled && suicideData && suicideData.has(d.properties.name)) {
                    var data = suicideData.get(d.properties.name);
                    var rate = data.suicides / data.population * 100000;
                    return colorScale(rate);
                } else if (!yearFilterEnabled) {
                    var allYearsData = Array.from(yearData.values()).reduce((acc, yearData) => {
                        if (yearData.has(d.properties.name)) {
                            var data = yearData.get(d.properties.name);
                            acc.suicides += data.suicides;
                            acc.population += data.population;
                        }
                        return acc;
                    }, {suicides: 0, population: 0});
                    if (allYearsData.population > 0) {
                        var rate = allYearsData.suicides / allYearsData.population * 100000;
                        return colorScale(rate);
                    }
                }
                return "#ccc"; // Grey color for countries without data or for undefined year data
            })
            .on("click", function(event, d) {
                if (selectedCountry === d.properties.name && zoomed) {
                    selectedCountry = null;
                    zoomed = false;
                    if(yearFilterEnabled) {
                        updateCharts(data, year); // Update charts for all countries
                    } else {
                        updateChartsWithoutYearFilter(data);
                    }
                    d3.select("#countryName").text("");
                    svg.transition().duration(750).call(
                        zoom.transform,
                        d3.zoomIdentity,
                        d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
                    );
                } else {
                    selectedCountry = d.properties.name;
                    zoomed = true;
                    if(yearFilterEnabled) {
                        updateCharts(data, year, selectedCountry); // Update charts for the selected country
                    } else {
                        updateChartsWithoutYearFilter(data, selectedCountry);
                    }
                    d3.select("#countryName").text(d.properties.name);
                    var bounds = path.bounds(d);
                    var dx = bounds[1][0] - bounds[0][0];
                    var dy = bounds[1][1] - bounds[0][1];
                    var x = (bounds[0][0] + bounds[1][0]) / 2;
                    var y = (bounds[0][1] + bounds[1][1]) / 2;
                    var scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
                    var translate = [width / 2 - scale * x, height / 2 - scale * y];
                    svg.transition().duration(750).call(
                        zoom.transform,
                        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
                    );
                }
            });
    }

    function updateCharts(data, year, country) {
        d3.select("#suicidesTrendChart").style("display", "none");
        d3.select("#suicidesGenderYearChart").style("display", "none");
        if (country) {
            updateSuicidesGenderChart(data.filter(d => d.country === country), year);
            updateSuicidesAgeGroupChart(data.filter(d => d.country === country), year);
            updateSuicidesGenerationChart(data.filter(d => d.country === country), year);
            // Hide GDP chart for single country view
            d3.select("#suicidesGdpChart").style("display", "none");
            // updateSuicidesGdpChart(data, year);
        } else {
            updateSuicidesGenderChart(data, year);
            updateSuicidesAgeGroupChart(data, year);
            updateSuicidesGenerationChart(data, year);
            // Show GDP chart for all countries view
            d3.select("#suicidesGdpChart").style("display", "inline-block");
            updateSuicidesGdpChart(data, year);
        }
    }

    function updateChartsWithoutYearFilter(data, country) {
        d3.select("#suicidesTrendChart").style("display", "inline-block");
        d3.select("#suicidesGenderYearChart").style("display", "inline-block");
        if (country) {
            updateSuicidesGenderChart(data.filter(d => d.country === country), 1);
            updateSuicidesAgeGroupChart(data.filter(d => d.country === country), 1);
            updateSuicidesGenerationChart(data.filter(d => d.country === country), 1);
            updateSuicidesTrendChart(data.filter(d => d.country === country));
            updateSuicidesGenderYearChart(data.filter(d => d.country === country));
            // Hide GDP chart for single country view
            d3.select("#suicidesGdpChart").style("display", "none");
            // updateSuicidesGdpChart(data, year);
        } else {
            updateSuicidesGenderChart(data, 1);
            updateSuicidesAgeGroupChart(data, 1);
            updateSuicidesGenerationChart(data, 1);
            updateSuicidesTrendChart(data);
            updateSuicidesGenderYearChart(data);
            // Show GDP chart for all countries view
            d3.select("#suicidesGdpChart").style("display", "inline-block");
            updateSuicidesGdpChart(data, 1);
        }
    }

    // Call updateMap to initially render the map
    updateMap(d3.select("#yearSelector").property("value"));
    // Call the updateCharts function initially to initialize all charts
    if (yearFilterEnabled) {
        updateCharts(data, d3.select("#yearSelector").property("value"));
    } else {
        updateChartsWithoutYearFilter(data);
    }

    d3.select("#yearSelector").on("input", function() {
        var year = this.value;
        if(yearFilterEnabled) {
            updateMap(year);
            updateCharts(data, year, selectedCountry);
        }
        d3.select("#yearDisplay").text(year); // Update the displayed year
    });

    d3.select("#yearFilterToggle").on("change", function() {
        yearFilterEnabled = this.checked; // Update the year filter toggle flag
        console.log(yearFilterEnabled)
        var year = d3.select("#yearSelector").property("value");
        // if (!yearFilterEnabled) {
        //     year = 1;
        // }
        // updateMap(year);
        // updateCharts(data, year, selectedCountry);
        if (yearFilterEnabled) {
            updateMap(year);
            updateCharts(data, year, selectedCountry);
        } else {
            updateMap(1);
            updateChartsWithoutYearFilter(data, selectedCountry);
        }
    });

    // Zoom functionality
    var zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", function(event) {
            svg.selectAll(".country")
                .attr("transform", event.transform);
        });

    svg.call(zoom);

    svg.append("text")
        .attr("id", "countryName")
        .attr("x", 10)
        .attr("y", 20)
        .style("font-size", "16px")
        .style("fill", "black");
});
