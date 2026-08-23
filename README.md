# Product & UX Analytics — Google Merchandise Store

Proyecto end-to-end de **Product Analytics y análisis cuantitativo de UX**, enfocado en comprender el comportamiento de usuarios de e-commerce, funnels de conversión, adquisición, desempeño de productos y retención.

El proyecto utiliza el dataset público de **Google Analytics 4 (GA4) de Google Merchandise Store**, procesado mediante **Google BigQuery y SQL**, analizado con **Python y Pandas**, y presentado mediante un dashboard web interactivo.

[Dashboard en vivo](https://dbolanos-s.github.io/product_ux_analysis/) · [Notebook de análisis](https://colab.research.google.com/drive/1uwRkgZAmZs1LaEksH7a1Vf6ZDwSpjXrc?authuser=2) · [Consultas SQL](sql/)

---

# Vista previa del dashboard

<img width="1900" height="964" alt="Dashboard Product & UX Analytics" src="https://github.com/user-attachments/assets/8cc0b4f2-408c-4978-8f19-3242c4c59983" />

<img width="1369" height="795" alt="Dashboard Product & UX Analytics" src="https://github.com/user-attachments/assets/1a8de822-7878-4835-bed7-f4ffe20c5ad9" />

> **Versión interactiva:** [Abrir dashboard en vivo](https://dbolanos-s.github.io/product_ux_analysis/)

---

# Descripción general del proyecto

El propósito de este proyecto es analizar cómo los usuarios avanzan a través del journey de compra de un e-commerce e identificar patrones de comportamiento relacionados con:

- conversión;
- adquisición;
- desempeño por dispositivo;
- comportamiento de productos;
- retención;
- desempeño de cohortes.

El proyecto va más allá de la presentación de KPIs al utilizar datos conductuales para identificar **posibles puntos de fricción, anomalías y áreas que requieren una investigación adicional de Producto o UX**.

El flujo completo combina:

```text
Google Analytics 4
        ↓
Google BigQuery
        ↓
Consultas SQL
        ↓
Datasets analíticos CSV
        ↓
Python / Pandas
        ↓
Análisis exploratorio y de investigación
        ↓
Dashboard interactivo
        ↓
Insights de Producto y UX
```

---

# Preguntas de investigación

El análisis busca responder las siguientes preguntas:

1. **¿En qué etapa del funnel de compra ocurre el mayor abandono?**
2. **¿El comportamiento de conversión difiere entre dispositivos?**
3. **¿Qué fuentes de tráfico generan mayor volumen y cuáles presentan mejores tasas de conversión?**
4. **¿Qué productos presentan alto interés de usuarios pero una conversión final inusualmente baja?**
5. **¿Qué tan rápido disminuye la retención después de la primera interacción?**
6. **¿Qué cohortes mensuales presentan un mejor comportamiento de retención?**

---

# Dataset

El análisis utiliza el dataset público de e-commerce de **Google Analytics 4 de Google Merchandise Store**.

**Periodo analizado:** 1 de noviembre de 2020 – 31 de enero de 2021

La exploración inicial identificó:

- **4,295,584 eventos**
- **270,154 usuarios únicos**
- **92 días de actividad**

Entre los eventos relevantes de GA4 se encuentran:

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

El dataset original a nivel de eventos fue consultado directamente desde **Google BigQuery**.

---

# Flujo de trabajo

```text
Dataset público GA4
        ↓
Google BigQuery
        ↓
Extracción mediante SQL
        ↓
Datasets analíticos agregados
        ↓
Python / Pandas
        ↓
Análisis exploratorio
        ↓
Interpretación de resultados
        ↓
Dashboard web interactivo
        ↓
Insights de Producto y UX
```

---

# Tecnologías utilizadas

## Consulta y procesamiento de datos

- Google BigQuery
- SQL

## Análisis de datos

- Python
- Pandas
- NumPy
- Jupyter Notebook
- Matplotlib

## Desarrollo del dashboard

- HTML5
- CSS3
- JavaScript
- Chart.js
- Papa Parse

## Control de versiones y despliegue

- Git
- GitHub
- GitHub Pages

---

# Principales hallazgos

## 1. Funnel de conversión

El funnel de compra fue definido como:

```text
Product View
     ↓
Add to Cart
     ↓
Checkout
     ↓
Purchase
```

### Resultados del funnel

| Etapa | Usuarios únicos |
|---|---:|
| Product View | 61,252 |
| Add to Cart | 12,545 |
| Checkout | 9,715 |
| Purchase | 4,419 |

La tasa global de conversión:

**Product View → Purchase**

fue de:

**7.21%**

### Desempeño por etapa

| Transición | Tasa de conversión | Drop-off |
|---|---:|---:|
| Product View → Add to Cart | 20.48% | **79.52%** |
| Add to Cart → Checkout | 77.44% | **22.56%** |
| Checkout → Purchase | 45.49% | **54.51%** |

### Hallazgo

El mayor abandono observado ocurre entre:

**Product View → Add to Cart**

con un **drop-off de 79.52%**.

Una segunda pérdida relevante ocurre entre:

**Checkout → Purchase**

con un **drop-off de 54.51%**.

Estas dos etapas representan áreas prioritarias para una investigación posterior de Producto y UX.

> Los datos permiten identificar **dónde** ocurre una pérdida importante de usuarios, pero no permiten concluir directamente **por qué** ocurre.

---

# 2. Desempeño por dispositivo

El comportamiento de conversión fue comparado entre:

- Mobile
- Desktop
- Tablet

### Tasa de conversión general

| Dispositivo | Tasa de conversión |
|---|---:|
| Mobile | **7.46%** |
| Desktop | **7.00%** |
| Tablet | **6.72%** |

### Hallazgo

La hipótesis descriptiva inicial esperaba que los usuarios Mobile presentaran una menor conversión que los usuarios Desktop.

Sin embargo, los datos observados mostraron lo contrario:

**Mobile presentó la tasa de conversión observada más alta, con 7.46%.**

La diferencia entre Mobile y Desktop es relativamente pequeña.

Por esta razón, se interpreta como un resultado **descriptivo** y no como una diferencia estadísticamente significativa.

Para realizar una comparación inferencial más rigurosa sería necesario trabajar con datos a nivel de usuario y un funnel secuencial correctamente definido.

---

# 3. Análisis de fuentes de tráfico

Las fuentes de tráfico fueron evaluadas utilizando:

- Product Viewers;
- usuarios Add-to-Cart;
- usuarios que iniciaron Checkout;
- compradores;
- tasa de conversión.

### Principales fuentes de tráfico

| Fuente | Product Viewers | Compradores | Tasa de conversión |
|---|---:|---:|---:|
| `(data deleted)` | 4,924 | 680 | 13.81% |
| `shop.googlemerchandisestore.com` | 6,180 | 568 | 9.19% |
| `(direct)` | 16,492 | 1,054 | 6.39% |
| `<Other>` | 19,201 | 1,063 | 5.54% |
| `google` | 25,105 | 1,377 | 5.48% |

### Hallazgo

`google` generó el **mayor volumen de usuarios que visualizaron productos**, pero no presentó la tasa de conversión final más alta.

Esto permite distinguir entre:

```text
Volumen de adquisición
        ≠
Calidad de conversión
```

Una fuente de tráfico puede atraer una gran cantidad de usuarios sin necesariamente producir un comportamiento de compra proporcionalmente superior.

La categoría `(data deleted)` debe interpretarse con cautela debido a que la fuente de adquisición original no está disponible.

---

# 4. Análisis de anomalías de productos

Los productos fueron analizados utilizando:

- usuarios únicos que visualizaron el producto;
- usuarios que agregaron al carrito;
- compradores;
- precio promedio;
- unidades compradas;
- revenue;
- View-to-Cart Rate;
- tasa de conversión final.

Se definieron los siguientes criterios para identificar productos que merecen investigación adicional:

```text
viewers >= 1000
view_to_cart_rate >= 20%
conversion_rate <= 1%
```

Aproximadamente **84 productos** cumplieron estos criterios.

Algunos productos presentaron:

- miles de visualizaciones;
- fuerte actividad de Add-to-Cart;
- conversión final extremadamente baja;
- en algunos casos, cero compradores registrados.

### Interpretación

Estos patrones justifican una investigación adicional sobre factores como:

- disponibilidad;
- variantes;
- precios;
- instrumentación analítica;
- fricción después de agregar al carrito.

Sin embargo, los datos conductuales disponibles **no permiten establecer la causa** de estas anomalías.

Por ejemplo:

```text
Alta intención
+
Baja compra
```

no demuestra automáticamente:

```text
Problema UX
```

Se requiere evidencia adicional.

---

# 5. Retención de usuarios

Se calculó retención exacta para:

- D1
- D7
- D14
- D30

### Resultados

| Periodo | Usuarios retenidos | Tasa de retención |
|---|---:|---:|
| D0 | 270,154 | 100.00% |
| D1 | 12,538 | **4.64%** |
| D7 | 1,966 | **0.73%** |
| D14 | 934 | **0.35%** |
| D30 | 322 | **0.12%** |

### Hallazgo

La actividad de usuarios disminuye rápidamente después de la primera interacción.

La mayor reducción ocurre inmediatamente después de D0:

**solo 4.64% de los usuarios estuvieron activos exactamente en D1.**

La retención continúa disminuyendo a medida que aumenta la ventana temporal.

---

# 6. Análisis de cohortes mensuales

Los usuarios fueron agrupados según el mes de su primera actividad registrada.

## Cohorte de noviembre de 2020

- Tamaño de la cohorte: **79,421 usuarios**
- Retención M1: **5.86%**
- Retención M2: **1.52%**

## Cohorte de diciembre de 2020

- Tamaño de la cohorte: **99,664 usuarios**
- Retención M1: **2.53%**

## Cohorte de enero de 2021

- Tamaño de la cohorte: **91,069 usuarios**
- No es posible evaluar M1 porque el dataset termina en enero de 2021.

### Hallazgo

La cohorte de **noviembre de 2020 presentó una mayor retención al siguiente mes** que la cohorte de diciembre.

Sin embargo, las cohortes no poseen ventanas de observación equivalentes.

Por esta razón, los periodos no observados no deben interpretarse como:

```text
0% de retención
```

sino como:

```text
Periodo no disponible
```

---

# Dashboard

El dashboard interactivo está dividido en cuatro secciones analíticas.

---

## 1. Executive Overview

Presenta una visión general del funnel de compra.

Incluye:

- Product Viewers
- Add to Cart
- Checkout
- Purchasers
- Overall Conversion Rate
- Conversion Funnel
- Funnel Drop-off Analysis
- Key Insight

Esta sección permite identificar rápidamente las etapas con mayores pérdidas de usuarios.

---

## 2. Acquisition & Devices

Analiza diferencias de comportamiento según dispositivo y fuente de adquisición.

Incluye:

- Mobile Conversion
- Desktop Conversion
- Tablet Conversion
- Conversion Rate by Device
- Funnel Performance by Device
- Traffic Volume by Source
- Conversion Rate by Traffic Source

Esta página permite diferenciar entre:

```text
Volumen de tráfico
```

y:

```text
Calidad de conversión
```

---

## 3. Product Analysis

Se enfoca en productos que generan un alto nivel de interés pero una actividad de compra inusualmente baja.

Incluye:

- Flagged Products
- Products with Zero Buyers
- Product Viewers
- Cart Users
- Revenue
- View-to-Cart Rate
- Conversion Rate
- Interest vs Final Conversion
- tabla detallada de anomalías

El objetivo no es concluir automáticamente que existe un problema de UX, sino identificar productos que requieren investigación adicional.

---

## 4. Retention & Cohorts

Analiza si los usuarios regresan después de su primera interacción.

Incluye:

- D1 Retention
- D7 Retention
- D14 Retention
- D30 Retention
- Retention Curve
- Monthly Cohort Analysis
- Cohort Retention Matrix

Esta sección permite estudiar tanto retención individual por día como diferencias entre cohortes.

---

# Metodología

El análisis siguió cuatro etapas principales.

---

## 1. Exploración de datos

El dataset original de GA4 fue explorado en Google BigQuery para identificar:

- volumen de eventos;
- usuarios únicos;
- periodo de observación;
- eventos relevantes de e-commerce.

Esta etapa permitió comprender la estructura del dataset antes de construir las consultas analíticas.

---

## 2. Extracción de datos mediante SQL

Se construyeron seis datasets analíticos mediante SQL:

1. Funnel general de conversión
2. Funnel por dispositivo
3. Desempeño por fuente de tráfico
4. Anomalías de productos
5. Retención por día
6. Retención por cohortes

Las consultas están disponibles en:

[`sql/`](sql/)

La estructura es:

```text
sql/
├── 01_funnel_general.sql
├── 02_funnel_device.sql
├── 03_traffic_sources.sql
├── 04_product_anomalies.sql
├── 05_retention_days.sql
└── 06_cohort_retention.sql
```

---

# 3. Análisis con Python

Los datasets exportados fueron analizados utilizando:

- Pandas
- NumPy
- Matplotlib
- Jupyter Notebook

El notebook contiene:

- validación de datos;
- análisis del funnel;
- análisis por dispositivo;
- análisis de adquisición;
- análisis de productos;
- análisis de retención;
- análisis de cohortes;
- interpretación de resultados;
- limitaciones metodológicas;
- conclusiones.

Notebook completo:

[Ver notebook en Google Colab](https://colab.research.google.com/drive/1uwRkgZAmZs1LaEksH7a1Vf6ZDwSpjXrc?authuser=2)

También se encuentra dentro del repositorio:

[`notebooks/01_product_ux_analysis.ipynb`](notebooks/01_product_ux_analysis.ipynb)

---

# 4. Dashboard interactivo

Los datasets analíticos son cargados directamente por el dashboard utilizando JavaScript y Papa Parse.

La arquitectura es:

```text
CSV analíticos
      ↓
JavaScript
      ↓
Procesamiento de datos
      ↓
Chart.js
      ↓
Dashboard interactivo
```

Esto evita escribir manualmente los resultados principales dentro de las visualizaciones.

El objetivo del dashboard es presentar los resultados del análisis de una forma:

- clara;
- interactiva;
- orientada a Producto;
- útil para comunicar findings;
- accesible desde el navegador.

---

# Estructura del repositorio

```text
product_ux_analysis/
│
├── index.html
│
├── README.md
├── .gitignore
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
└── images/
    └── dashboard-preview.png
```

---

# Ejecución local

Clonar el repositorio:

```bash
git clone https://github.com/dbolanos-s/product_ux_analysis.git
```

Entrar al proyecto:

```bash
cd product_ux_analysis
```

Ejecutar un servidor HTTP:

```bash
python -m http.server 8000
```

Abrir en el navegador:

```text
http://localhost:8000
```

> No se recomienda abrir `index.html` directamente mediante `file://`, ya que el navegador puede bloquear la carga local de archivos CSV mediante `fetch()`.

---

# Despliegue

El proyecto está desplegado mediante **GitHub Pages**.

Dashboard público:

[https://dbolanos-s.github.io/product_ux_analysis/](https://dbolanos-s.github.io/product_ux_analysis/)

La configuración utilizada es:

```text
Repository
→ Settings
→ Pages
→ Build and deployment
→ Deploy from a branch
```

Configuración:

```text
Branch: main
Folder: / (root)
```

---

# Limitaciones de la investigación

Los resultados deben interpretarse considerando varias limitaciones metodológicas.

---

## Datos agregados

El dashboard utiliza datasets agregados generados desde BigQuery y no el dataset completo a nivel de evento.

Esto facilita la visualización y comunicación, pero limita determinados análisis a nivel individual.

---

## Definición del funnel

El funnel inicial cuenta usuarios únicos asociados con cada evento.

No exige estrictamente que un usuario haya realizado:

```text
Product View
→ Add to Cart
→ Checkout
→ Purchase
```

en ese orden y dentro de la misma sesión.

Por esta razón, se interpreta como:

**funnel conductual agregado**

y no como:

**funnel secuencial estricto por sesión**.

---

## Significancia estadística

Las diferencias observadas por dispositivo son descriptivas.

Una comparación inferencial más rigurosa requeriría datos a nivel de usuario y una definición secuencial consistente del funnel.

---

## Causalidad

Los patrones observados no demuestran relaciones causales.

Por ejemplo, un producto que presenta:

```text
Alta actividad de carrito
+
Baja actividad de compra
```

no puede interpretarse automáticamente como evidencia de:

- problemas UX;
- precios excesivos;
- falta de inventario;
- errores técnicos.

Estas son posibles hipótesis que requieren investigación adicional.

---

## Ventana de retención

El dataset contiene aproximadamente tres meses de actividad.

Por esta razón, el análisis de retención de largo plazo está limitado por el periodo disponible.

---

## Censura de cohortes

La cohorte de enero de 2021 no puede evaluarse en M1 porque no existen datos de febrero.

Los periodos faltantes deben interpretarse como:

**no observados**

y no como:

**0% de retención**.

---

# Posibles extensiones

El proyecto puede ampliarse mediante:

- reconstrucción de funnel secuencial por sesión;
- análisis conductual a nivel de usuario;
- comparación estadística entre dispositivos;
- análisis de duración de sesión;
- retención acumulada;
- segmentación conductual;
- A/B Testing;
- Customer Journey Mapping;
- análisis de comportamiento antes del abandono;
- integración de pruebas de usabilidad;
- métricas SUS y CES;
- modelos de predicción de conversión;
- sistemas de recomendación de productos.

---

# Habilidades demostradas

## Datos

- Google BigQuery
- SQL
- Extracción de datos
- Transformación de datos
- Validación de datos

## Analytics

- Product Analytics
- Funnel Analysis
- Conversion Analysis
- Acquisition Analysis
- Retention Analysis
- Cohort Analysis
- Behavioral Analysis
- Product Anomaly Detection

## Research

- Formulación de preguntas de investigación
- Análisis basado en hipótesis
- Interpretación de datos conductuales
- Identificación de limitaciones
- Diferenciación entre evidencia y explicación
- Prevención de conclusiones causales no respaldadas

## Programación

- Python
- Pandas
- NumPy
- JavaScript
- HTML
- CSS

## Visualización

- Matplotlib
- Chart.js
- Desarrollo de dashboards interactivos

## Ingeniería y reproducibilidad

- Git
- GitHub
- GitHub Pages
- Documentación de proyectos
- Flujos de análisis reproducibles

---

# Resumen del proyecto

Este proyecto demuestra un flujo completo de análisis:

```text
Datos conductuales
        ↓
BigQuery + SQL
        ↓
Datasets analíticos
        ↓
Python / Pandas
        ↓
Análisis de comportamiento
        ↓
Visualización interactiva
        ↓
Insights de Producto y UX
```

El objetivo principal no fue simplemente desarrollar un dashboard.

El objetivo fue utilizar datos conductuales para:

- formular preguntas de investigación;
- identificar patrones relevantes;
- localizar posibles puntos de fricción;
- comparar segmentos;
- analizar retención;
- detectar anomalías;
- comunicar resultados;
- diferenciar evidencia observada de explicaciones causales.

---

# Conclusión

Los datos permitieron identificar dos etapas particularmente relevantes del journey de compra:

```text
Product View
→ Add to Cart
```

y:

```text
Checkout
→ Purchase
```

debido a sus elevados niveles de abandono.

También se identificaron:

- diferencias descriptivas entre dispositivos;
- diferencias entre volumen y calidad de fuentes de adquisición;
- productos con alto interés pero baja conversión;
- una fuerte disminución de retención después de la primera interacción;
- diferencias entre cohortes mensuales.

Sin embargo, los resultados no permiten concluir automáticamente cuáles son las causas de estos patrones.

Por esta razón, el proyecto utiliza los datos principalmente para:

> **identificar dónde investigar y qué preguntas formular**, en lugar de atribuir causas que el dataset no puede demostrar.

Esta distinción entre **medición, interpretación y causalidad** es una parte central del enfoque del proyecto.

---

# Autora

**Doménica Bolaños**

Estudiante de Ciencias de la Computación — ESPOL

Áreas de interés:

- Data Science
- Data Analytics
- Machine Learning
- Research
- Product Analytics
- UX / Product Research

GitHub: [dbolanos-s](https://github.com/dbolanos-s)

---

# Disclaimer

Este proyecto fue desarrollado con fines educativos y de portafolio utilizando el dataset público de muestra de Google Analytics 4 para e-commerce.

Todos los resultados corresponden a observaciones analíticas derivadas de los datos disponibles y **no deben interpretarse como relaciones causales sin evidencia adicional**.
