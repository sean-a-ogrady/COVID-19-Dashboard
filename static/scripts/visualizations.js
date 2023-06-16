function parallelCoords(data) {
  var svg = d3
      .select("#slot1")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%"),
    margin = 50,
    gridWidth = (window.innerWidth - 60) / 12,
    width = (parseInt(svg.attr("width"), 10) / 14) * gridWidth - 2 * margin,
    height = parseInt(svg.attr("width"), 10) * 4 - margin - 20;

  var columns =
    "CASE_COUNT HOSPITALIZED_COUNT DEATH_COUNT BK_CASE_COUNT BK_HOSPITALIZED_COUNT BK_DEATH_COUNT BK_CASE_COUNT_7DAY_AVG BK_HOSPITALIZED_COUNT_7DAY_AVG BK_DEATH_COUNT_7DAY_AVG".split(
      " "
    );
  var values = [];
  for (let i = 0; i < data.length; i++) {
    var temp = { index: i };
    columns.forEach((col) => {
      temp[col] = +data[i][col];
    });
    values.push(temp);
  }
  var corr = jz.arr.correlationMatrix(values, columns);
  var corrSums = {};
  columns.forEach((col) => {
    corrSums[col] = 0;
  });
  for (let i = 0; i < corr.length; i++) {
    corrSums[corr[i].column_x] += Math.abs(corr[i].correlation);
  }
  corrSumsArray = [];
  for (var key in corrSums) {
    corrSumsArray.push(corrSums[key]);
  }
  corrSumsArray.sort().reverse();
  corrSumsTop = [];
  for (var key in corrSums) {
    if (corrSums[key] == corrSumsArray[0]) {
      corrSumsTop.push(key);
      break;
    }
  }
  //At this point, the first element is the one with highest |correlation| sum

  for (let i = 0; i < 8; i++) {
    var maxCorr = 0;
    var prevAttr = corrSumsTop[i];
    var nextAttr = "";
    for (let j = 0; j < corr.length; j++) {
      //Skip if both attributes are the same, therefore corr of 1
      //Skip if the attribute is not in the x column in the corr array
      if (
        corr[j].column_x === corr[j].column_y ||
        !(corr[j].column_x === prevAttr)
      ) {
        continue;
      }
      if (
        maxCorr < corr[j].correlation &&
        !corrSumsTop.includes(corr[j].column_y)
      ) {
        maxCorr = corr[j].correlation;
        nextAttr = corr[j].column_y;
      }
    }
    corrSumsTop.push(nextAttr);
  }
  //At this point, corrSumsTop should be ordered correctly as outlined in the assignment
  var y = {};
  for (i in corrSumsTop) {
    y[corrSumsTop[i]] = d3
      .scaleLinear()
      .domain(
        d3.extent(data, function (d) {
          return +d[corrSumsTop[i]];
        })
      )
      .range([height, 0]);
  }
  x = d3.scalePoint().range([0, width]).padding(1).domain(corrSumsTop);

  //Map the columns to their respective coordinates/axes
  function path(d) {
    return d3.line()(
      corrSumsTop.map(function (p) {
        return [x(p), y[p](d[p])];
      })
    );
  }
  svg
    .selectAll("myPath")
    .data(data)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", "#6474FF")
    .style("opacity", 0.3)
    .attr("transform", "translate(0," + 50 + ")");
  svg
    .selectAll("myAxis")
    .data(corrSumsTop)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + x(d) + "," + 50 + ")";
    })
    .style("font", "6px helvetica")
    .each(function (d) {
      d3.select(this).call(d3.axisLeft().scale(y[d]));
    })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) {
      return d;
    })
    .style("fill", "black")
    .attr("transform", "translate(0," + 0 + ")");

  svg
    .append("text")
    .attr("stroke", "black")
    .attr("transform", "translate(" + width * 0.37 + ",15)")
    .text("Parallel Coordinates Display");
}

function corrMatrix(data) {
  //append additional divs to the second slot
  d3.select("#slot2").append("div").attr("id", "title");

  d3.select("#slot2").append("div").attr("id", "legend");

  d3.select("#slot2").append("div").attr("id", "grid");

  d3.select("#slot2").append("div").attr("id", "page-content");

  d3.select("#page-content")
    .append("div")
    .attr("class", "tip")
    .style("display", "none");

  var columns =
    "CASE_COUNT HOSPITALIZED_COUNT DEATH_COUNT BK_CASE_COUNT BK_HOSPITALIZED_COUNT BK_DEATH_COUNT BK_CASE_COUNT_7DAY_AVG BK_HOSPITALIZED_COUNT_7DAY_AVG BK_DEATH_COUNT_7DAY_AVG".split(
      " "
    );
  var values = [];
  for (let i = 0; i < data.length; i++) {
    var temp = { index: i };
    columns.forEach((col) => {
      temp[col] = +data[i][col];
    });
    values.push(temp);
  }

  //Data variables
  var corr = jz.arr.correlationMatrix(values, columns);
  var extent = { 0: -1, 1: 1 };
  var grid = data2grid.grid(corr);
  var rows = d3.max(grid, function (d) {
    return d.row;
  });

  //Visual variables
  var svg = d3
    .select("#slot2")
    .append("svg")
    .attr("width", "75%")
    .attr("height", "0%");
  var margin = { top: 20, bottom: 20, left: 200, right: 20 };
  var gridWidth = (window.innerWidth - 60) / 12;
  var height = parseInt(svg.attr("width"), 10) * 4;
  var width = height;
  var padding = 0.1;
  var dim = d3.min([width * 0.9, height * 0.9]);

  var title_svg = d3
    .select("#title")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "20");

  title_svg
    .append("text")
    .attr("stroke", "black")
    .attr("transform", "translate(" + width * 0.95 + ",15)")
    .text("Correlation Matrix");

  var svg = d3
    .select("#grid")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

  var x = d3
    .scaleBand()
    .range([0, width])
    .paddingInner(padding)
    .domain(d3.range(1, rows + 1));
  var y = d3
    .scaleBand()
    .range([0, height])
    .paddingInner(padding)
    .domain(d3.range(1, rows + 1));
  var c = chroma
    .scale(["blue", "white", "red"])
    .domain([extent[0], 0, extent[1]]);

  var x_axis = d3.axisTop(y).tickFormat(function (d, i) {
    return columns[i];
  });
  var y_axis = d3.axisLeft(x).tickFormat(function (d, i) {
    return columns[i];
  });

  svg.append("g").attr("class", "x axis").call(x_axis);
  svg.append("g").attr("class", "y axis").call(y_axis);

  svg
    .selectAll("rect")
    .data(grid, function (d) {
      return d.column_a + d.column_b;
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d.column);
    })
    .attr("y", function (d) {
      return y(d.row);
    })
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", function (d) {
      return c(d.correlation);
    })
    .style("opacity", 1e-6)
    .transition()
    .style("opacity", 1);

  svg.selectAll("rect");
  d3.selectAll("rect")
    .on("mouseover", function (d) {
      d3.select(this).classed("selected", true);
      d3.select(".tip")
        .style("display", "block")
        .html(d.column_x + ", " + d.column_y + ": " + d.correlation.toFixed(2));

      var row_pos = y(d.row);
      var col_pos = x(d.column);
      var tip_pos = d3.select(".tip").node().getBoundingClientRect();
      var tip_width = tip_pos.width;
      var tip_height = tip_pos.height;
      var grid_pos = d3.select("#grid").node().getBoundingClientRect();
      var grid_left = grid_pos.left;
      var grid_top = grid_pos.top;
      var left =
        grid_left + col_pos + margin.left + x.bandwidth() / 2 - tip_width / 2;
      var top = grid_top + row_pos + margin.top - tip_height - 5;

      d3.select(".tip")
        .style("left", left + "px")
        .style("top", top + "px");

      d3.select(".x.axis .tick:nth-of-type(" + d.column + ") text").classed(
        "selected",
        true
      );
      d3.select(".y.axis .tick:nth-of-type(" + d.row + ") text").classed(
        "selected",
        true
      );
      d3.select(".x.axis .tick:nth-of-type(" + d.column + ") line").classed(
        "selected",
        true
      );
      d3.select(".y.axis .tick:nth-of-type(" + d.row + ") line").classed(
        "selected",
        true
      );
    })
    .on("mouseout", function () {
      d3.selectAll("rect").classed("selected", false);
      d3.select(".tip").style("display", "none");
      d3.selectAll(".axis .tick text").classed("selected", false);
      d3.selectAll(".axis .tick line").classed("selected", false);
    })
    .on("click", function (d) {
      //Clear the third slot before re-drawing the plot
      slot3.innerHTML = "";
      //Re-call areaChart with the x and y columns highlighted
      areaChart(d);
    });

  var legend_top = 20;
  var legend_height = 20;
  var legend_svg = d3
    .select("#legend")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", legend_height + legend_top)
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + legend_top + ")");
  var defs = legend_svg.append("svg");
  var gradient = defs.append("linearGradient").attr("id", "linear-gradient");
  var stops = [
    { offset: 0, color: "blue", value: extent[0] },
    { offset: 0.5, color: "white", value: 0 },
    { offset: 1, color: "red", value: extent[1] },
  ];

  gradient
    .selectAll("stop")
    .data(stops)
    .enter()
    .append("stop")
    .attr("offset", function (d) {
      return 100 * d.offset + "%";
    })
    .attr("stop-color", function (d) {
      return d.color;
    });

  legend_svg
    .append("rect")
    .attr("width", width)
    .attr("height", legend_height)
    .style("fill", "url(#linear-gradient)");

  legend_svg
    .selectAll("text")
    .data(stops)
    .enter()
    .append("text")
    .attr("x", function (d) {
      return width * d.offset;
    })
    .attr("dy", -3)
    .style("text-anchor", function (d, i) {
      return i == 0 ? "start" : i == 1 ? "middle" : "end";
    })
    .text(function (d, i) {
      return d.value.toFixed(2) + (i == 2 ? ">" : "");
    });

  d3.select("#slot2").style(
    "height",
    height + margin.top + margin.bottom + legend_height + legend_top + 30 + "px"
  );
}

function scatterMatrix(data) {
  d3.select("#slot4").append("div").attr("id", "title2");
  d3.select("#slot4").append("div").attr("id", "matrix");

  var margin = { top: 0, right: 20, bottom: 20, left: 200 },
    mar = 20;
  sizeTot = 650 - margin.left - margin.right;
  var svg = d3
    .select("#matrix")
    .append("svg")
    .attr("width", sizeTot + margin.left + margin.right)
    .attr("height", sizeTot + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var title_svg = d3
    .select("#title2")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "20");

  title_svg
    .append("text")
    .attr("stroke", "black")
    .attr("transform", "translate(" + sizeTot * 0.8 + ",15)")
    .text("Scatterplot Matrix");

  var columns =
    "CASE_COUNT HOSPITALIZED_COUNT DEATH_COUNT BK_CASE_COUNT BK_HOSPITALIZED_COUNT BK_DEATH_COUNT BK_CASE_COUNT_7DAY_AVG BK_HOSPITALIZED_COUNT_7DAY_AVG BK_DEATH_COUNT_7DAY_AVG".split(
      " "
    );
  var values = [];
  for (let i = 0; i < data.length; i++) {
    var temp = { index: i };
    columns.forEach((col) => {
      temp[col] = +data[i][col];
    });
    values.push(temp);
  }
  var corr = jz.arr.correlationMatrix(values, columns);
  var corrSums = {};
  columns.forEach((col) => {
    corrSums[col] = 0;
  });
  for (let i = 0; i < corr.length; i++) {
    corrSums[corr[i].column_x] += Math.abs(corr[i].correlation);
  }
  corrSumsArray = [];
  for (var key in corrSums) {
    corrSumsArray.push(corrSums[key]);
  }
  corrSumsArray.sort().reverse();
  corrSumsTop = [];
  for (let i = 0; i < 5; i++) {
    for (var key in corrSums) {
      if (corrSums[key] == corrSumsArray[i]) {
        corrSumsTop.push(key);
      }
    }
  }
  size = sizeTot / corrSumsTop.length;

  // Scale for pairs of variables
  var position = d3
    .scalePoint()
    .domain(corrSumsTop)
    .range([0, sizeTot - size]);

  for (i in corrSumsTop) {
    for (j in corrSumsTop) {
      //Skip if on the diagonal
      if (corrSumsTop[i] === corrSumsTop[j]) {
        continue;
      }

      xextent = d3.extent(data, function (d) {
        return +d[corrSumsTop[i]];
      });
      var x = d3
        .scaleLinear()
        .domain(xextent)
        .nice()
        .range([0, size - 2 * mar]);
      yextent = d3.extent(data, function (d) {
        return +d[corrSumsTop[j]];
      });
      var y = d3
        .scaleLinear()
        .domain(yextent)
        .nice()
        .range([size - 2 * mar, 0]);

      var tmp = svg
        .append("g")
        .attr(
          "transform",
          "translate(" +
            (position(corrSumsTop[i]) + mar) +
            "," +
            (position(corrSumsTop[j]) + mar) +
            ")"
        );
      tmp
        .append("g")
        .attr("transform", "translate(" + 0 + "," + (size - mar * 2) + ")")
        .call(d3.axisBottom(x).ticks(3));
      tmp.append("g").call(d3.axisLeft(y).ticks(3));
      tmp
        .selectAll("myCircles")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return x(+d[corrSumsTop[i]]);
        })
        .attr("cy", function (d) {
          return y(+d[corrSumsTop[j]]);
        })
        .attr("r", 3);
    }
  }
  for (i in corrSumsTop) {
    for (j in corrSumsTop) {
      //Skip if not on the diagonal so that text can be added to diagonal
      if (i != j) {
        continue;
      }
      svg
        .append("g")
        .attr(
          "transform",
          "translate(" +
            position(corrSumsTop[i]) +
            "," +
            position(corrSumsTop[j]) +
            ")"
        )
        .append("text")
        .attr("x", size / 2)
        .attr("y", size / 2)
        .text(corrSumsTop[i])
        .attr("font-size", "6px")
        .attr("text-anchor", "middle");
    }
  }
}

function areaChart(datas) {
  //var a = data col 1, data col 2
  d3.select("#slot3").append("div").attr("id", "title3");
  d3.select("#slot3")
    .append("div")
    .attr("id", "legend2")
    .attr("class", "ac_legend1");
  d3.select("#slot3")
    .append("div")
    .attr("id", "legend3")
    .attr("class", "ac_legend2");
  d3.select("#slot3").append("div").attr("id", "chart");

  // set the dimensions and margins of the graph
  var margin = { top: 50, right: 30, bottom: 30, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  var title_svg = d3
    .select("#title3")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "20");

  title_svg
    .append("text")
    .attr("stroke", "black")
    .attr("transform", "translate(" + width * 0.5 + ",15)")
    .text("Area Plot");

  //Feed the names of the columns into the placeholders
  var svgl = d3.select("#legend2");
  svgl
    .append("text")
    .attr("x", 220)
    .attr("y", 130)
    .text(datas.column_x)
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  var svgl2 = d3.select("#legend3");
  svgl2
    .append("text")
    .attr("x", 220)
    .attr("y", 160)
    .text(datas.column_y)
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  var svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(
    "static/data/covid_19_data.csv",

    //Feed the two columns selected by the correlation matrix into this. CASE_COUNT and HOSPITALIZED_COUNT are the placeholders, potentially defaults.
    function (d) {
      return {
        date: d3.timeParse("%m/%d/%Y")(d.date_of_interest),
        value: d[datas.column_x],
        value2: d[datas.column_y],
      };
    },

    function (data) {
      var x = d3
        .scaleTime()
        .domain(
          d3.extent(data, function (d) {
            return d.date;
          })
        )
        .range([0, width]);
      xAxis = svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      var maxVal1 = d3.max(data, function (d) {
        return +d.value;
      });
      var maxVal2 = d3.max(data, function (d) {
        return +d.value2;
      });
      var maxVal = maxVal1 >= maxVal2 ? maxVal1 : maxVal2;

      var y = d3.scaleLinear().domain([0, maxVal]).range([height, 0]);
      yAxis = svg.append("g").call(d3.axisLeft(y));

      var y2 = d3.scaleLinear().domain([0, maxVal]).range([height, 0]);
      yAxis = svg.append("g").call(d3.axisLeft(y));

      var clip = svg
        .append("defs")
        .append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

      // BRUSHING
      var brush = d3
        .brushX()
        .extent([
          [0, 0],
          [width, height],
        ])
        .on("end", updateChart);

      var area = svg.append("g").attr("clip-path", "url(#clip)");

      var areaGenerator = d3
        .area()
        .x(function (d) {
          return x(d.date);
        })
        .y0(y(0))
        .y1(function (d) {
          return y(d.value);
        });

      var areaGenerator2 = d3
        .area()
        .x(function (d) {
          return x(d.date);
        })
        .y0(y(0))
        .y1(function (d) {
          return y(d.value2);
        });

      area
        .append("path")
        .datum(data)
        .attr("class", "myArea")
        .attr("fill", "#FF4949")
        .attr("fill-opacity", 0.5)
        .attr("d", areaGenerator);

      area
        .append("path")
        .datum(data)
        .attr("class", "myArea2")
        .attr("fill", "#0F4392")
        .attr("fill-opacity", 0.5)
        .attr("d", areaGenerator2);

      area.append("g").attr("class", "brush").call(brush);

      var idleTimeout;
      function idled() {
        idleTimeout = null;
      }

      function updateChart() {
        extent = d3.event.selection;
        if (!extent) {
          if (!idleTimeout) return (idleTimeout = setTimeout(idled, 1000));
          x.domain([4, 8]);
        } else {
          x.domain([x.invert(extent[0]), x.invert(extent[1])]);
          area.select(".brush").call(brush.move, null);
        }
        xAxis.transition().duration(1000).call(d3.axisBottom(x));
        area
          .select(".myArea")
          .transition()
          .duration(1000)
          .attr("d", areaGenerator);

        area
          .select(".myArea2")
          .transition()
          .duration(1000)
          .attr("d", areaGenerator2);

        // Clear the parallel coordinates display
        slot1.innerHTML = "";
        d3.csv("static/data/covid_19_data.csv", function(tempdata) {
            var daterange = [];
            var flag = false;
            tempdata.forEach(date => {
                date1 = d3.timeParse("%m/%d/%Y")(date.date_of_interest);
                date1 = date1.getDay() + " " + date1.getMonth() + " " + date1.getFullYear() + " ";
                date2 = x.domain()[0];
                date2 = date2.getDay() + " " + date2.getMonth() + " " + date2.getFullYear() + " ";
                date3 = x.domain()[1];
                date3 = date3.getDay() + " " + date3.getMonth() + " " + date3.getFullYear() + " ";
                if (date1 == date2 || flag == true){
                    daterange.push(date);
                    flag = true;
                }
                if (date1 == date3){
                    flag = false;
                }
            });
            parallelCoords(daterange);
        });
      }
      svg.on("dblclick", function () {
        x.domain(
          d3.extent(data, function (d) {
            return d.date;
          })
        );
        xAxis.transition().call(d3.axisBottom(x));
        area.select(".myArea").transition().attr("d", areaGenerator);
        area.select(".myArea2").transition().attr("d", areaGenerator2);
      });
    }
  );
  // Citation: https://d3-graph-gallery.com/graph/area_brushZoom.html
}
