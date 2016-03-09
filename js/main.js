/* 575 boilerplate main.js */
window.onload = function(){
	var w=800, h=600;
	var container = d3.select("body")
		.append("svg")
		.attr("width",w)
		.attr("height",h)
		.attr("class","container");

    var rectangle = container
    	.append("rect")
    	.datum(250)
		.attr("width", function(d){
			return d*3;

		}) 

        .attr("height", function(d){
			return d*2;

		})
        .attr("class","myRectangle")	
};