//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
    // map frame dimensions
    var width = 960,
        height = 760;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //Set the projection
    var projection = d3.geo.patterson()
        .scale(170)
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
    //create graticule generator
        var graticule = d3.geo.graticule()
            .step([20, 20]); //place graticule lines every 5 degrees of longitude and latitude
       //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines


	   var worldCountries = topojson.feature(world, world.objects.Worlddata).features;
       // add world data
       var countries = map.selectAll(".countries")
            .data(worldCountries)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "countries " + d.properties.COUNAME;
            })
            .attr("d", path);
        
        
        
    };
};