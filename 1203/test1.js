function createBubbleChart(data1) {
  // 将CSV数据解析为对象数组
  const data = parseCSV(data1);
  const svg = d3.select("#bubble-chart");

  const simulation = d3.forceSimulation(data)
      .force("x", d3.forceX(d => d.Year).strength(0.05))
      .force("y", d3.forceY(200).strength(0.5))
      .force("collide", d3.forceCollide(d => d.Value * 2))
      .on("tick", ticked);

  const bubbles = svg.selectAll(".bubble")
      .data(data)
      .enter().append("circle")
      .attr("class", "bubble")
      .attr("r", d => d.Value * 2)
      .style("fill", "steelblue");

  function ticked() {
      bubbles
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
  }

  bubbles.on("mouseover", function (event, d) {
      tooltip.html(`Country: ${d.Country}, Gas: ${d.Pollutant}`)
          .style("visibility", "visible");
  })
  .on("mousemove", function (event) {
      tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
  })
  .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
  });

  const tooltip = d3.select("#bubble-chart")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("background", "#f4f4f4")
      .style("padding", "5px")
      .style("border", "1px solid #333")
      .style("border-radius", "5px")
      .style("visibility", "hidden");
  }
function showTooltip(data) {
  const tooltip = d3.select(".tooltip");
    tooltip.html("Country: " + data.Country + "<br/>Gas: " + data.Pollutant)
      .style("left", (d3.event.pageX + 10) + "px")
      .style("top", (d3.event.pageY + 10) + "px")
      .style("display", "block");
  }
  
function hideTooltip() {
  const tooltip = d3.select(".tooltip");
    tooltip.style("display", "none");
  }
// 解析CSV数据
function parseCSV(csv) {
  // 获取属性名行
const header = csv[0];

// 创建对象数组
const dataObjects = [];

// 遍历数据行，转换成对象
for (let i = 1; i < csv.length; i++) {
    const dataRow = csv[i];
    const dataObject = {};

    for (let j = 0; j < header.length; j++) {
        dataObject[header[j]] = dataRow[j];
    }

    dataObjects.push(dataObject);
}

  return dataObjects;
}


// 定义一个异步函数，用于获取数据并返回到变量中
async function getworld() {
    try {
      // 使用fetch函数从服务器获取数据
      // 函数使用fetch函数发送HTTP请求来获取数据，并使用await关键字等待获取数据的响应。
      // 返回Promise对象
      const response = await fetch('world.json');
  
      // 检查响应是否成功
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // 使用.json()方法将数据解析为JSON对象
      const world = await response.json();
  
      // 返回解析后的数据
      return world;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

// 该函数接收一个名为world的参数，该参数应该是一个包含地理数据的对象。
// 函数使用topojson.feature方法将这个地理数据转换为一个包含国家信息的对象，并将其作为返回值返回。
function getcountries(world){return(
    // 返回值是经过转换的包含国家信息的对象。
      topojson.feature(world, world.objects.countries)
  )};

// 异步函数，用于加载地图数据sssssss
async function loadMapData() {
    // 使用D3.js库中的d3.csv方法从名为"hale.csv"的文件中获取数据，并使用d3.autoType函数将数据转换为适当的数据类型。
      var halep = d3.csv("hale.csv", d3.autoType);
      // 通过await关键字等待Promise对象的解析结果，即等待数据获取完成
      hale= await halep;
      console.log("Data received hale:",hale);
  }

  // 更新表格数据
  function updateTable(csvData) {
    var selectedOptions = getSelectedOptions();
    var filteredData = filterData(selectedOptions, csvData);
    var rowLimit = 1000;
    createBubbleChart(filteredData);
    // 清空表格内容
    $("#headerRow").empty();
    $("#dataRows").empty();

    console.log("filterData:");
    console.log(filteredData);
    if (filteredData.length > 0) {
      var headerRow = filteredData[0];
      var tableHeaders = "";
      var tableRows = "";
      var rowLimit = 1000; // 设定行数限制

      // 构建表头
      $.each(headerRow, function(index, value) {
        tableHeaders += "<th>" + value + "</th>";
      });
      $("#headerRow").append(tableHeaders);

      // 构建数据行
      for (var i = 1; i < filteredData.length && i <= rowLimit; i++) {
        var rowData = filteredData[i];
        var tableCells = "";

        $.each(rowData, function(index, value) {
          tableCells += "<td>" + value + "</td>";
        });

        tableRows += "<tr>" + tableCells + "</tr>";
      }
      $("#dataRows").append(tableRows);
    }

    // 添加排序功能
    $("th").click(function() {
          var columnIndex = $(this).index();
          var sortOrder = $(this).data("sort");

          // 切换排序顺序
          if (sortOrder === "asc") {
            $(this).data("sort", "desc");
            filteredData.sort(function(a, b) {
              return b[columnIndex].localeCompare(a[columnIndex]);
            });
          } else {
            $(this).data("sort", "asc");
            filteredData.sort(function(a, b) {
              return a[columnIndex].localeCompare(b[columnIndex]);
            });
          }

          // 更新表格内容
          tableRows = "";
          for (var i = 1; i < filteredData.length && i <= rowLimit; i++) {
            var rowData = filteredData[i];
            var tableCells = "";

            $.each(rowData, function(index, value) {
              tableCells += "<td>" + value + "</td>";
            });

            tableRows += "<tr>" + tableCells + "</tr>";
          }
          $("#dataRows").html(tableRows);

          
        });

  }

  // 获取选中的下拉框值和多选框值
  function getSelectedOptions() {
    var selectedOptions = {
      dropdown: $("#mySelect").val(),
      dropdown1: $("#mySelect1").val(),
      checkboxes: []
    };

    $(".checkbox-container input[type='checkbox']:checked").each(function() {
    var checkboxValue = $(this).val();
    if (checkboxValue.includes('-')) {
      var range = checkboxValue.split('-');
      var startYear = parseInt(range[0]);
      var endYear = parseInt(range[1]);
      for (var year = startYear; year <= endYear; year++) {
        selectedOptions.checkboxes.push(year.toString());
      }
    } else {
      selectedOptions.checkboxes.push(checkboxValue);
    }
  });

  return selectedOptions;
  }

  // 根据选中的下拉框值和多选框值筛选数据
  function filterData(selectedOptions, csvData) {
    var filteredData = [csvData[0]]; // 复制表头

    for (var i = 1; i < csvData.length; i++) {
      var rowData = csvData[i];
      var country = rowData[1]; // Country 属性所在的列，
      var gas = rowData[3]; // Pollutant 属性所在的列，
      var year = rowData[7];// 从多选框值中截取后两位作为年份

      if (
        (country === selectedOptions.dropdown) && (gas === selectedOptions.dropdown1) && 
        (selectedOptions.checkboxes.length === 0 || selectedOptions.checkboxes.includes(year))
      ) 
      {
        filteredData.push(rowData);
      }
    }

    return filteredData;
  }