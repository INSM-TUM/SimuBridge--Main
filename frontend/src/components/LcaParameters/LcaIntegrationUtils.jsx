import SimulationModelModdle from "simulation-bridge-datamodel/DataModel";
import * as o from "olca-ipc";

export const processApiResponse = async (client, data, 
    getData, setFetchingProgress, toasting, impactMethodId,
    setAllCostDrivers, setIsCostDriversLoaded) => {
        const impactMethod = await client.get(
            o.RefType.ImpactMethod,
            { id: impactMethodId, refType: o.RefType.ImpactMethod })
          let e = impactMethod.nwSets
      
          var abstractCostDriversMap = new Map();
          for(const el of data)
          {
            console.log('Element:', el);
            let calcSetup = await o.CalculationSetup.of({
              target: el,
              impactMethod: impactMethod,
              nwSet: e[0],
              allocation: o.AllocationType.USE_DEFAULT_ALLOCATION,
              withCosts: false,
              withRegionalization: false
            });
      
            const result = await client?.calculate(calcSetup);
            if (!result) {
              console.log("calculation failed: no result retrieved");
            }
            const s = await result.untilReady();
            if (s.error) {
              console.log(s.error);
            } 
      
            const weight = await result.getWeightedImpacts();
            const impactSum = weight.map(i => i.amount || 0).reduce((sum, current) => sum + current, 0);
      
            let concreteCostDriverConfig = SimulationModelModdle.getInstance().create("simulationmodel:ConcreteCostDriver", {
              id: el.id,
              name: el.name,
              cost: impactSum,
            });
      
            if (!abstractCostDriversMap.has(el.category)) {
              let abstractDriver = SimulationModelModdle.getInstance().create("simulationmodel:AbstractCostDriver", {
                id: el.category,
                name: el.category,
                concreteCostDrivers: [concreteCostDriverConfig]
              });
              abstractCostDriversMap.set(el.category, abstractDriver);
            } else {
              let abstractDriver = abstractCostDriversMap.get(el.category);
              abstractDriver.concreteCostDrivers.push(concreteCostDriverConfig);
            }
      
            setFetchingProgress((data.indexOf(el) + 2) / (data.length+1) * 100);
          }
      
          const abstractCostDrivers = Array.from(abstractCostDriversMap.values());
      
          getData().getCurrentScenario().resourceParameters.environmentalCostDrivers = abstractCostDrivers;
      
          console.log('Abstract Cost Drivers:', abstractCostDrivers);
          console.log('Resource Parameters:', getData().getCurrentScenario().resourceParameters);
      
          await getData().saveCurrentScenario();
          toasting("success", "Success", "Cost drivers were successfully saved to the application");
          setAllCostDrivers(abstractCostDrivers);
          setIsCostDriversLoaded(true);
};

export const handleButtonClick = async (apiUrl, isApiUrlValid, 
    setIsFetchingRunning, setFetchingProgress, impactMethodId, 
    toasting, processApiResponseBound, getData, setAllCostDrivers, setIsCostDriversLoaded) => {
        if (!isApiUrlValid) {
            toasting("error", "Invalid URL", "Please enter a valid URL in the format 'http://[host]:[port]'");
            return;
          }
      
          setIsFetchingRunning(true);
      
          try {
            const client = new o.IpcClient.on(apiUrl);
            const systems = await client.getDescriptors(o.RefType.ProductSystem);
            console.log('Systems:', systems);
      
            toasting("info", "Success", "Cost drivers fetched successfully. Normalizing results...");
            setFetchingProgress(1/(systems.length + 1) * 100);
            await processApiResponseBound(client, systems);
      
            setIsFetchingRunning(false);
          }
          catch (error) {
            setIsFetchingRunning(false);
            toasting("error", "Error", "Please check if the OpenLCA IPC server is running and the URL is correct");
            console.error('API Error:', error);
          }
};