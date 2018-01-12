# d3Map
d3.js做的中国地图  
![d3Map](http://ostu98x74.bkt.clouddn.com/github/d3Map.png);
### 鼠标悬停显示 省份名称
### 点击城市，显示城市信息
### 注意点：
#### - 拖拽
 - 如果是针对 `g` 组的话 因为它没有 `x`、`y` 所以使用 `translate`平移来实现拖拽效果。
 - 这里需要获得俩个点，一个是在平移刚开始时候坐标位置，另一个是在平移的过程中的坐标位置
 - 平移过程中 可以 通过 `d3.event.x` 来获得当前的坐标位置。
 - 困住我的是起始点的位置。我刚开始是 在`dragstart`的时候，获得`d3.event.sourceEvent.offsetX` 来获取，然后 用当前 坐标位置 减去 起始点的位置
 - 这个方案不成功，在拖拽第一个的是成功的，第二次拖拽的时候就会产生偏差
 - 可能是在拖拽开始时候，产生了偏差
 - 在 stackoverflow 搜到 可以在 鼠标按下的时候 就获取初始位置的 坐标
 ```
   g.attr('transform', "translate(0,0)")
    .on('mousedown', function(){
      startX = d3.mouse(this)[0];
      startY = d3.mouse(this)[1];
      console.log('mouseDown '+startX, startY);
    })
    .call(dragListener);

 ```

#### d3 双击事件 为 dblclick
#### d3 清画布 d3.selectAll(selector).remove()
这个是把选中的删除了，如果要移除子元素的 选择器 可以这么写 
```
d3.selectAll("selector > *").remove()
```
#### 根据经纬度 确定 城市的坐标 
```
 projection([d.properties.cp[0],d.properties.cp[1]])[0];
```
- projection 是 定义 的投影
- d.properties.cp 是城市的经纬度 数组
#### 优雅的数组降维
```
  var cityData = [];
  //数组降维 获得 cityData
  geoData.forEach(val =>{
    if(!val.properties.cities) return;
    cityData = cityData.concat(val.properties.cities);
    return cityData;
  });

```
- val.properties.cities 是一个数组 通过 concat 把它拆开 拼接到 cityData 中
