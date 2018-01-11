//获取地图容器的宽高
const viewWidth = $('#app').width();
const viewHeight = $('#app').height();
//设置 svg 宽高
const svg = d3.select('#app').append('svg')
      .attr('width', viewWidth)
      .attr('height', viewHeight);
//添加 最外层的 g
const g = svg.append('g').attr('class','root');

//设置地图投影
const projection = d3.geo.mercator()
        .center([103, 36])//中心点 兰州
        .scale(800)//放大系数
        .translate([viewWidth/2, viewHeight/2]);

const path = d3.geo.path()
      .projection(projection);

const color = d3.scale.category20c();

//设置提示框，在鼠标移入的时候显示
d3.select('#app').append('div')
  .attr('class', 'tooltip')
  .attr('opacity', 0.0);
//鼠标点击 城市的时候显示
d3.select('#app').append('div')
  .attr('class', 'cityInfo');
//请求中国地图数据
d3.json("/js/china.json", function(error, root){

  if(error){
    return console.error(error);
  }
  //地图数据
  const geoData = root.features;
  var cityData = [];
  //数组降维
  geoData.forEach(val =>{
    if(!val.properties.cities) return;
    cityData = cityData.concat(val.properties.cities);
    return cityData;
  });
  //拖拽
  var startX = 0,
      startY = 0;
  const dragListener = d3.behavior.drag()
        .on('dragstart', function(d,i){
          d3.event.sourceEvent.stopPropagation();
          startX = d3.event.sourceEvent.clientX;
          startY = d3.event.sourceEvent.clientY;
        })
        .on('drag', dragmove);
  function dragmove(d,i){
    const x = d3.event.x - startX,
          y = d3.event.y - startY;
    console.log(d3.event);
    d3.select(this)
      .attr("transform",function(d,i){
        return `translate(${x}, ${y})`;
      });
  }
  //最外层 g 添加 属性
  const translateStr = "translate(0,30)";
  g.attr('transform',translateStr)
   .call(dragListener);

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
    })//鼠标移入显示 提示省份名称
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
    // .on('click', function(d, i){
    //   console.log(d.properties.ename);
    //   var x, y, k, centered;

    //     if (d && centered !== d) {
    //         var centroid = path.centroid(d);
    //         x = centroid[0];
    //         y = centroid[1];
    //         k = 2;
    //         centered = d;
    //     } else {
    //         x = viewWidth / 2;
    //         y = viewHeight / 2;
    //         k = 1;
    //         centered = null;
    //     }

    //     g.transition()
    //      .duration(750)
    //      .attr("transform", "translate(" + viewWidth / 2 + "," + viewHeight / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    //     .style("stroke-width", 1.5 / k + "px");

    //   ajaxCities(d.properties.ename, x, y, k);

    //   d3.select("#provinces")
    //     .style('display', "none");
    // });

  //省份文字显示
  const prov = svg.append('g')
        .attr('id','provinces')
        .attr('transform',translateStr);
  //城市显示
  const cities = svg.append('g')
        .attr('id', 'cities')
        .attr('transform',translateStr);
  //省份名称
  prov.selectAll('text')
    .data(geoData)
    .enter()
    .append('text')
    .text(function(d){
      let proName = d.properties.name;
      if(proName === "澳门" || proName === "香港"){
        proName = '';
      }
      return proName;
    })
    .attr('x', function(d){
      //根据城市的经纬度投射确定坐标
      return projection([d.properties.cp[0],d.properties.cp[1]])[0] - 5;
    })
    .attr('y', function(d){
      return projection([d.properties.cp[0],d.properties.cp[1]])[1];
    })
    .attr('fill', "#000")
    .attr('font-size', '14px')
    .attr('font-weight', 'bold');
  //城市名称之前的圆圈
  cities.selectAll("circle")
    .data(cityData)
    .enter()
    .append('circle')
    .attr('cx', function(d){
      //根据城市的经纬度投射确定圆点坐标
      return projection([d.properties.cp[0],d.properties.cp[1]])[0];
    })
    .attr('cy', function(d){
      return projection([d.properties.cp[0],d.properties.cp[1]])[1];
    })
    .attr('r', 5)
    .attr('fill', 'red')
    .on('click', function(d){
      //console.log(d);
      var html = ` <i class="close">×</i>
                   <p>
                       <span>城市：</span>
                       <span>${d.properties.name}</span>
                     </p>
                     <p>
                       <span>下属区县：</span>
                       <span>${d.properties.childNum}</span>
                  </p>`;
      d3.select('.cityInfo')
        .classed('active',true)
        .style('left',(d3.event.pageX)+"px")
        .style('top',(d3.event.pageY)+"px")
        .html(html);
    });
  //点击关闭 城市信息框
  $('.cityInfo').on("click",".close",function(){
    $('.cityInfo').removeClass('active');
  });
  //城市名称
  cities.selectAll('text')
    .data(cityData)
    .enter()
    .append('text')
    .text(function(d){
      return d.properties.name;
    })
    .attr('x', function(d){
      //根据城市的经纬度投射确定坐标
      return projection([d.properties.cp[0],d.properties.cp[1]])[0] + 12;
    })
    .attr('y', function(d){
      return projection([d.properties.cp[0],d.properties.cp[1]])[1] + 2;
    })
    .attr('fill', "#000")
    .attr('font-size', '9px');

});

// function ajaxCities(city, x, y, k){

// d3.json(`/data/${city}.json`,function(error, root){
//   //console.log(root.features);
//   var  shanxiData = root.features;

//   circles.attr("transform", "translate(" + viewWidth / 2 + "," + viewHeight / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");

//   texts.attr("transform", "translate(" + viewWidth / 2 + "," + viewHeight / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");


//   circles.selectAll("circle")
//     .data(shanxiData)
//     .enter()
//     .append('circle')
//     .attr('cx', function(d){
//       return projection([d.properties.cp[0],d.properties.cp[1]])[0];//根据城市的经纬度投射确定圆点坐标
//     })
//     .attr('cy', function(d){
//       return projection([d.properties.cp[0],d.properties.cp[1]])[1];
//     })
//     .attr('r', 3)
//     .attr('fill', '#29ff57');

//   texts.selectAll('text')
//     .data(shanxiData)
//     .enter()
//     .append('text')
//     .text(function(d){
//       return d.properties.name;
//     })
//     .attr('x', function(d){
//       return projection([d.properties.cp[0],d.properties.cp[1]])[0];//根据城市的经纬度投射确定坐标
//     })
//     .attr('y', function(d){
//       return projection([d.properties.cp[0],d.properties.cp[1]])[1];
//     })
//     .attr('fill', "#000")
//     .attr('font-size', '9px');

//     shanxiData = null;
// });

// }
