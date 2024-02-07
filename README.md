# SimuBridge-OLCA <br><sub>![CI](https://github.com/INSM-TUM/SimuBridge--Main/actions/workflows/CI.yml/badge.svg)</sub>

## :information_source: About
This repository serves as a supplementary branch to the main [SimuBridge](https://github.com/INSM-TUM/SimuBridge) project. It contains the source code for the web application that is the heartpice of the project. Please refer to the [root repository](https://github.com/INSM-TUM/SimuBridge) for overall project documentation.

This project focusses on **sustainability related information on SimuBridge**. The extensions made allows users to assign abstract environmental cost drivers to specific activities, and further refine these into concrete cost drivers for accurate impact assessment. The platform facilitates a deeper understanding of the environmental implications of different operational choices, providing valuable insights for sustainable decision-making.

## 📦️ Components
The web application is split into multiple pages, each with dedicated purpose.
Notably, the discovery and simulator views interact with the external process discovery and simulation tools, respectively.
#### Configure Process Model
Assign abstract cost drivers to activities within your process model.

#### Configure Cost Variants Panel
Use this panel to map abstract cost drivers to concrete cost drivers from dropdown menus.

#### Simulation
Configure the frequency of cost variants to simulate the process instances and calculate the overall environmental impact.

## Features
#### Flexible Simulation
Configure simulations with varying cost variants to explore different scenarios.

#### Impact Visualization
View and analyze the environmental impact of process instances through intuitive UI components.

## Results




We built the application using the Javascript library React, using the Chakra-UI design framework to ensure a modern look.

The application stores some information in the session storage, namely which projet is currently edited. Most persistence, however, happens using the browser [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), to ensure also large data, such as event logs, can be handled.
