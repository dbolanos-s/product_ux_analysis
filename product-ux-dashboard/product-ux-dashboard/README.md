# Product & UX Analytics — Google Merchandise Store

An interactive Product / UX analytics report built on top of GA4 e-commerce data, modeled visually on a published Power BI report: hairline-bordered visual containers, a neutral report canvas, a right-hand slicer rail, and a bottom page navigator.

The dashboard is the final presentation layer of a larger analysis pipeline that started in BigQuery and Python. It reads six pre-aggregated CSVs at runtime — nothing shown here is hardcoded.

## Project Overview

E-commerce teams rarely lack data; they lack a clear read on *where* users disengage and *why* it might be happening. This project analyzes anonymized GA4 event data from the Google Merchandise Store to trace the path from product view to purchase, and to surface where that path breaks down — by funnel stage, device, acquisition channel, product, and user cohort.

## Research Questions

- Where does the largest funnel drop-off occur?
- Does conversion differ across devices?
- Which acquisition sources combine traffic volume with conversion quality?
- Which products show high interest but unusually low conversion?
- How quickly does user retention decline after the first visit?
- Which monthly cohorts show stronger retention?

## Dataset

Data originates from the public **GA4 Google Merchandise Store** BigQuery export (`bigquery-public-data.ga4_obfuscated_sample_ecommerce`). Raw events were aggregated with SQL in BigQuery into six analysis-ready tables, exported as CSV, and validated in a Python/Jupyter notebook before being handed to this dashboard.

```
data/
├── funnel_general.csv       user counts per funnel stage, by source
├── funnel_device.csv        user counts and rates per funnel stage, by device
├── traffic_sources.csv      user counts and rates per funnel stage, by traffic source
├── product_anomalies.csv    products with high interest but unusually low conversion
├── retention_days.csv       exact-day retention (D0, D1, D7, D14, D30)
└── cohort_retention.csv     monthly cohort retention (M0, M1, M2…)
```

## Technologies

```
BigQuery
SQL
Python
Pandas
Jupyter Notebook
HTML5
CSS3
JavaScript (ES6+)
Chart.js
Papa Parse
```

No frameworks, build step, or backend — the report is a static site that can be published directly through GitHub Pages.

## Project Pipeline

```
GA4 Public Dataset
        ↓
BigQuery / SQL
        ↓
Aggregated CSVs
        ↓
Python / Jupyter Analysis
        ↓
HTML Analytics Dashboard  ← you are here
        ↓
Business & UX Insights
```

## Running locally

The dashboard loads its CSVs with `fetch` through Papa Parse, so the browser needs to see them served over HTTP — opening `index.html` directly via `file://` will fail silently in most browsers due to local file restrictions.

```bash
python -m http.server 8000
```

Then open:

```
http://localhost:8000
```

## Project structure

```
product-ux-dashboard/
│
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── data/
│   ├── funnel_general.csv
│   ├── funnel_device.csv
│   ├── traffic_sources.csv
│   ├── product_anomalies.csv
│   ├── retention_days.csv
│   └── cohort_retention.csv
└── README.md
```

## Report pages

| Page | Content |
|---|---|
| **Executive Overview** | Top-line KPIs, conversion funnel, drop-off by stage |
| **Acquisition & Devices** | Conversion by device, funnel performance by device, traffic volume vs. conversion by source |
| **Product Analysis** | Flagged high-interest / low-conversion products, revenue, sortable detail table |
| **Retention & Cohorts** | Exact-day retention curve, monthly cohort retention matrix, key findings |

Each KPI, chart, and narrative insight is computed from the CSVs at load time — including the "Key Insight" callouts, which build their sentences dynamically from whichever values the data actually contains.

## Key Findings

Generated dynamically on the **Retention & Cohorts** page from the live data — see the *Key Findings* panel in the report itself, which always reflects the current contents of `/data`.

## Limitations

- Dataset covers Nov 2020 – Jan 2021.
- Data are aggregated from BigQuery.
- The initial funnel is based on unique users per event and does not enforce a strict within-session event sequence.
- Observed differences do not establish causality.
- Product anomalies do not prove UX, price, or stock issues — they flag a pattern worth investigating.
- Long-term retention is limited by the observation window.
- The January cohort cannot be evaluated at M1 within this dataset.
