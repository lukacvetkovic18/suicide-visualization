<div id="top"></div>
<div align="center">
<h3 align="center">Suicide Visualization</h3>

  <p align="center">
    This project analyzes and visualizes global suicide rates from 1985 to 2016 using data from the World Health Organization (WHO) and other sources. The goal is to identify patterns and trends related to demographic and socioeconomic factors.
  </p>
</div>

<!-- ABOUT THE PROJECT -->

## About The Project

### Project Goal
The primary objective of this project is to provide insights into global suicide rates and to identify key factors that influence these rates. By visualizing the data, we aim to highlight vulnerable populations that require targeted prevention measures.

### Dataset
The dataset used for this project can be found on [Kaggle](https://www.kaggle.com/datasets/russellyates88/suicide-rates-overview-1985-to-2016). It consolidates multiple data sources, allowing us to analyze global suicide trends in relation to factors such as GDP, population, age, gender, and country.

Example data format:
```json
{
    "country": "Greece",
    "year": 2015,
    "sex": "female",
    "age": "35-54 years",
    "suicides_no": 36,
    "population": 1627797,
    "suicides/100k pop": 2.21,
    "gdp_for_year ($)": "195,541,761,243",
    "gdp_per_capita ($)": 18927,
    "generation": "Generation X"
}
```

### Visualizations
The following visualizations are implemented in the project to analyze and interpret the data:

- **World Map**: Displays geographical differences in suicide rates per country. Darker shades represent higher rates.
- **Pie Chart**: Visualizes the distribution of suicides by gender.
- **Bar Charts**: Display age group and country-specific suicide rates, showing which demographics are most affected.
- **Scatter Plot**: Analyzes correlations between economic factors (e.g., GDP per capita) and suicide rates.
- **Line Chart**: Visualizes the median number of suicides over the years for various countries and demographics.

### Questions Addressed
The visualizations provide answers to the following key questions:
- **Geographical Analysis**: Which countries have the highest suicide rates? How do rates differ across continents and regions?
- **Demographic Insights**: Which age groups and genders are most affected by suicide? 
- **Trends Over Time**: How have suicide rates changed from 1985 to 2016?
- **Economic Impact**: Is there a correlation between a country’s economic factors (such as GDP) and its suicide rates?

<p align="right">(<a href="#top">back to top</a>)</p>