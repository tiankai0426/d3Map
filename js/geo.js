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
        .center([105, 37.5])//中心点 兰州
        .scale(800)//放大系数
        .translate([viewWidth/2, viewHeight/2]);

const path = d3.geo.path()
      .projection(projection);

const color = d3.scale.category20c();

//设置提示框，在鼠标移入的时候显示
// d3.select('#app').append('div')
//   .attr('class', 'tooltip')
//   .attr('opacity', 0.0);
//鼠标点击 城市的时候显示
d3.select('#app').append('div')
  .attr('class', 'cityInfo');
//请求中国地图数据
d3.json("/data/china_m.json", function(error, root){

  if(error){
    return console.error(error);
  }
  //地图数据
  const geoData = root.features;
  var cityData = [];
  //数组降维 获得 cityData
  geoData.forEach(val =>{
    if(!val.properties.cities) return;
    cityData = cityData.concat(val.properties.cities);
    return cityData;
  });
  //拖拽
  dragMap();
  //渲染省份的路径
  renderPath(geoData);
  //渲染省份名称
  renderProv(geoData);
  //渲染城市
  renderCity(cityData);

function dragMap(){
 var startX = 0,
     startY = 0,
     x = 0,
     y = 0;

  const dragListener = d3.behavior.drag()
        .on('dragstart', function(d,i){
          d3.event.sourceEvent.stopPropagation();
          console.log('dratStart '+ d3.event.sourceEvent, d3.event.sourceEvent);
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
      console.log('mouseDown '+startX, startY);
    })
    .call(dragListener);
}

  //渲染城市名称 包括圆圈 和 城市文字 以及点击事件
  // cityData 城市数据
  // x y k
function renderCity(cityData, x, y, k){
  //清画布
  d3.selectAll('#cities').remove();
  //城市显示
  const cities = g.append('g')
        .attr('id', 'cities');
  //城市名称之前的圆圈
  let circles = cities.selectAll("circle")
      .data(cityData)
      .enter()
      .append('circle');
  //城市名称
  let texts = cities.selectAll('text')
       .data(cityData)
       .enter()
       .append('text');

  circles.attr('cx', function(d){
      //根据城市的经纬度投射确定圆点坐标
      return projection([d.properties.cp[0],d.properties.cp[1]])[0];
    })
    .attr('cy', function(d){
      return projection([d.properties.cp[0],d.properties.cp[1]])[1];
    })
    .attr('r', 5)
    .attr('fill', 'red')
    .on('click', function(d){
      clickShow(d);
    });

  texts.text(function(d){
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

  //点击关闭 城市信息框
  $('.cityInfo').on("click",".close",function(){
    $('.cityInfo').removeClass('active');
  });

}
//点击城市 圆圈 显示 城市的具体信息
function clickShow(d){
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
}

function renderProv(geoData){
  //清画布
  d3.selectAll('#provinces').remove();
 //省份文字显示
  const prov = g.append('g')
        .attr('id','provinces');

  prov.selectAll('text')
    .data(geoData)
    .enter()
    .append('text')
    .text(function(d){
      let proName = d.properties.name;
      //香港 澳门 太挤了 不显示
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
}

function ajaxCities(city, x, y, k, cityData){
  // d3.json(`/data/${city}.json`,function(error, root){
  //   //console.log(root.features);
  //   let data = root.features,
  //       cities = d3.select('#cities');
  //   d3.selectAll('#cities > *').remove();
  //   renderCity(data, x, y, k);
  // });
  renderCity(cityData, x, y, k);
}

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
    })//鼠标移入显示 提示省份名称
    // .on('mouseover', function(d, i){
    //   var html = `<div>
    //                  <span>${d.properties.name}</span>
    //               </div>`;
    //   d3.select('.tooltip')
    //     .style('left',(d3.event.pageX)+"px")
    //     .style('top',(d3.event.pageY)+"px")
    //     .style('opacity',1.0)
    //     .html(html);
    // })
    // .on('mouseleave', function(d, i){
    //   d3.select(this)
    //     .attr('fill', color(i));
    //   d3.select('.tooltip')
    //     .style('opacity',0.0);
    // })//点击该省份放大
    .on('dbclick', function(d, i){
      //console.log(d.properties.ename);
      //颜色改变
      d3.select(this)
        .attr('fill', color(i));

        var x, y, k, ename = d.properties.ename;
        //如果当前不是中心点放大， 如果是 缩小 k 为 放大缩小的倍数
        if (d && centered !== d) {
          let centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 2;
            centered = d;
           // d3.select("#provinces")
           //   .style('display', "none");

          //ename 是 省份名称 根据这个请求数据
          ajaxCities(ename, x, y, k,cityData);
        } else {
            x = viewWidth / 2;
            y = viewHeight / 2;
            k = 1;
            centered = null;
          // d3.select("#provinces")
          //   .style('display', "block");
          renderCity(cityData);
        }

        g.transition()
         .duration(750)
         .attr("transform", "translate(" + viewWidth / 2 + "," + viewHeight / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .attr("stroke-width", 1.5 / k + "px");

    });

  }
});
