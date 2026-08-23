# Product & UX Analytics — Google Merchandise Store

End-to-end **Product Analytics and UX Research project** focused on understanding e-commerce user behavior, conversion funnels, acquisition, product performance, and retention.

The project uses the public **Google Analytics 4 (GA4) Google Merchandise Store dataset**, processed with **Google BigQuery and SQL**, analyzed with **Python and Pandas**, and presented through an interactive web dashboard.

[Live Dashboard](TU_LINK_GITHUB_PAGES) • [Analysis Notebook](notebooks/01_product_ux_analysis.ipynb) • [SQL Queries](sql/)

---

## Dashboard Preview

<img width="1900" height="964" alt="Captura de pantalla 2026-08-22 211210" src="https://github.com/user-attachments/assets/8cc0b4f2-408c-4978-8f19-3242c4c59983" />
<img width="1369" height="795" alt="Captura de pantalla 2026-08-22 211238" src="https://github.com/user-attachments/assets/1a8de822-7878-4835-bed7-f4ffe20c5ad9" />

> **Interactive version:** [Open Live Dashboard](TU_LINK_GITHUB_PAGES)

---

## Project Overview

The purpose of this project is to analyze how users move through an e-commerce purchase journey and identify behavioral patterns related to:

- conversion;
- acquisition;
- device performance;
- product behavior;
- retention;
- cohort performance.

The project goes beyond simple KPI reporting by using behavioral data to identify **friction points, anomalies, and areas that warrant further Product or UX investigation**.

The complete workflow combines:

**BigQuery → SQL → CSV → Python → Jupyter Notebook → Interactive Dashboard**

---

## Research Questions

The analysis addresses the following questions:

1. **Where does the largest drop-off occur in the purchase funnel?**
2. **Does conversion behavior differ across devices?**
3. **Which traffic sources generate the highest volume and which generate stronger conversion?**
4. **Which products show high user interest but unusually low final conversion?**
5. **How quickly does user retention decline after the first interaction?**
6. **Which monthly cohorts demonstrate stronger retention?**

---

## Dataset

The analysis uses the public **GA4 sample e-commerce dataset from the Google Merchandise Store**.

**Period analyzed:** November 1, 2020 – January 31, 2021

Initial exploration identified:

- **4,295,584 events**
- **270,154 unique users**
- **92 days of activity**

Relevant GA4 events include:

- `page_view`
- `user_engagement`
- `scroll`
- `view_item`
- `session_start`
- `first_visit`
- `view_promotion`
- `add_to_cart`
- `begin_checkout`
- `select_item`
- `view_search_results`
- `add_shipping_info`
- `add_payment_info`
- `purchase`

The original event-level dataset was queried directly in **Google BigQuery**.

---

## Project Workflow

```text
GA4 Public Dataset
        ↓
Google BigQuery
        ↓
SQL Data Extraction
        ↓
Aggregated Analytical CSVs
        ↓
Python / Pandas
        ↓
Exploratory & Research Analysis
        ↓
Interactive HTML Dashboard
        ↓
Product & UX Insights
```

---

## Technologies

### Data Querying

- Google BigQuery
- SQL

### Data Analysis

- Python
- Pandas
- NumPy
- Jupyter Notebook
- Matplotlib

### Dashboard Development

- HTML5
- CSS3
- JavaScript
- Chart.js
- Papa Parse

### Version Control & Deployment

- Git
- GitHub
- GitHub Pages

---

# Key Findings

## 1. Conversion Funnel

The purchase funnel was defined as:

```text
Product View
     ↓
Add to Cart
     ↓
Checkout
     ↓
Purchase
```

### Funnel Results

| Funnel Stage | Unique Users |
|---|---:|
| Product View | 61,252 |
| Add to Cart | 12,545 |
| Checkout | 9,715 |
| Purchase | 4,419 |

The overall **Product View → Purchase conversion rate** was:

**7.21%**

### Stage Performance

| Transition | Conversion Rate | Drop-off |
|---|---:|---:|
| Product View → Add to Cart | 20.48% | **79.52%** |
| Add to Cart → Checkout | 77.44% | **22.56%** |
| Checkout → Purchase | 45.49% | **54.51%** |

### Finding

The largest observed drop-off occurs between:

**Product View → Add to Cart**

with a **79.52% drop-off**.

A second substantial loss occurs between:

**Checkout → Purchase**

with a **54.51% drop-off**.

These two stages represent priority areas for further Product and UX investigation.

---

## 2. Device Performance

Conversion behavior was compared across:

- Mobile
- Desktop
- Tablet

### Overall Conversion Rate

| Device | Conversion Rate |
|---|---:|
| Mobile | **7.46%** |
| Desktop | **7.00%** |
| Tablet | **6.72%** |

### Finding

The initial descriptive hypothesis expected Mobile users to have a lower conversion rate than Desktop users.

However, the observed data showed the opposite:

**Mobile presented the highest observed conversion rate at 7.46%.**

The difference between Mobile and Desktop is relatively small and should be interpreted descriptively rather than as statistically significant without user-level sequential funnel data.

---

## 3. Traffic Source Analysis

Traffic sources were evaluated using:

- Product viewers
- Add-to-cart users
- Checkout users
- Purchasers
- Conversion rate

### Main Traffic Sources

| Traffic Source | Product Viewers | Purchasers | Conversion Rate |
|---|---:|---:|---:|
| `(data deleted)` | 4,924 | 680 | 13.81% |
| `shop.googlemerchandisestore.com` | 6,180 | 568 | 9.19% |
| `(direct)` | 16,492 | 1,054 | 6.39% |
| `<Other>` | 19,201 | 1,063 | 5.54% |
| `google` | 25,105 | 1,377 | 5.48% |

### Finding

`google` generated the **largest volume of product viewers**, but did not produce the highest final conversion rate.

This highlights an important distinction between:

**Traffic Volume**

and

**Traffic Conversion Quality**

A high acquisition volume does not necessarily imply stronger downstream purchasing behavior.

The `(data deleted)` source was treated cautiously because its original acquisition source is unavailable.

---

## 4. Product Anomaly Analysis

Products were analyzed using:

- unique viewers;
- cart users;
- buyers;
- average price;
- units purchased;
- revenue;
- View-to-Cart rate;
- final conversion rate.

Products were flagged using the following criteria:

```text
viewers >= 1000
view_to_cart_rate >= 20%
conversion_rate <= 1%
```

Approximately **84 products** met these criteria.

Several products showed:

- thousands of product views;
- strong Add-to-Cart activity;
- extremely low final conversion;
- in some cases, zero recorded buyers.

### Interpretation

These patterns warrant further investigation into possible factors such as:

- product availability;
- variants;
- pricing;
- analytics instrumentation;
- post-cart friction.

However, the available behavioral data do **not establish the cause** of these anomalies.

---

## 5. User Retention

Exact-day retention was measured for:

- D1
- D7
- D14
- D30

### Results

| Period | Retained Users | Retention Rate |
|---|---:|---:|
| D0 | 270,154 | 100.00% |
| D1 | 12,538 | **4.64%** |
| D7 | 1,966 | **0.73%** |
| D14 | 934 | **0.35%** |
| D30 | 322 | **0.12%** |

### Finding

User activity declines sharply after the first interaction.

The largest reduction occurs immediately after D0, with only **4.64% of users active exactly on D1**.

Retention continues to decrease across longer observation periods.

---

## 6. Monthly Cohort Analysis

Users were grouped according to the month of their first recorded activity.

### November 2020 Cohort

- Cohort size: **79,421 users**
- M1 retention: **5.86%**
- M2 retention: **1.52%**

### December 2020 Cohort

- Cohort size: **99,664 users**
- M1 retention: **2.53%**

### January 2021 Cohort

- Cohort size: **91,069 users**
- M1 retention cannot be evaluated because the dataset ends in January 2021.

### Finding

The **November 2020 cohort demonstrated stronger next-month retention** than the December cohort.

Because the dataset ends in January 2021, all cohorts do not have equivalent observation windows.

---

# Dashboard

The interactive dashboard is divided into four analytical sections.

## 1. Executive Overview

Provides a high-level view of the e-commerce funnel.

Includes:

- Product Viewers
- Add to Cart
- Checkout
- Purchasers
- Overall Conversion Rate
- Conversion Funnel
- Funnel Drop-off Analysis
- Key Insight

---

## 2. Acquisition & Devices

Analyzes behavioral differences across acquisition channels and devices.

Includes:

- Mobile conversion
- Desktop conversion
- Tablet conversion
- Conversion Rate by Device
- Funnel Performance by Device
- Traffic Volume by Source
- Conversion Rate by Traffic Source

---

## 3. Product Analysis

Focuses on products that generate strong interest but unusually low purchasing activity.

Includes:

- Flagged Products
- Products with Zero Buyers
- Product Viewers
- Cart Users
- Revenue
- View-to-Cart Rate
- Conversion Rate
- Interest vs Final Conversion
- Product-level anomaly table

---

## 4. Retention & Cohorts

Analyzes whether users return after their first interaction.

Includes:

- D1 Retention
- D7 Retention
- D14 Retention
- D30 Retention
- Retention Curve
- Monthly Cohort Analysis
- Cohort Retention Matrix

---

# Methodology

The analysis followed four main stages.

## 1. Data Exploration

The original GA4 dataset was explored in Google BigQuery to identify:

- event volume;
- unique users;
- observation period;
- relevant e-commerce events.

---

## 2. SQL Data Extraction

Six analytical datasets were created through SQL:

1. General conversion funnel
2. Funnel by device
3. Traffic source performance
4. Product anomalies
5. Exact-day retention
6. Monthly cohort retention

The SQL queries are available in the [`sql/`](sql/) directory.

---

## 3. Python Analysis

The exported CSV datasets were analyzed using:

- Pandas
- NumPy
- Matplotlib

The notebook contains:

- data validation;
- funnel analysis;
- device analysis;
- traffic acquisition analysis;
- product anomaly analysis;
- retention analysis;
- cohort analysis;
- interpretation of findings;
- research limitations.

The complete notebook is available here:

[Open Analysis Notebook](notebooks/01_product_ux_analysis.ipynb)

---

## 4. Interactive Dashboard

The analytical datasets are loaded directly into the web dashboard using JavaScript and Papa Parse.

The dashboard was designed to provide a concise and interactive representation of the principal findings.

---

# Repository Structure

```text
product_ux_analysis/
│
├── index.html
│
├── css/
│   └── styles.css
│
├── js/
│   └── app.js
│
├── data/
│   ├── funnel_general.csv
│   ├── funnel_device.csv
│   ├── traffic_sources.csv
│   ├── product_anomalies.csv
│   ├── retention_days.csv
│   └── cohort_retention.csv
│
├── notebooks/
│   └── 01_product_ux_analysis.ipynb
│
├── sql/
│   ├── 01_funnel_general.sql
│   ├── 02_funnel_device.sql
│   ├── 03_traffic_sources.sql
│   ├── 04_product_anomalies.sql
│   ├── 05_retention_days.sql
│   └── 06_cohort_retention.sql
│
├── images/
│   └── dashboard-preview.png
│
├── README.md
└── .gitignore
```

---

# Running the Dashboard Locally

Clone the repository:

```bash
git clone https://github.com/TU_USUARIO/product_ux_analysis.git
```

Enter the project directory:

```bash
cd product_ux_analysis
```

Start a local HTTP server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

A local HTTP server is required because the dashboard loads CSV files dynamically through JavaScript.

---

# Deployment

The project can be deployed directly with **GitHub Pages**.

### GitHub Pages Configuration

Go to:

```text
Repository
→ Settings
→ Pages
→ Build and deployment
→ Deploy from a branch
```

Select:

```text
Branch: main
Folder: / (root)
```

The deployed dashboard will be available at a URL similar to:

```text
https://TU_USUARIO.github.io/product_ux_analysis/
```

---

# Research Limitations

Several limitations should be considered when interpreting the findings.

### Aggregated Data

The dashboard uses aggregated datasets generated from BigQuery rather than the original event-level data.

---

### Funnel Definition

The initial conversion funnel counts unique users associated with each event.

It does **not enforce a strict ordered sequence within the same session**.

Therefore, it should be interpreted as an aggregated behavioral funnel rather than a strict session-level funnel.

---

### Statistical Significance

Device differences are descriptive.

A formal statistical comparison would require user-level data and a strict sequential funnel definition.

---

### Causality

Observed behavioral patterns do not establish causal relationships.

For example, a product with strong cart activity but low purchasing activity cannot automatically be interpreted as having:

- a UX problem;
- excessive pricing;
- unavailable inventory.

Additional research would be required.

---

### Retention Window

The dataset contains approximately three months of activity.

Long-term retention analysis is therefore constrained by the available observation period.

---

### Cohort Censoring

The January 2021 cohort cannot be evaluated at M1 because no February data are available.

Missing cohort periods should therefore not be interpreted as 0% retention.

---

# Potential Future Work

Possible extensions include:

- strict session-level funnel reconstruction;
- user-level behavioral analysis;
- statistical testing across devices;
- cumulative retention analysis;
- behavioral segmentation;
- A/B testing;
- product recommendation analysis;
- conversion prediction;
- customer journey analysis.

---

# Skills Demonstrated

This project demonstrates practical experience with:

### Data

- Google BigQuery
- SQL
- Data Extraction
- Data Transformation
- Data Validation

### Analytics

- Product Analytics
- Funnel Analysis
- Conversion Analysis
- Acquisition Analysis
- Retention Analysis
- Cohort Analysis
- Behavioral Analysis
- Product Anomaly Detection

### Research

- Research Question Formulation
- Hypothesis-Driven Analysis
- Interpretation of Behavioral Data
- Identification of Limitations
- Avoidance of Unsupported Causal Claims

### Programming

- Python
- Pandas
- NumPy
- JavaScript
- HTML
- CSS

### Visualization

- Matplotlib
- Chart.js
- Interactive Dashboard Development

### Engineering & Reproducibility

- Git
- GitHub
- GitHub Pages
- Project Documentation
- Reproducible Analysis Workflow

---

# Project Summary

This project demonstrates an end-to-end analytics workflow:

```text
Raw Behavioral Data
        ↓
SQL Analysis
        ↓
Analytical Datasets
        ↓
Python Research Analysis
        ↓
Interactive Visualization
        ↓
Product & UX Insights
```

The main objective was not simply to create a dashboard, but to use behavioral data to identify relevant patterns, formulate research questions, and communicate findings while clearly distinguishing **observed evidence from possible explanations**.

---

# Author

**Doménica Bolaños**

Computer Science Student — ESPOL

Areas of interest:

- Data Science
- Data Analytics
- Machine Learning
- Research
- Product Analytics

GitHub: [dbolanos-s](https://github.com/dbolanos-s)

---

## Disclaimer

This project was developed for educational and portfolio purposes using the public Google Analytics 4 sample e-commerce dataset.

All findings represent analytical observations derived from the available data and should not be interpreted as causal claims.
