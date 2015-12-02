
var w   = 500,
    h   = 500,
    pad = 20;

var tRad = 15,
    sRad = 8,
    tStroke = 4,
    sStroke = 3,
    eStroke = 3;

var timerDelay = 100; //ms
var tolerance  = 0.001;


var svg = d3.select('#steinerVis')
  .attr('width',w)
  .attr('height',h);

var maxX = d3.max( points, function(e,i){ return i>=N?NaN:e[0]; } ),
    maxY = d3.max( points, function(e,i){ return i>=N?NaN:e[1]; } ),
    minX = d3.min( points, function(e,i){ return i>=N?NaN:e[0]; } ),
    minY = d3.min( points, function(e,i){ return i>=N?NaN:e[1]; } );

var x = d3.scale.linear().domain([minX, maxX]).range([pad, w-pad]);
var y = d3.scale.linear().domain([minY, maxY]).range([h-pad, pad]);


var edges = svg.selectAll('line')
   .data(edge)
   .enter()
   .append('line')
   .attr('x1', function(d,i){
     return x(points[d[0]][0]);
   })
   .attr('y1', function(d,i){
     return y(points[d[0]][1]);
   })
   .attr('x2', function(d,i){
     return x(points[d[1]][0]);
   })
   .attr('y2', function(d,i){
     return y(points[d[1]][1]);
   })
   .style('stroke-width', eStroke)
   .style('stroke','black');

var vertices = svg.selectAll('circle')
   .data(points)
   .enter()
   .append('circle')
   .attr('cx', function(d,i){ 
   	 return x(d[0])+"px";
   })
   .attr('cy', function(d,i){ 
   	 return y(d[1])+"px";
   })
   .attr('r', function(d,i){
   	 return i<N?tRad:sRad;
   })
   .style('fill',function(d,i){
   	 return i<N?'black':'red';
   })
   .style('stroke-width',function(d,i){ return i<N?tStroke:sStroke; })
   .style('stroke','white');

var lengthLabel = svg.append('text')
   .attr('x',pad*2)
   .attr('y',h-15)
   .attr('font-size','10pt')
   .attr('fill','black')
   .text('Length: ');

function animateUpdate(){
  var done = updateSteinerPoints(tolerance);
  
  vertices
    .transition()
    .duration(timerDelay)
    .ease('linear')
    .attr('cx', function(d,i){ 
      return x(d[0])+"px";
    })
    .attr('cy', function(d,i){ 
      return y(d[1])+"px";
    });

  edges
    .transition()
    .duration(timerDelay)
    .ease('linear')
    .attr('x1', function(d,i){
      return x(points[d[0]][0])+"px";
    })
    .attr('y1', function(d,i){
      return y(points[d[0]][1])+"px";
    })
    .attr('x2', function(d,i){
      return x(points[d[1]][0])+"px";
    })
    .attr('y2', function(d,i){
      return y(points[d[1]][1])+"px";
    });

    lengthLabel
      .text("Length: "+treeLength);
      

    console
    if(!done){
      console.log('animateUpdate: Not done. Calling animateUpdate in '+(timerDelay+50)+'ms');
      d3.timer(animateUpdate, timerDelay+200);
    }else{
      console.log("animateUpdate: Done iterating");
    }
    return true;
}

