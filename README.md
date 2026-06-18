# 🏦 Interactive Banking Client Analytics Dashboard

An interactive, high-performance, single-page web dashboard designed to analyze 3,000+ customer profiles. This project focuses on visualizing demographic distribution, financial behavior, customer segmentation, and feature correlations to drive business insights.

👉 **[Live Interactive Demo](https://bish-ds.github.io/banking-analytics-dashboard/)**

---

## 🌟 Key Features

* **Dynamic Real-Time Filtering**: Drill down client data instantly by **Nationality, Gender, Loyalty Tier, and Fee Structure**. All visual components update reactively.
* **Demographics Deep-Dive**: Visualizes age distribution histograms, nationality breakdowns, and gender splits.
* **Financial Insights**: Explores deposits vs. savings relationship patterns using scatter plots, along with average loan and deposit metrics segmented by customer attributes.
* **Custom Correlation Matrix Heatmap**: A native HTML/CSS grid-based 9x9 Pearson correlation heatmap visualizing relationship strengths between key numerical variables (Income, Loans, Deposits, Checking, Savings, Credit Cards, etc.).
* **Premium Glassmorphism UI**: Built with a sleek dark-navy aesthetics theme, smooth linear gradient accents, responsive flex/grid layouts, custom scrollbars, and scroll-reveal micro-animations.
* **Optimized Data Pipeline**: Raw data processed via a Python pipeline to output pre-aggregated structures, ensuring instantaneous dashboard rendering (sub-100ms load time).

---

## 🛠️ Technology Stack

* **Frontend**: HTML5 (Semantic), CSS3 (Custom Variables, Flexbox, Grid), JavaScript (Vanilla ES6+)
* **Visualizations**: [Chart.js](https://www.chartjs.org/) (Custom styled dark theme charts)
* **Data Engineering & Pre-processing**: Python, Pandas, NumPy

---

## 📂 Repository Structure

* `index.html` — Semantic dashboard layout and structure.
* `style.css` — Modern glassmorphism UI styles, CSS variables, and layout rules.
* `app.js` — Core interactive logic, Chart.js instances management, filter handlers, and UI animations.
* `data.js` — Pre-processed static client database and pre-computed 9x9 correlation matrix.
* `process_data.py` — Python extraction and engineering script used to clean raw data, map identifiers, and compute correlations.

---

## ⚙️ Data Engineering Pipeline

The raw dataset (`Banking.csv`) containing 3,000 clients and 25 attributes was processed using the Python script `process_data.py` to:
1. Map and label reference dimensions (e.g., `GenderId` to `Male`/`Female`).
2. Group continuous features like `Estimated Income` into logical categories (`Low`, `Mid`, `High` bands).
3. Compute the **Pearson Correlation Coefficient matrix** for the 9 principal numerical financial variables.
4. Output the aggregated and cleaned data into a production-ready JavaScript object (`data.js`) to bypass expensive runtime computation.

---

## 🚀 Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/bish-ds/banking-analytics-dashboard.git
   ```
2. Navigate to the project directory:
   ```bash
   cd banking-analytics-dashboard
   ```
3. Open `index.html` directly in any modern web browser, or serve it using a local development server (e.g., Live Server in VS Code).
