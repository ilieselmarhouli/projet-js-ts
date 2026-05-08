import { fetchStocks } from "../api/stocksApi.js";
import { StockChart } from "../charts/stockChart.js";
import { clearElement, createElement } from "../utils/dom.js";
const PERIODS = [
    { label: "7 jours", value: 7 },
    { label: "1 mois", value: 30 },
    { label: "3 mois", value: 90 },
    { label: "Tout", value: 9999 }
];
const CHART_TYPES = [
    { label: "Ligne", value: "line" },
    { label: "Barres", value: "bar" }
];
export class App {
    constructor(root) {
        this.stockChart = new StockChart();
        this.stocks = [];
        this.selectedSymbols = [];
        this.period = 30;
        this.chartType = "line";
        this.periodButtons = new Map();
        this.chartTypeButtons = new Map();
        this.root = root;
    }
    init() {
        this.renderLayout();
        this.bindToolbar();
        this.renderStocks();
        this.refreshView();
    }
    // Construit toute l'interface en TypeScript au lieu d'ecrire le HTML a la main.
    renderLayout() {
        const shell = createElement("main", { className: "shell" });
        const hero = createElement("section", { className: "hero" });
        const heroText = createElement("div");
        heroText.append(createElement("h1", { textContent: "MyBourse" }));
        hero.append(heroText);
        const toolbar = createElement("section", { className: "panel toolbar" });
        const periodBlock = createElement("div", { className: "toolbar-block" });
        periodBlock.append(createElement("span", { className: "toolbar-label", textContent: "Periode" }), this.createButtonGroup(PERIODS, this.periodButtons, this.period));
        const chartTypeBlock = createElement("div", { className: "toolbar-block" });
        chartTypeBlock.append(createElement("span", { className: "toolbar-label", textContent: "Type de graphique" }), this.createButtonGroup(CHART_TYPES, this.chartTypeButtons, this.chartType));
        const loadButton = createElement("button", {
            className: "action-button",
            textContent: "Charger les donnees"
        });
        loadButton.type = "button";
        loadButton.addEventListener("click", () => {
            void this.loadStocks();
        });
        toolbar.append(periodBlock, chartTypeBlock, loadButton);
        this.errorBox = createElement("div", { className: "error-box" });
        this.stockGrid = createElement("section", { className: "stock-grid" });
        const chartPanel = createElement("section", { className: "panel chart-panel" });
        const chartHeader = createElement("div", { className: "chart-header" });
        chartHeader.append(createElement("h2", { textContent: "Evolution des prix" }), (this.legend = createElement("div", { className: "legend" })));
        const chartArea = createElement("div", { className: "chart-area" });
        this.loader = createElement("div", {
            className: "loader",
            html: '<div class="loader-box"><div class="spinner"></div><div>Chargement des donnees...</div></div>'
        });
        this.emptyState = createElement("div", {
            className: "empty-state",
            html: "<div><h3>Selectionne une ou deux actions</h3><p>Charge les donnees puis clique sur les cartes pour afficher le graphique.</p></div>"
        });
        this.canvas = createElement("canvas");
        this.canvas.hidden = true;
        chartArea.append(this.loader, this.emptyState, this.canvas);
        chartPanel.append(chartHeader, chartArea);
        this.statsGrid = createElement("section", { className: "stats-grid" });
        shell.append(hero, toolbar, this.errorBox, this.stockGrid, chartPanel, this.statsGrid);
        this.root.append(shell);
    }
    // Lie les boutons de filtre aux actions qui mettent l'affichage a jour.
    bindToolbar() {
        this.periodButtons.forEach((button, value) => {
            button.addEventListener("click", () => {
                this.period = value;
                this.updateButtonState(this.periodButtons, value);
                this.refreshView();
            });
        });
        this.chartTypeButtons.forEach((button, value) => {
            button.addEventListener("click", () => {
                this.chartType = value;
                this.updateButtonState(this.chartTypeButtons, value);
                this.refreshView();
            });
        });
    }
    createButtonGroup(options, registry, activeValue) {
        const group = createElement("div", { className: "button-row" });
        options.forEach((option) => {
            const button = createElement("button", {
                className: `pill${option.value === activeValue ? " active" : ""}`,
                textContent: option.label
            });
            button.type = "button";
            registry.set(option.value, button);
            group.append(button);
        });
        return group;
    }
    updateButtonState(registry, activeValue) {
        registry.forEach((button, value) => {
            button.classList.toggle("active", value === activeValue);
        });
    }
    // Charge les donnees depuis l'API puis preselectionne deux actions pour la comparaison.
    async loadStocks() {
        this.showError("");
        this.toggleLoader(true);
        try {
            this.stocks = await fetchStocks();
            this.selectedSymbols = this.stocks.slice(0, 2).map((stock) => stock.symbol);
            this.renderStocks();
            this.refreshView();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
            this.showError(message);
            this.stocks = [];
            this.selectedSymbols = [];
            this.renderStocks();
            this.refreshView();
        }
        finally {
            this.toggleLoader(false);
        }
    }
    // Affiche soit un message vide, soit toutes les cartes d'actions disponibles.
    renderStocks() {
        clearElement(this.stockGrid);
        if (this.stocks.length === 0) {
            const placeholder = createElement("div", {
                className: "panel stat-card",
                html: "<strong>Aucune action chargee.</strong><br><span class='stock-hint'>Utilise le bouton pour recuperer les donnees de l'API.</span>"
            });
            this.stockGrid.append(placeholder);
            return;
        }
        this.stocks.forEach((stock) => {
            const card = createElement("article", { className: "stock-card" });
            const selectedIndex = this.selectedSymbols.indexOf(stock.symbol);
            if (selectedIndex === 0) {
                card.classList.add("selected-1");
            }
            if (selectedIndex === 1) {
                card.classList.add("selected-2");
            }
            card.append(createElement("div", {
                className: "stock-card-top",
                html: `<div><h3 class="stock-symbol">${stock.symbol}</h3><p class="stock-name">${stock.name}</p><p class="stock-sector">${stock.sector}</p></div><div class="badge">${stock.currency}</div>`
            }), createElement("p", {
                className: "stock-price",
                textContent: `${stock.currentPrice.toFixed(2)} $`
            }), createElement("p", {
                className: "stock-hint",
                textContent: "Clique pour selectionner ou retirer cette action."
            }));
            card.addEventListener("click", () => {
                this.toggleSelection(stock.symbol);
            });
            this.stockGrid.append(card);
        });
    }
    // Permet d'ajouter, retirer ou remplacer une action dans la comparaison.
    toggleSelection(symbol) {
        if (this.stocks.length === 0) {
            this.showError("Commence par charger les donnees avant de selectionner une action.");
            return;
        }
        const currentIndex = this.selectedSymbols.indexOf(symbol);
        if (currentIndex >= 0) {
            this.selectedSymbols.splice(currentIndex, 1);
        }
        else if (this.selectedSymbols.length < 2) {
            this.selectedSymbols.push(symbol);
        }
        else {
            this.selectedSymbols.shift();
            this.selectedSymbols.push(symbol);
        }
        this.renderStocks();
        this.refreshView();
    }
    // Met a jour le graphique, la legende et les statistiques selon la selection actuelle.
    refreshView() {
        const selectedStocks = this.selectedSymbols
            .map((symbol) => this.stocks.find((stock) => stock.symbol === symbol))
            .filter((stock) => Boolean(stock));
        this.renderLegend(selectedStocks);
        this.renderStats(selectedStocks);
        if (selectedStocks.length === 0) {
            this.canvas.hidden = true;
            this.emptyState.hidden = false;
            this.stockChart.destroy();
            return;
        }
        this.emptyState.hidden = true;
        this.canvas.hidden = false;
        this.stockChart.render(this.canvas, selectedStocks, this.chartType, this.period);
    }
    renderLegend(selectedStocks) {
        clearElement(this.legend);
        selectedStocks.forEach((stock, index) => {
            const item = createElement("div", {
                className: "legend-item",
                html: `<span class="legend-dot" style="background:${index === 0 ? "#e11d48" : "#0284c7"}"></span><span>${stock.symbol}</span>`
            });
            this.legend.append(item);
        });
    }
    // Calcule quelques indicateurs simples pour aider a lire les donnees sans regarder seulement le graphique.
    renderStats(selectedStocks) {
        clearElement(this.statsGrid);
        selectedStocks.forEach((stock) => {
            const history = this.filterHistory(stock.history, this.period);
            if (history.length === 0) {
                return;
            }
            const prices = history.map((point) => point.price);
            const first = prices[0];
            const last = prices[prices.length - 1];
            const delta = last - first;
            const percentage = (delta / first) * 100;
            const volumes = history.map((point) => point.volume);
            const card = createElement("article", {
                className: "panel stat-card",
                html: `
          <h3>${stock.symbol} - ${stock.name}</h3>
          <div class="metrics">
            <div><span class="metric-label">Debut</span><span class="metric-value">${first.toFixed(2)} $</span></div>
            <div><span class="metric-label">Fin</span><span class="metric-value">${last.toFixed(2)} $</span></div>
            <div><span class="metric-label">Variation</span><span class="metric-value ${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "+" : ""}${percentage.toFixed(2)} %</span></div>
            <div><span class="metric-label">Plus haut</span><span class="metric-value up">${Math.max(...prices).toFixed(2)} $</span></div>
            <div><span class="metric-label">Plus bas</span><span class="metric-value down">${Math.min(...prices).toFixed(2)} $</span></div>
            <div><span class="metric-label">Volume moyen</span><span class="metric-value">${Math.round(volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length).toLocaleString("fr-FR")}</span></div>
          </div>
        `
            });
            this.statsGrid.append(card);
        });
    }
    // Garde seulement les derniers points si l'utilisateur n'a pas choisi "Tout".
    filterHistory(history, period) {
        if (period >= 9999) {
            return history;
        }
        return history.slice(-period);
    }
    showError(message) {
        this.errorBox.textContent = message;
        this.errorBox.classList.toggle("visible", message.length > 0);
    }
    toggleLoader(isVisible) {
        this.loader.classList.toggle("visible", isVisible);
    }
}
