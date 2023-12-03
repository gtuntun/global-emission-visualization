// 4. make bar chart
// 5. tooltip!
// d3.queue()加载数据，包括世界地图的拓扑数据（world-atlas 包中的 world/50m.json 文件）
// 和 CO2 数据的 CSV 文件（all_data.csv）。
d3.queue()
  .defer(d3.json, "//unpkg.com/world-atlas@1.1.4/world/50m.json")
  .defer(d3.csv, "./new_data.csv", function(row) {
    return {
      continent: row.COU,
      country: row.Country,
      countryCode: row["Country Code"],
      emissions: +row["Value"],
      year: +row.Year
    }
  })
  .await(function(error, mapData, data) { // 数据加载完成后执行的回调函数
    if (error) throw error;

    var extremeYears = d3.extent(data, d => d.year); // 用于获取数据中年份的最小值和最大值，以确定可选择的年份范围。
    var currentYear = extremeYears[0];
    var currentDataType = d3.select('input[name="data-type"]:checked')
                            .attr("value");
    
    // 将地图数据转换为可用于绘制地图的格式。
    var geoData = topojson.feature(mapData, mapData.objects.countries).features;

    console.log(mapData);

    var width = +d3.select(".chart-container")
                   .node().offsetWidth;
    var height = 300;

    createMap(width, width * 4 / 5);
    createPie(width, height);
    createBar(width, height);
    drawMap(geoData, data, currentYear, currentDataType);
    drawPie(data, currentYear);
    drawBar(data, currentDataType, "");

    d3.select("#year")
        .property("min", currentYear) //  设置输入元素的 min 属性
        .property("max", extremeYears[1])
        .property("value", currentYear) // 设置输入元素的 value 属性，
        .on("input", () => { // 添加了一个 input 事件监听器，当用户拖动年份选择器时，会触发此事件。
          currentYear = +d3.event.target.value; // 获取用户选择的新年份，并将其存储在 currentYear 变量中。
          drawMap(geoData, data, currentYear, currentDataType);
          drawPie(data, currentYear);
          highlightBars(currentYear);
        });

    d3.selectAll('input[name="data-type"]') // 选择了所有input元素中name属性为"data-type"的元素
        .on("change", () => { // 添加了一个 change 事件监听器，当用户选择不同的数据类型时会触发此事件
          var active = d3.select(".active").data()[0];
          // 如果存在激活的地图区域，则获取该区域的名称，否则将 country 设置为空字符串。
          var country = active ? active.properties.country : "";

          // 获取用户选择的新数据类型，并将其存储在 currentDataType 变量中。
          currentDataType = d3.event.target.value;
          drawMap(geoData, data, currentYear, currentDataType);
          drawBar(data, currentDataType, country);
        });

    d3.selectAll("svg") 
    // 为所有 svg 元素添加了 mousemove 和 touchmove 事件监听器，以便在鼠标移动或触摸屏幕时触发 updateTooltip 函数。
        .on("mousemove touchmove", updateTooltip);

    function updateTooltip() {
      var tooltip = d3.select(".tooltip");

      // 选中触发事件的目标元素，即用户当前鼠标指针所在的元素
      var tgt = d3.select(d3.event.target);
      var isCountry = tgt.classed("country");
      var isBar = tgt.classed("bar");
      var isArc = tgt.classed("arc");
      var dataType = d3.select("input:checked")
                       .property("value");
                       
      // 根据数据类型确定单位，可以是“千公吨”或“人均公吨”
      var units = dataType === "emissions" ? "thousand metric tons" : "metric tons per capita";
      var data;
      var percentage = "";
      if (isCountry) data = tgt.data()[0].properties;
      if (isArc) {
        data = tgt.data()[0].data;
        percentage = `<p>Percentage of total: ${getPercentage(tgt.data()[0])}</p>`;
      }
      if (isBar) data = tgt.data()[0];
      tooltip
          .style("opacity", +(isCountry || isArc || isBar))
          .style("left", (d3.event.pageX - tooltip.node().offsetWidth / 2) + "px")
          .style("top", (d3.event.pageY - tooltip.node().offsetHeight - 10) + "px");
      if (data) {
        var dataValue = data[dataType] ?
          data[dataType].toLocaleString() + " " + units :
          "Data Not Available";
        tooltip 
            .html(`
              <p>Country: ${data.country}</p>
              <p>${formatDataType(dataType)}: ${dataValue}</p>
              <p>Year: ${data.year || d3.select("#year").property("value")}</p>
              ${percentage}
            `)
      }
    }
  });

function formatDataType(key) {
  return key[0].toUpperCase() + key.slice(1).replace(/[A-Z]/g, c => " " + c);
}

function getPercentage(d) {
  var angle = d.endAngle - d.startAngle;
  var fraction = 100 * angle / (Math.PI * 2);
  return fraction.toFixed(2) + "%";
}


















