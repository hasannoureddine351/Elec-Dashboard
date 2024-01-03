document.addEventListener("DOMContentLoaded", () => {
  const { ipcMain } = require("electron");

  // Your chart configuration and setup

  var ctx = document.getElementById("myLineChart").getContext("2d");
  ctx.canvas.width = 350;
  ctx.canvas.height = 300;
  var myLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["January", "February", "March", "April", "May", "June"],
      datasets: [
        {
          label: "Dataset 1",
          data: [65, 59, 80, 81, 56, 55],
          fill: false,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
        },
        {
          label: "Dataset 2",
          data: [28, 48, 40, 19, 86, 27],
          fill: false,
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
        },
      ],
    },
    options: {
      // Customize options here
      // Example: You can add a title
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Line Chart with Two Datasets",
        },
      },
    },
  });

  const labels = ["Red", "Orange", "Yellow", "Green", "Blue"];
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Dataset 1",
        data: [65, 59, 80, 81, 56, 55],
      },
    ],
  };

  const config = {
    type: "polarArea",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          pointLabels: {
            display: true,
            font: {
              size: 18,
            },
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Chart.js Polar Area Chart With Centered Point Labels",
        },
        tooltip: {
          enabled: true,
        },
        beforeDraw: function (chart) {
          const {
            ctx,
            chartArea: { top, bottom, left, right, height, width },
          } = chart;
          const datasets = chart.config.data.datasets;

          datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            const arc =
              meta.data[i].hidden === true ? meta.data[i + 1] : meta.data[i];
            const centerX = (right - left) / 2 + left;
            const centerY = (bottom - top) / 2 + top;
            const startAngle = arc.startAngle;
            const endAngle = arc.endAngle;
            const radius = arc.outerRadius * 0.5;

            const x = centerX + Math.cos((startAngle + endAngle) / 2) * radius;
            const y = centerY + Math.sin((startAngle + endAngle) / 2) * radius;

            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "bold 14px Arial";
            ctx.fillText(dataset.label, x, y);
          });
        },
      },
    },
  };

  var ctx = document.getElementById("myPolarAreaChart").getContext("2d");
  ctx.canvas.width = 500;
  ctx.canvas.height = 500;
  var newChart = new Chart(ctx, config);
});
