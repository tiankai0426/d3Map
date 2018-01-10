//获取地图容器的宽高
const viewWidth = $('#app').width();
const viewHeight = $('#app').height();
const svg = d3.select('#app').append('svg')
      .attr('width', viewWidth)
      .attr('height', viewHeight)
      .append('g')
      .attr('transform','translate(100,0)');
//设置地图投影
const projection = d3.geo.mercator()
        .center([112, 38])//中心点
        .scale(800)//放大系数
        .translate([viewWidth/2, viewHeight/2]);

const path = d3.geo.path()
      .projection(projection);

const color = d3.scale.category20b();

//设置提示框
d3.select('#app').append('div')
  .attr('class', 'tooltip')
  .attr('opacity', 0.0);

d3.json("/js/china.json", function(error, root){

  if(error){
    return console.error(error);
  }
  //地图数据
  const geoData = root.features;
  //省份提示
  const prov = svg.append('g')
        .attr('id','provinces');
  prov.selectAll('text')
    .data(geoData)
    .enter()
    .append('text')
    .text(function(d){
      return d.properties.name === '山西' ? '' : d.properties.name;
    })
    .attr('x', function(d){
      return projection([d.properties.cp[0],d.properties.cp[1]])[0];//根据城市的经纬度投射确定坐标
    })
    .attr('y', function(d){
      return projection([d.properties.cp[0],d.properties.cp[1]])[1];
    })
    .attr('fill', "#000")
    .attr('font-size', '19px');

  //拖拽
  const dragListener = d3.behavior.drag()
        .on('dragstart', function(d){
          console.log(d);
          d3.event.sourceEvent.stopPropagation();
        })
        .on('drag', dragmove);
  function dragmove(d){
    // d3.select('g.dragNode')
    //   .attr('x', )
    console.log(d);
  }

  // svg.append('g')
  //    .attr('transform',"translate(100,0)")
  //    .call(dragListener);

  const nodeEnter = svg.selectAll("path")
    .data(geoData)
    .enter()
    .append('g')
    .attr('class', function(d){
      if(d.properties.name === '山西'){
        return 'shanxi';
      }
    });
  nodeEnter.append('path')
    .attr('stroke', "#000")
    .attr('stroke-width', 1)
    .attr("fill", function(d, i){
      return color(i);
    })
    .attr('d', function(d){
      return path(d);
    })
    .on('mouseenter', function(d, i){
      d3.select(this)
        .attr('fill',"yellow");
      var html = `<div>
                     <span>${d.properties.name}</span>
                  </div>`;
      d3.select('.tooltip')
        .style('left',(d3.event.pageX)+"px")
        .style('top',(d3.event.pageY)+"px")
        .style('opacity',1.0)
        .html(html);
    })
    .on('mouseleave', function(d, i){
      d3.select(this)
        .attr('fill', color(i));
      d3.select('.tooltip')
        .style('opacity',0.0);
    });
});

d3.json("/js/shan1xi.json",function(error, root){
  //console.log(root.features);
  const shanxiData = root.features;

  const circles = svg.append('g')
        .attr('id', 'circles');

  const texts = svg.append('g')
        .attr('id', 'texts');

  circles.selectAll("circle")
    .data(shanxiData)
    .enter()
    .append('circle')
    .attr('cx', function(d){
      return projection([d.properties.cp[0],d.properties.cp[1]])[0];//根据城市的经纬度投射确定圆点坐标
    })
    .attr('cy', function(d){
      return projection([d.properties.cp[0],d.properties.cp[1]])[1];
    })
    .attr('r', 3)
    .attr('fill', '#29ff57');

  texts.selectAll('text')
    .data(shanxiData)
    .enter()
    .append('text')
    .text(function(d){
      return d.properties.name;
    })
    .attr('x', function(d){
      return projection([d.properties.cp[0],d.properties.cp[1]])[0];//根据城市的经纬度投射确定坐标
    })
    .attr('y', function(d){
      return projection([d.properties.cp[0],d.properties.cp[1]])[1];
    })
    .attr('fill', "#000")
    .attr('font-size', '9px');
});
