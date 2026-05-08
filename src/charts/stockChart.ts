import type { ChartType, Stock } from "../models/stock.js";
import type { ChartInstance } from "../models/chart.js";

const COLORS = [
  { line: "#e11d48", fill: "rgba(225, 29, 72, 0.15)" },
  { line: "#0284c7", fill: "rgba(2, 132, 199, 0.15)" }
];

export class StockChart {
  private chart: ChartInstance | null = null;

  public render(
    canvas: HTMLCanvasElement,
    stocks: Stock[],
    chartType: ChartType,
    period: number
  ): void {
    // Chaque action selectionnee devient une serie distincte dans le graphique.
    const datasets = stocks.map((stock, index) => {
      const filteredHistory = this.filterHistory(stock.history, period);

      return {
        label: `${stock.symbol} - ${stock.name}`,
        data: filteredHistory.map((point) => point.price),
        borderColor: COLORS[index].line,
        backgroundColor: chartType === "line" ? COLORS[index].fill : COLORS[index].line,
        fill: chartType === "line",
        tension: 0.25,
        pointRadius: filteredHistory.length > 45 ? 0 : 3,
        borderWidth: 2
      };
    });

    // Les dates de la premiere action servent d'axe horizontal.
    const labels = this.filterHistory(stocks[0].history, period).map((point) =>
      new Date(point.date).toLocaleDateString("fr-FR")
    );

    // On supprime l'ancien graphique avant d'en creer un nouveau.
    this.destroy();

    this.chart = new Chart(canvas, {
      type: chartType,
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label(context: { dataset: { label: string }; parsed: { y: number } }): string {
                return `${context.dataset.label} : ${context.parsed.y.toFixed(2)} $`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: "rgba(15, 23, 42, 0.08)"
            }
          },
          y: {
            ticks: {
              callback(value: string | number): string {
                return `${Number(value).toFixed(0)} $`;
              }
            },
            grid: {
              color: "rgba(15, 23, 42, 0.08)"
            }
          }
        }
      }
    });
  }

  public destroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  // Retourne seulement les derniers points si une periode limitee est choisie.
  private filterHistory(history: Stock["history"], period: number): Stock["history"] {
    if (period >= 9999) {
      return history;
    }

    return history.slice(-period);
  }
}
