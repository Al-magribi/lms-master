import React, { forwardRef, useImperativeHandle } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useGetLineChartDataQuery } from "../../../../controller/api/cbt/ApiAnswer";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ScoreChart = forwardRef(({ examid }, ref) => {
  const { data, isLoading, error, refetch } = useGetLineChartDataQuery(examid, {
    skip: !examid,
  });

  useImperativeHandle(ref, () => ({
    refetch,
  }));

  const chartData = {
    labels: data?.map((item) => item.score) || [],
    datasets: [
      {
        label: "Jumlah Siswa",
        data: data?.map((item) => item.quantity) || [],
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.4,
        fill: true,
        pointStyle: "circle",
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "rgb(53, 162, 235)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: "Distribusi Nilai Siswa",
        font: {
          size: 20,
          weight: "bold",
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#666",
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        borderColor: "rgba(53, 162, 235, 0.5)",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (items) => `Rentang Nilai: ${items[0].label}`,
          label: (item) => `Jumlah Siswa: ${item.raw} orang`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          stepSize: 1,
        },
        title: {
          display: true,
          text: "Jumlah Siswa",
          font: {
            size: 14,
            weight: "bold",
          },
          padding: 10,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: "Rentang Nilai",
          font: {
            size: 14,
            weight: "bold",
          },
          padding: 10,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="card shadow w-100 h-75 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow w-100 h-75 text-danger">
        <div className="card-body">Data belum tersedia</div>
      </div>
    );
  }

  return (
    <div className="card shadow w-100 h-75 p-3">
      <div style={{ width: "100%", height: "100%", minHeight: "550px" }}>
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
});

export default ScoreChart;
