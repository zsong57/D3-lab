/* 575 boilerplate main.js */
window.onload = function(){
	var w=1000, h=500;
	var container = d3.select("body")
		.append("svg")
		.attr("width",w)
		.attr("height",h)
		.attr("class","container");
//innerRect block
    var rectangle = container
    	.append("rect")
    	.datum(200)
		.attr("width", function(d){
			return d*4;
		}) 
        .attr("height", function(d){
			return d*1.9;
		})
        .attr("class","myRectangle");
		
//city population data		
	var cityPop = [
        { 
            city: 'Wuhan',
            population: 10607700
        },
        {
            city: 'Xiangyang',
            population: 5500307
        },
        {
            city: 'Xiamen',
            population: 3531347
        },
        {
            city: 'Shenyang',
            population: 8106171
        }
    ];
	
var x = d3.scale.linear() //create the scale
        .range([180, 800]) //output min and max
        .domain([0, 3.5]); //input min and max
        
    //find the minimum value of the array
    var minPop = d3.min(cityPop, function(d){
        return d.population;
    });

    //find the maximum value of the array
    var maxPop = d3.max(cityPop, function(d){
        return d.population;
    });

    //scale for circles center y coordinate
    var y = d3.scale.linear()
        .range([420, 50])
        .domain([
            0,
            18000000
        ]);
	//color scale generator
	var color = d3.scale.linear()
        .range([
            "#dfefa0",
            "#97b61e"
        ])
        .domain([
            minPop, 
            maxPop
        ]);

	var circles = container.selectAll(".circles") //create an empty selection
        .data(cityPop) //here we feed in an array
        .enter() //one of the great mysteries of the universe
        .append("circle") //inspect the HTML--holy crap, there's some circles there
        .attr("class", "circles")
        .attr("id", function(d){
            return d.city;
        })
        .attr("r", function(d){
            //calculate the radius based on population value as circle area
            var area = d.population * 0.001;
            return Math.sqrt(area/Math.PI);
        })
        .attr("cx", function(d, i){
            //use the index to place each circle horizontally
            return x(i);
        })
        .attr("cy", function(d){
           
            return y(d.population);
        })
        .style("fill", function(d, i){ //add a fill based on the color scale generator
            return color(d.population);
        });
        //create y axis generator
        var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
	//create axis g element and add axis
        var axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(79, 0)")
        .call(yAxis);
	// add title
	var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("City Populations");
	// add labels to the circles
    var labels = container.selectAll(".labels")
        .data(cityPop)
        .enter()
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        .attr("y", function(d){
            //vertical position centered on each circle
            return y(d.population) - 55;
        });

    //first line of label
    var nameLine = labels.append("tspan")
        .attr("class", "nameLine")
        .attr("x", function(d,i){
            //horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) -130;
        })
        .text(function(d){
            return d.city;
        });

    //create format generator
    var format = d3.format(",");

    //second line of label
    var popLine = labels.append("tspan")
        .attr("class", "popLine")
        .attr("x", function(d,i){
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) - 130;
        })
        .attr("dy", "15") //vertical offset
        .text(function(d){
            return "Pop. " + format(d.population); //use format generator to format numbers
        });
		
};