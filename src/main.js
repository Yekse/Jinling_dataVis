var map = L.map('map').setView([32.04, 118.78], 13);  // [纬度, 经度], 缩放级别

//创建背景视频
var bgVideo = document.getElementById("bgVideo");
bgVideo.style.position = "fixed";
bgVideo.style.right = "0";
bgVideo.style.bottom = "0";
bgVideo.style.minWidth = "100%";
bgVideo.style.minHeight = "100%";
bgVideo.style.zIndex = "-1";
document.body.appendChild(bgVideo);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

var locations = []; // 存储地点数据

d3.csv("./src/data.csv").then(function(data) {
  data.forEach(function(d) {
    var location = {
      dynasty: d.朝代,
      name: d.地名,
      longitude: parseFloat(d.经度),
      latitude: parseFloat(d.纬度),
      description: d.地名描述,
      relatedEvent: d.相关事件,
      relatedWorks: d.相关作品,
    };
    locations.push(location);
  //console.log(locations);

  });
  
  var x = d3.scaleLinear()
      .domain([0, 6])
      .range([200, 1500]);
  
  var xAxis = d3.axisBottom(x)
      .tickValues([0, 1, 2, 3, 4, 5, 6])
      .tickFormat(function(d) {
          var dynastyLabels = ["六朝", "唐代", "宋代", "元代", "明代", "清朝", "近代"];
          return dynastyLabels[d];
      });
  
  var brush = d3.brushX()
      .extent([[0, 0], [1700, 20]])  // 请根据实际需求修改坐标范围
      .on("brush", brushed);
  
  var svg = d3.select("body").append("svg")
      .attr("width", 1700)
      .attr("transform", "translate(76, 0)")
      .attr("height", 50);
  
  svg.append("g")
      .attr("class", "x axis")
      .call(xAxis);
  
  svg.append("g")
      .attr("class", "brush")
      .call(brush);
  
  svg.select(".brush")
      .selectAll(".overlay")
      .style("fill", "rgba(138, 109, 53, 0.5)") // 设置填充颜色
      .style("stroke", "yellow") // 设置边框颜色
      .style("cursor", "default"); // 设置鼠标样式

  
  function brushed() {
      var selectedExtent = d3.brushSelection(this);
      if (selectedExtent) {
          var selectedDynastyId = Math.round(x.invert(selectedExtent[0]));
          var dynastyLabels = ["六朝", "唐代", "宋代", "元代", "明代", "清朝", "近代"];
          
          var selectedDynasty = dynastyLabels[selectedDynastyId]
          updateMap(selectedDynasty);
      }
  }
  //updateMap('唐代');
}).catch(function(error) {
  console.error(error);
});

// 选择朝代时更新地图
//selectedDynasty = "唐代"

function updateMap(selectedDynasty) {
  var filteredLocations = locations.filter(function(d) { return d.dynasty == selectedDynasty; });
  console.log(filteredLocations);
  map.eachLayer(function(layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  filteredLocations.forEach(function(location) {
    var marker = L.marker([location.latitude, location.longitude])
      .addTo(map)
      .bindPopup(location.name)
      .on('click', function() { showDescription(location); })
      .openPopup();
  });
}



function showDescription(location) {
  var description = location.description;
  var name = location.name;
  var relatedEvent = location.relatedEvent;
  var relatedWorks = location.relatedWorks;

  // 创建描述信息的HTML元素
  var descriptionDiv = document.createElement('div');
  descriptionDiv.style.color = 'black';
  descriptionDiv.style.border = 'none';
  descriptionDiv.style.border = '1px solid transparent';
  descriptionDiv.textContent = '地名: ' + name +'  地名描述: ' + description;

  // 创建相关事件按钮的HTML元素
  var eventButton = document.createElement('button');
  eventButton.textContent = '相关事件';
  eventButton.style.backgroundColor = 'yellowgreen';
  eventButton.style.border = 'none';
  eventButton.style.color = 'white';
  eventButton.style.fontSize = '14px';
  eventButton.addEventListener('click', function() { showRelatedEvent(relatedEvent); });

  // 创建相关作品按钮的HTML元素
  var worksButton = document.createElement('button');
  worksButton.textContent = '相关作品';
  worksButton.style.backgroundColor = 'yellowgreen';
  worksButton.style.border = 'none';
  worksButton.style.color = 'white';
  worksButton.style.fontSize = '14px';
  worksButton.addEventListener('click', function() { showRelatedWorks(relatedWorks); });

  // 清空地点描述容器
  var descriptionContainer = document.getElementById('descriptionContainer');
  descriptionContainer.innerHTML = '';

  // 添加描述信息、相关事件按钮和相关作品按钮到容器
  descriptionContainer.appendChild(descriptionDiv);
  descriptionContainer.appendChild(eventButton);
  descriptionContainer.appendChild(worksButton);
}


function showRelatedEvent(relatedEvent) {
  // 创建相关事件的HTML元素
  var relatedEventDiv = document.createElement('div');
  relatedEventDiv.textContent = '相关事件: ' + relatedEvent;

  // 清空相关事件容器
  var eventContainer = document.getElementById('eventContainer');
  eventContainer.innerHTML = '';

  // 添加相关事件到容器
  eventContainer.appendChild(relatedEventDiv);
}

function showRelatedWorks(relatedWorks) {
  // 创建相关作品的HTML元素
  var relatedWorksDiv = document.createElement('div');
  relatedWorksDiv.textContent = '相关作品: ' + relatedWorks;

  // 清空相关作品容器
  var worksContainer = document.getElementById('worksContainer');
  worksContainer.innerHTML = '';

  // 添加相关作品到容器
  worksContainer.appendChild(relatedWorksDiv);
}


