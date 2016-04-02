
(function(){

//pseudo-global variables
var attrArray = ["cigarettes", "Life", "PM", "Diadetes", "water"];
var expressed = attrArray[0]; //initial attribute

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
    // map frame dimensions
    var width = window.innerWidth * 0.55,
        height = 680;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //Set the projection
    var projection = d3.geo.fahey()
	.center([21, 17])
        .scale(230)
        .translate([width / 2, height / 2])
        .precision(.1);

    var path = d3.geo.path()
        .projection(projection);    

    //use queue.js to parallelize asynchronous data loading
    var q = d3_queue.queue();
    q
        .defer(d3.csv, "data/lab2data.csv") //load attributes from csv
        .defer(d3.json, "data/Worlddata.topojson") //load background spatial data
         .await(callback);

   function callback(error, csvData, world){
     //place graticule on the map
        setGraticule(map, path);
   
	   var worldCountries = topojson.feature(world, world.objects.Worlddata).features;          

        //join csv data to GeoJSON enumeration units
        worldCountries = joinData(worldCountries, csvData);

        //create the color scale
        var colorScale = makeColorScale(csvData);

        //add enumeration units to the map
        setEnumerationUnits(worldCountries, map, path, colorScale);
        //add coordinated visualization to the map
        setChart(csvData, colorScale);
        
    };
};// end of setMap()

function setGraticule(map, path){
     //create graticule generator
        var graticule = d3.geo.graticule()
            .step([20, 20]); //place graticule lines every 20 degrees of longitude and latitude
       //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
};

function joinData(worldCountries, csvData){
    //variables for data join
    var attrArray = ["cigarettes", "Life", "PM", "Diadetes", "water"];
   
    //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++){
        var csvRegion = csvData[i]; //the current region
        var csvKey = csvRegion.COUNAME; //the CSV primary key

         //loop through geojson regions to find correct region
        for (var a=0; a<worldCountries.length; a++){
            var geojsonProps = worldCountries[a].properties; //the current region geojson properties
            var geojsonKey = geojsonProps.COUNAME; //the geojson primary key

            //where primary keys match, transfer csv data to geojson properties object
            if (geojsonKey == csvKey){

                //assign all attributes and values
                attrArray.forEach(function(attr){
                    var val = parseFloat(csvRegion[attr]); //get csv attribute value
                    geojsonProps[attr] = val; //assign attribute and value to geojson properties
                });
            };
        };
    };

    return worldCountries;
};

function makeColorScale(data){
    var colorClasses = [
        "#ffffd4",
        "#fed98e",
        "#fe9929",
        "#d95f0e",
        "#993404"
    ];

   //create color scale generator
    var colorScale = d3.scale.quantile()
        .range(colorClasses);

    //build two-value array of minimum and maximum expressed attribute values
    var minmax = [
        d3.min(data, function(d) { return parseFloat(d[expressed]); }),
        d3.max(data, function(d) { return parseFloat(d[expressed]); })
    ];
    //assign two-value array as scale domain
    colorScale.domain(minmax);

    return colorScale;
};

function setEnumerationUnits(worldCountries, map, path, colorScale){

    //add France regions to map
    var countries = map.selectAll(".countries")
            .data(worldCountries)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "countries " + d.properties.COUNAME;
            })
            .attr("d", path)
        .style("fill", function(d){
            // return colorScale(d.properties[expressed]);
            return choropleth(d.properties, colorScale);
        });
};

//function to test for data value and return color
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (val && val != NaN){
        return colorScale(val);
    } else {
        return "#CCC";
    };
};

//function to create coordinated bar chart
function setChart(csvData, colorScale){
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.4,
        chartHeight = 485,
		leftPadding = 40,
        rightPadding = 8,
        topBottomPadding = 8,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 4,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
		
	 //create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

    //create a scale to size bars proportionally to frame
    var yScale = d3.scale.linear()
        .range([450,0])
        .domain([0, 3]);

//set bars for each unit
    var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
         .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bars " + d.COUNAME;
        })
.attr("width", chartInnerWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartInnerWidth / csvData.length) + leftPadding;
        })
        .attr("height", function(d, i){
            return 450 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .style("fill", function(d){
            return choropleth(d, colorScale);
        });
		
   //annotate bars with attribute value text
		var chartTitle = chart.append("text")
        .attr("x", 180)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Number of " + expressed + " smoked per person per year");
		
	//create vertical axis generator
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
 
};


})();