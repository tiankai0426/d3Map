//获取地图容器的宽高
const viewWidth = 1920;//$('#app').width();
const viewHeight = 1200;//$('#app').height();
//设置 svg 宽高
const svg = d3.select('#app').append('svg')
      .attr('width', viewWidth)
      .attr('height', viewHeight);
svg.append('rect')
   .attr('width', viewWidth)
   .attr('height', viewHeight)
   .attr('fill','lightblue');
//周围邻国
const other = svg.append('g')
      .attr('class', 'other');
//添加箭头标记
var defs = svg.append("defs");

var arrowMarker = defs.append("marker")
                    .attr("id","arrow")
                    .attr("markerUnits","strokeWidth")
                    .attr("markerWidth","8")
                    .attr("markerHeight","8")
                    .attr("viewBox","0 0 12 12")
                    .attr("refX","6")
                    .attr("refY","6")
                    .attr("orient","auto");

var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";

arrowMarker.append("path")
    .attr("d",arrow_path)
    .attr("fill","red");
//添加起点标识
var startMarker = defs.append("marker")
                        .attr("id","startPoint")
                        .attr("markerUnits","strokeWidth")
                        .attr("markerWidth","12")
                        .attr("markerHeight","12")
                        .attr("viewBox","0 0 12 12")
                        .attr("refX","6")
                        .attr("refY","6")
                        .attr("orient","auto");

startMarker.append("circle")
            .attr("cx",6)
            .attr("cy",6)
            .attr("r",2)
            .attr("fill","red");
//添加 最外层的 g
const g = svg.append('g').attr('class','root');
//设置地图投影
const projection = d3.geo.mercator()
        .center([105, 37.5])//中心点 兰州
        .scale(1000)//放大系数
        .translate([viewWidth/2, viewHeight/2]);

const path = d3.geo.path()
      .projection(projection);

//const color = d3.scale.category20c();

//鼠标点击 机场信息 显示
let airInfo = d3.select('#app').append('div')
    .attr('class', 'airInfo');
airInfo.append('i')
       .attr('class', 'close')
       .text('×');

var cityInfoHeight = 120,
    cityInfoWidth = 150;
const airSvg = airInfo.append('svg')
    .attr({height: cityInfoHeight, width: cityInfoWidth});
//请求中国地图数据
d3.json("/data/china_m.json", function(error, root){
  if(error){
    return console.error(error);
  }
  //地图数据
  const geoData = root.features;
  //拖拽
  //dragMap();
  //渲染省份的路径
  renderPath(geoData);
  //渲染省份名称
 // renderProv(geoData);

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
      .attr('font-size', '18px')
      .attr('font-weight', 'bold');
  }

  function ajaxCities(city, x, y, k, cityData){
    // d3.json(`/data/${city}.json`,function(error, root){
    //   //console.log(root.features);
    //   let data = root.features,
    //       cities = d3.select('#airports');
    //   d3.selectAll('#airports > *').remove();
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
      })//点击该省份放大
      // .on('click', function(d, i){
      //   //console.log(d.properties.ename);
      //   //颜色改变
      //   // d3.select(this)
      //   //   .attr('fill', color(i));

      //     var x, y, k, ename = d.properties.ename;
      //     //如果当前不是中心点放大， 如果是 缩小 k 为 放大缩小的倍数
      //     if (d && centered !== d) {
      //       let centroid = path.centroid(d);
      //         x = centroid[0];
      //         y = centroid[1];
      //         k = 2;
      //         centered = d;
      //        // d3.select("#provinces")
      //        //   .style('display', "none");

      //       //ename 是 省份名称 根据这个请求数据
      //       //ajaxCities(ename, x, y, k,cityData);
      //     } else {
      //         x = viewWidth / 2;
      //         y = viewHeight / 2;
      //         k = 1;
      //         centered = null;
      //       // d3.select("#provinces")
      //       //   .style('display', "block");
      //       renderCity(cityData);
      //     }

      //     g.transition()
      //      .duration(750)
      //      .attr("transform", "translate(" + viewWidth / 2 + "," + viewHeight / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      //     .attr("stroke-width", 1.5 / k + "px");

      // });

  }
});

renderOther('Russia');
renderOther('SouthKorea');
renderOther('India');
renderOther('Singapore');
//请求周边国家的地图数据
function renderOther(countryName){
  d3.json(`/data/other/${countryName}.json`, function(error, root){
    if(error){
      return console.error(error);
    }
    //地图数据
    const geoData = root.features;
    const nodeEnter = other.selectAll("path")
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
          return "";//color(i);
        })
        .attr('d', function(d){
          return path(d);
        });
  });
}

d3.json('/data/airport_data.json',function(error, root){
    if(error){
      return console.error(error);
    }
    const airportsData = root.features;
    //清画布
    d3.selectAll('#airports').remove();
    //机场显示
    const airports = svg.append('g')
          .attr('id', 'airports');
    //点击出现的 modal 中的 文字显示
    airSvg.append('text')
          .attr('class','airName');
    //机场 logo
    let images = airports.selectAll("image")
        .data(airportsData)
        .enter()
        .append('image')
        .on('click', function(d){
          clickShow(d);
        });

    images.attr('x', function(d){
        //根据城市的经纬度投射确定圆点坐标
        return projection([d.properties.cp[0],d.properties.cp[1]])[0] - 5;
      })
      .attr('y', function(d){
        return projection([d.properties.cp[0],d.properties.cp[1]])[1] - 5;
      })
      .attr('width', 10)
      .attr('height', 10)
      .attr('xlink:href', function(){
        return '/images/logo.png';
      });

    //点击关闭 机场信息框
    $('.airInfo').on("click",".close",function(){
      $('.airInfo').removeClass('active');
    });
   //弧线连接 运动路径
   arcLine(airportsData);
   animateMotion('#airPath');

   function clickShow(d){
      d3.selectAll('.airName')
        .text(d.properties.name)
        .attr('x',0)
        .attr({y: 15});

      let rectData = [
        {
          'text': '60',
          'position': {x: 0, y: 40}
        },
        {
          'text': '70',
          'position': {x: 25, y: 50}
        },
        {
          'text': '80',
          'position': {x: 50, y: 40}
        },
        {
          'text': '90',
          'position': {x: 75, y: 30}
        },
        {
          'text': '00',
          'position': {x: 100, y: 40}
        },
        {
          'text': '10',
          'position': {x: 125, y: 70}
        }
      ];
      airInfo.classed({'active':true,airInfo: true })
        .style('left',(d3.event.pageX)+"px")
        .style('top',(d3.event.pageY)+"px");

      airSvg.selectAll('rect')
             .data(rectData).enter()
             .append('rect')
             .attr('x', function(d){
                  return d.position.x;
             })
             .attr('y', function(d){ return d.position.y})
             .attr({width: 20})
             .attr('height', function(d){
                  return cityInfoHeight - d.position.y - 20;
             });

      airSvg.selectAll('text')
             .data(rectData).enter()
             .append('text')
             .text(function(d){return d.text;})
             .attr('x', function(d){
                return d.position.x;
             })
             .attr({y: cityInfoHeight});
   }

  //弧线生成器
  function arcLine(airData){
    //弧线
    const arc = svg.append('g').attr('class','arc');

    //从柳州机场飞到舟山机场
    var endPoint, controlPoint, startPoint;
    airData.map(val => {
      if(val.properties.name === '舟山普陀山机场'){
        endPoint = projection(val.properties.cp);//根据经纬度换算像素坐标
      }
      if(val.properties.name === '武汉天河国际机场'){
        controlPoint = projection(val.properties.cp);
      }
      if(val.properties.name === '柳州白莲机场'){
        startPoint = projection(val.properties.cp);
      }
    });

    arc.append('path')
      .attr('d',`M${startPoint}Q${controlPoint},${endPoint}`)
      .attr('id', 'airPath')
      .attr('fill','transparent')
      .attr('stroke','red')
      .attr('stroke-width',"3px")
      .attr('marker-end','url(#arrow)')
      .attr('marker-start', 'url(#startPoint)');
  }

  //创建 animateMotion 元素 根据 路径运动
  function animateMotion(id){
    const arcLine = d3.select('.arc');
    // const point = arcLine.append('circle')
    //        .attr('r', 10)
    //        .attr('fill', 'gold');
    const point = arcLine.append('image')
          .attr('xlink:href','/images/airport.jpg')
          .attr('transform','rotate(135)translate(-25,-25)')
          .attr('width',30)
          .attr('height',30);
    point.append('animateMotion')
      .attr('dur', '3s')
      .attr('repeatCount', 'indefinite')
      .attr('rotate','auto')
      .append('mpath')
      .attr('xlink:href', id);

  }
});
