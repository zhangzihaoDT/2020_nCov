import "../sass/styles.scss";
import * as d3 from "d3";
import _ from "lodash";

/*公共定义*/
const colors = d3.scaleOrdinal(d3.schemeSet2);
const dataUrl = "https://lab.ahusmart.com/nCoV/";
const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("opacity", 0)
  .style("visibility", "hidden")
  .style("pointer-events", "none");

const parseDate = d3.timeParse("%Y-%m-%d");
const transformTime = function(timestamp = +new Date()) {
  if (timestamp) {
    var time = new Date(timestamp);
    var y = time.getFullYear(); //getFullYear方法以四位数字返回年份
    var M = time.getMonth() + 1; // getMonth方法从 Date 对象返回月份 (0 ~ 11)，返回结果需要手动加一
    var d = time.getDate(); // getDate方法从 Date 对象返回一个月中的某一天 (1 ~ 31)
    return y + "-" + M + "-" + d;
  } else {
    return "";
  }
};
d3.json(`${dataUrl + "api/overall?latest=0"}`)
  .then(function(data) {
    var chartData = data.results;
    var dataNCoV = [];
    var lineData = [];
    var date = [];
    var confirmedNCoV = [];
    var suspectedNCoV = [];
    var curedNCoV = [];
    var deadNCoV = [];

    // init pre data
    dataNCoV["2020-1-24"] = { confirm: 897, suspect: 1076, cure: 36, dead: 26 };
    dataNCoV["2020-1-25"] = {
      confirm: 1408,
      suspect: 2032,
      cure: 39,
      dead: 42
    };
    dataNCoV["2020-1-26"] = {
      confirm: 2076,
      suspect: 2692,
      cure: 49,
      dead: 56
    };
    dataNCoV["2020-1-27"] = {
      confirm: 2857,
      suspect: 5794,
      cure: 56,
      dead: 82
    };
    dataNCoV["2020-1-28"] = {
      confirm: 4630,
      suspect: 6973,
      cure: 73,
      dead: 106
    };

    for (var i in chartData) {
      var dataTime = new Date(chartData[i].updateTime);
      var showTime = [
        dataTime.getFullYear(),
        dataTime.getMonth() + 1,
        ("0" + dataTime.getDate()).slice(-2)
      ].join("-");
      var confirmedCount = chartData[i].confirmedCount
        ? chartData[i].confirmedCount
        : chartData[i].confirmed;
      var suspectedCount = chartData[i].suspectedCount
        ? chartData[i].suspectedCount
        : chartData[i].suspectedCount;
      var curedCount = chartData[i].curedCount
        ? chartData[i].curedCount
        : chartData[i].curedCount;
      var deadCount = chartData[i].deadCount
        ? chartData[i].deadCount
        : chartData[i].deadCount;

      if (
        !dataNCoV[showTime] ||
        dataNCoV[showTime]["confirm"] < confirmedCount
      ) {
        dataNCoV[showTime] = [];
        dataNCoV[showTime]["confirm"] = confirmedCount;
        dataNCoV[showTime]["suspect"] = suspectedCount;
        dataNCoV[showTime]["cure"] = curedCount;
        dataNCoV[showTime]["dead"] = deadCount;
      }
    } // 时间排序
    const dataNCoVOrdered = {};
    Object.keys(dataNCoV)
      .sort(function(a, b) {
        a = a.split("-").join("");
        b = b.split("-").join("");
        return a > b ? 1 : a < b ? -1 : 0;
      })
      .forEach(function(key) {
        dataNCoVOrdered[key] = dataNCoV[key];
      });
    // use data
    for (var i in dataNCoVOrdered) {
      lineData.push({
        date: i,
        confirmedCount: dataNCoVOrdered[i]["confirm"],
        suspectedCount: dataNCoVOrdered[i]["suspect"],
        curedCount: dataNCoVOrdered[i]["cure"],
        deadCount: dataNCoVOrdered[i]["dead"]
      });
    }
    return lineData;
  })
  .then(data => {
    console.log(data);
    colors.domain(
      d3.keys(data[0]).filter(function(key) {
        return key !== "date";
      })
    );
    data.forEach(function(d) {
      d.date = parseDate(d.date);
    });
    let groupData = colors.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return { date: d.date, counts: +d[name] };
        })
      };
    });
    const lineChart = d3
      .select(".viz")
      .append("article")
      .attr("class", "viz__line-chart");
    const lineChartOverview = lineChart.append("div");
    lineChartOverview.append("h1").text("确诊患者数量发展趋势");
    lineChartOverview.append("p").text("累计确诊病例数，包含治愈、死亡");
    const lineChartMargin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      lineChartWidth =
        document.querySelector(".viz").clientWidth -
        (lineChartMargin.left + lineChartMargin.right),
      lineChartHeight = 500 - (lineChartMargin.top + lineChartMargin.bottom);
    // svg container
    const lineChartSVG = lineChart
      .append("svg")
      .attr(
        "viewBox",
        `0 0 ${lineChartWidth +
          (lineChartMargin.left + lineChartMargin.right)} ${lineChartHeight +
          (lineChartMargin.top + lineChartMargin.bottom)}`
      );
    // 绘制SVG元素的组
    const lineChartGroup = lineChartSVG
      .append("g")
      .attr(
        "transform",
        `translate(${lineChartMargin.left} ${lineChartMargin.top})`
      );
    // SCALES
    const lineChartXScaleInterval = d3
      .scaleBand()
      .domain(d3.range(data.length))
      .range([0, lineChartWidth]);
    const lineChartXScale = d3
      .scaleTime()
      .domain(
        d3.extent(data, function(d) {
          return d.date;
        })
      )
      .range([0, lineChartWidth]);
    const lineChartYScale = d3
      .scaleLinear()
      .domain([
        d3.min(groupData, function(c) {
          return d3.min(c.values, function(v) {
            return v.counts;
          });
        }),
        d3.max(groupData, function(c) {
          return d3.max(c.values, function(v) {
            return v.counts;
          });
        })
      ])
      .range([lineChartHeight, 0]);
    // AXES
    const lineChartXAxis = d3
      .axisBottom(lineChartXScale)
      .tickFormat(d => {
        const timeTick = d.getMonth() + 1 + "/" + d.getDate();
        return timeTick;
      })
      .tickSize(0)
      .tickPadding(10);
    const lineChartYAxis = d3.axisLeft(lineChartYScale).ticks(6);
    lineChartGroup
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0 ${lineChartHeight})`)
      .call(lineChartXAxis);
    d3.select(".viz__line-chart .x-axis")
      .selectAll("text")
      .style("font-size", "0.75rem");
    // for the y axis remove the segment in favor of text labels and horizontal lines spanning the width
    lineChartGroup
      .append("g")
      .attr("class", "axis y-axis")
      .call(lineChartYAxis);
    d3.select(".viz__line-chart .y-axis")
      .selectAll("text")
      .remove();
    d3.select(".viz__line-chart .y-axis")
      .select("path")
      .remove();
    d3.select(".y-axis")
      .selectAll("line")
      .remove();
    d3.select(".viz__line-chart .y-axis")
      .selectAll("g.tick")
      .append("path")
      .attr("d", `M 0 0 h ${lineChartWidth}`)
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-width", "0.5")
      .attr("stroke-dasharray", "2 1")
      .attr("opacity", 0.2);
    // for every other tick include a text describing the value on the axis
    d3.select(".viz__line-chart .y-axis")
      .selectAll("g.tick")
      .append("text")
      .attr("x", 5)
      .attr("text-anchor", "start")
      .attr("y", -5)
      .attr("fill", "currentColor")
      .style("font-size", "0.8rem")
      .text((d, i) => (i % 2 !== 0 ? `${d}` : ""));
    // line function
    // leveraging the scales use the index of the data point and its actual value
    const line = d3
      .line()
      .x(d => lineChartXScale(d.date))
      .y(d => lineChartYScale(d.counts));
    // .curve(d3.curveStepAfter);
    // .curve(d3.curveBasis);
    const overlay = lineChartGroup
      .append("defs")
      .append("clipPath")
      .attr("id", "overlay")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 0)
      .attr("height", lineChartHeight);
    const lineContainer = lineChartGroup
      .append("g")
      .attr("class", ".lineContainer")
      .attr("clip-path", "url(#overlay)");
    const lineChartIndex = lineContainer
      .selectAll(".company")
      .data(groupData)
      .enter()
      .append("g")
      .attr("class", "company");
    // include a path element using the line function and the theme color
    lineChartIndex
      .append("path")
      .attr("class", "line")
      .attr("d", function(d) {
        return line(d.values);
      })
      .attr("fill", "none")
      .attr("stroke", function(d) {
        return colors(d.name);
      })
      .attr("stroke-width", 2);
    // area function
    // using the same data include a path element describing the area below the previous line
    const area = d3
      .area()
      .x(d => lineChartXScale(d.date))
      .y1(d => lineChartYScale(d.counts))
      .y0(d => lineChartYScale(0));
    lineChartIndex
      .append("path")
      .attr("d", d => area(d.values))
      .attr("fill", d => colors(d.name))
      .attr("opacity", 0.1);
    const lineChartGroups = lineChartGroup
      .selectAll("g.group")
      .data(data) //这里的数据是没有分组的，要在一个矩形条中全部展示数据
      .enter()
      .append("g")
      .attr("class", "group")
      .attr("transform", function(d) {
        return `translate(${lineChartXScale(d.date)} 0)`;
      })
      // on hover highlight the nested circle element and show the tooltip
      .on("mouseenter", function(d, i) {
        d3.select(this)
          .selectAll("circle")
          .attr("opacity", 1)
          .attr("r", 5.75)
          .attr("stroke-width", 2.5);
        d3.select(this)
          .select("rect")
          .transition()
          .attr("opacity", 0.1);
        // show the tooltip detailing the year and value in two paragraph elments
        tooltip
          .append("p")
          .append("strong")
          .text(d.date.getMonth() + 1 + "/" + d.date.getDate());
        tooltip
          .append("p")
          .style("display", "flex")
          .style("align-items", "center").html(`
          <svg width="6" height="6" viewBox="0 0 10 10" style="margin: 0; margin-right: 0.35rem;">
            <circle cx="5" cy="5" r="5" fill="${colors(
              "confirmedCount"
            )}"></circle>
          </svg>
          累计确诊人数: <strong>${d.confirmedCount}</strong>
          `);
        tooltip
          .append("p")
          .style("display", "flex")
          .style("align-items", "center").html(`
          <svg width="6" height="6" viewBox="0 0 10 10" style="margin: 0; margin-right: 0.35rem;">
            <circle cx="5" cy="5" r="5" fill="${colors(
              "suspectedCount"
            )}"></circle>
          </svg>
          疑似感染人数: <strong>${d.suspectedCount}</strong>
          `);
        tooltip
          .append("p")
          .style("display", "flex")
          .style("align-items", "center").html(`
          <svg width="6" height="6" viewBox="0 0 10 10" style="margin: 0; margin-right: 0.35rem;">
            <circle cx="5" cy="5" r="5" fill="${colors("curedCount")}"></circle>
          </svg>
          治愈人数: <strong>${d.curedCount}</strong>
          `);
        tooltip
          .append("p")
          .style("display", "flex")
          .style("align-items", "center").html(`
          <svg width="6" height="6" viewBox="0 0 10 10" style="margin: 0; margin-right: 0.35rem;">
            <circle cx="5" cy="5" r="5" fill="${colors("deadCount")}"></circle>
          </svg>
          死亡人数: <strong>${d.deadCount}</strong>
          `);
        const { width: tooltipWidth } = document
          .querySelector("#tooltip")
          .getBoundingClientRect();
        const { top: offset } = document
          .querySelector(".viz__line-chart svg")
          .getBoundingClientRect();
        tooltip
          .style("opacity", 1)
          .style("visibility", "visible")
          .style("top", `${d3.event.pageY}px`)
          .style("left", () => {
            // 检索光标的水平坐标
            let xCoor = d3.event.pageX;
            // 计算阈值作为容器的中间位置（其距页面左侧的距离+宽度的一半）
            let threshold =
              lineChart.node().offsetLeft + lineChart.node().offsetWidth / 2;
            // 如果超出阈值，则在左侧显示工具提示
            if (xCoor > threshold) {
              return `${d3.event.pageX - tooltipWidth - 20}px`;
            } else {
              return `${d3.event.pageX + tooltipWidth / 4}px`;
            }
          });
      })
      // when leaving the rectangle element, transition the circle elements back to their default values and remove the paragraph elements from the tooltip
      .on("mouseout", (d, i) => {
        d3.selectAll(`g circle:nth-of-type(${i + 1})`)
          .transition()
          .attr("r", "2px")
          .attr("stroke-width", "2px");
        tooltip
          .style("opacity", 0)
          .selectAll("p")
          .remove();
      })
      .on("mouseout", function(d, i, { length }) {
        d3.select(this)
          .selectAll("circle")
          .attr("r", 3.5)
          .attr("stroke-width", 2)
          .attr("opacity", i !== 0 && i !== length - 1 ? 0 : 1);
        d3.select(this)
          .select("rect")
          .transition()
          .attr("opacity", 0);
        tooltip
          .style("opacity", 0)
          .style("visibility", "hidden")
          .selectAll("p")
          .remove();
      });
    // 绘制一个矩形以显示悬停信息
    lineChartGroups
      .append("rect")
      .attr("x", -lineChartXScaleInterval.bandwidth() / 2)
      .attr("y", 0)
      .attr("width", lineChartXScaleInterval.bandwidth())
      .attr("height", lineChartHeight)
      .attr("fill", "#000")
      .attr("opacity", 0);
    //圈出元素以突出显示数据点
    //！ 默认情况下，仅显示第一个和最后一个数据点，突出显示悬停时的其他元素
    lineChartGroups
      .append("circle")
      .attr("class", "confirmedCount")
      .attr("cx", 0)
      .attr("cy", d => lineChartYScale(d.confirmedCount))
      .attr("stroke", colors("confirmedCount"))
      .attr("stroke-width", 2)
      .attr("fill", "hsl(0, 100%, 100%)")
      .attr("r", 3.5)
      .attr("opacity", (d, i, { length }) =>
        i === 0 || i === length - 1 ? 1 : 0
      );
    lineChartGroups
      .append("circle")
      .attr("class", "suspectedCount")
      .attr("cx", 0)
      .attr("cy", d => lineChartYScale(d.suspectedCount))
      .attr("stroke", colors("suspectedCount"))
      .attr("stroke-width", 2)
      .attr("fill", "hsl(0, 100%, 100%)")
      .attr("r", 3.5)
      .attr("opacity", (d, i, { length }) =>
        i === 0 || i === length - 1 ? 1 : 0
      );
    lineChartGroups
      .append("circle")
      .attr("class", "curedCount")
      .attr("cx", 0)
      .attr("cy", d => lineChartYScale(d.curedCount))
      .attr("stroke", colors("curedCount"))
      .attr("stroke-width", 2)
      .attr("fill", "hsl(0, 100%, 100%)")
      .attr("r", 3.5)
      .attr("opacity", (d, i, { length }) =>
        i === 0 || i === length - 1 ? 1 : 0
      );
    lineChartGroups
      .append("circle")
      .attr("class", "deadCount")
      .attr("cx", 0)
      .attr("cy", d => lineChartYScale(d.deadCount))
      .attr("stroke", colors("deadCount"))
      .attr("stroke-width", 2)
      .attr("fill", "hsl(0, 100%, 100%)")
      .attr("r", 3.5)
      .attr("opacity", (d, i, { length }) =>
        i === 0 || i === length - 1 ? 1 : 0
      );
    // 添加数据来源URL
    lineChart
      .append("p")
      .attr("class", "link")
      .text("数据来源: ")
      .append("a")
      .attr("target", "_blank")
      .attr("href", dataUrl)
      .text("HCR");
    overlay
      .transition()
      .duration(2000)
      .ease(d3.easeLinear, 2)
      .attr("width", lineChartWidth);
  });

d3.json(`${dataUrl + "api/area?latest=0&province=湖北省"}`).then(function(d) {
  console.log(d);
});
