# SimuBridge-OLCA <br><sub>![CI](https://github.com/INSM-TUM/SimuBridge--Main/actions/workflows/CI.yml/badge.svg)</sub>

## :information_source: About
This repository serves as a supplementary branch to the main [SimuBridge](https://github.com/INSM-TUM/SimuBridge) project. It contains the source code for the web application that is the heartpice of the project. Please refer to the [root repository](https://github.com/INSM-TUM/SimuBridge) for overall project documentation.

This project focuses on **sustainability related information on SimuBridge**. The extensions made allows users to assign abstract environmental cost drivers to specific activities, and further refine these into concrete cost drivers for accurate impact assessment. The platform facilitates a deeper understanding of the environmental implications of different operational choices, providing valuable insights for sustainable decision-making.

## 📦️ Components
The web application is split into multiple pages, each with dedicated purpose.
Notably, the discovery and simulator views interact with the external process discovery and simulation tools, respectively.

#### LCA Integration Panel
Configure LCA with host and port for a flexible data fetching. For now, only availability is the normalization method of EF3.0 to calculate impacts.

#### Configure Cost Drivers nn Process Model 
Assign abstract cost drivers to activities within your process model in model based parameters panel.

#### LCA Variants Panel
Use this panel to map abstract cost drivers to concrete cost drivers from dropdown menus.
Configure the frequency of cost variants to simulate the process instances and calculate the overall environmental impact.

#### Simulation
Get the output of the  Scylla simulator to view extended XML files.

## Features
#### Flexible Simulation
Configure simulations with varying cost variants to explore different scenarios.

#### Impact Visualization
View and analyze the environmental impact of process instances through intuitive UI components.

## Results
We built the application using the Javascript library React, using the Chakra-UI design framework to ensure a modern look.
![Image](https://github.com/INSM-TUM-Teaching/SImuBridge-OLCA/assets/92756562/ea167f10-663d-4ea9-8df3-7ece260c61c7)
![Image](https://github.com/INSM-TUM-Teaching/SImuBridge-OLCA/assets/92756562/c4c45554-4587-4fc5-8bcc-b1eb9a0ce834)
![Image](https://github.com/INSM-TUM-Teaching/SImuBridge-OLCA/assets/92756562/8f63b277-1926-44e3-b5f0-0545cf485d22)




