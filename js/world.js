const viewWidth = 1920;
const viewHeight = 1200;
//设置 svg 宽高
const svg = d3.select('#app').append('svg')
      .attr('width', viewWidth)
      .attr('height', viewHeight);
svg.append('rect')
   .attr('width', viewWidth)
   .attr('height', viewHeight)
   .attr('fill','#f3f3f3');
//添加 最外层的 g
const g = svg.append('g').attr('class','root');
const color = d3.scale.category20c();
//设置地图投影
// const projection = d3.geo.mercator()
//         .center([105, 37.5])//中心点 兰州
//         .scale(600)//放大系数
//         .translate([viewWidth/2, viewHeight/2]);
const projection = d3.geo.mercator();
const oldScale = projection.scale();
const oldTranslate = projection.translate();

const config = projection.scale(oldScale *(viewWidth / oldTranslate[0] / 2) * 0.9)
      .translate([viewWidth/2, viewHeight/2]);

const path = d3.geo.path()
      .projection(config);

d3.json('/data/world.json', function(error, root){
  if(error){
    return console.error(error);
  }

  const countryData = root.features;
  console.log(countryData);
  renderPath(countryData);
  dragMap();

  function renderPath(geoData){
    //鼠标点击时放大的中心点
    let centered = null;

    const nodeEnter = g.selectAll("path")
      .data(geoData)
      .enter()
      .append('g')
      .attr('class', function(d){
        return d.properties.ename;
      });
    nodeEnter.append('path')
      .attr('stroke', "#fff")
      .attr('stroke-width', 1)
      .attr("fill", function(d, i){
        return "lightsteelblue";//color(i);
      })
      .attr('d', function(d){
        return path(d);
      }).on('mouseenter', function(d, i){
        d3.select(this).attr('fill', color(i));
      });
  }

  function dragMap(){
  var startX = 0,
      startY = 0,
      x = 0,
      y = 0;

    const dragListener = d3.behavior.drag()
          .on('dragstart', function(d,i){
            d3.event.sourceEvent.stopPropagation();
          })
          .on('drag', dragmove);

  function dragmove(d,i){
      x = d3.event.x - startX,
      y = d3.event.y - startY;

      d3.select(this)
        .attr("transform",function(d,i){
          return `translate(${x}, ${y})`;
        });
    }
    //最外层 g 添加 属性
    g.attr('transform', "translate(0,0)")
      .on('mousedown', function(){
        startX = d3.mouse(this)[0];
        startY = d3.mouse(this)[1];
      })
      .call(dragListener);
  }

});
