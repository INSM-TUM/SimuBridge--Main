import SimulationModelModdle from "simulation-bridge-datamodel/DataModel";

export const saveCostVariant = async (allCostDrivers, variant, //variants,
     updatedVariants, getData) => {
    //save variants and its mappings
    let driversMappings = variant.mappings.map(mapping => {
        return SimulationModelModdle.getInstance().create("simulationmodel:DriversMapping", {
            abstractDriver: mapping.abstractDriver,
            concreteDriver: mapping.concreteDriver,
        });
    });

    let variantExtended = SimulationModelModdle.getInstance().create("simulationmodel:VariantExtended", {
        id: variant.id,
        name: variant.name,
        frequency: variant.frequency,
        mappings: driversMappings,
    });
    let updatedVariantsObject = [...updatedVariants.filter(v => v.id !== variant.id), variantExtended];
    const environmentMappingConfig =
        SimulationModelModdle.getInstance().create("simulationmodel:EnvironmentMappingConfig", {
            variants: updatedVariantsObject,
        });
    getData().getCurrentScenario().resourceParameters.environmentMappingConfig = environmentMappingConfig;
    await getData().saveCurrentScenario();

    saveCostVariantConfig(getData, allCostDrivers);
    await getData().saveCurrentScenario();
};

export const saveCostVariantConfig = async (getData, allCostDrivers) => {
    const scenario = getData().getCurrentScenario();

    if (!scenario) {
        return;
    }

    const variants = scenario.resourceParameters.environmentMappingConfig.variants;

    let costVariantConfig = SimulationModelModdle.getInstance().create("simulationmodel:CostVariantConfig", {
        count: variants.length,
        variants: [],
    });

    variants.forEach(v => {
        let drivers = [];
        v.mappings.forEach(m => {
            const concreteDriver = allCostDrivers
                .flatMap(driver => driver.concreteCostDrivers)
                .find(driver => driver.id === m.concreteDriver);
            const driver = SimulationModelModdle.getInstance().create("simulationmodel:Driver", {
                id: m.abstractDriver,
                cost: concreteDriver ? concreteDriver.cost : 0,
            });
            drivers.push(driver);
        });

        console.log('Drivers:', drivers);
        let costVariant = SimulationModelModdle.getInstance().create("simulationmodel:Variant", {
            id: v.id,
            name: v.name,
            frequency: v.frequency,
            drivers: drivers,
        });
        costVariantConfig.variants.push(costVariant);
    });

    console.log('COST VARIANT CONFIG:', costVariantConfig);
    getData().getCurrentScenario().resourceParameters.CostVariantConfig = costVariantConfig;
    await getData().saveCurrentScenario();
}

export const deleteVariant = async (variantId, variants, getData, toasting) => {
    //delete from configuration

    const environmentMappingConfig = SimulationModelModdle.getInstance().create("simulationmodel:EnvironmentMappingConfig", {
        variants: getData().getCurrentScenario()
            .resourceParameters.environmentMappingConfig.variants.filter(v => v.id !== variantId),
    });
    getData().getCurrentScenario().resourceParameters.environmentMappingConfig = environmentMappingConfig;
    await getData().saveCurrentScenario();

    // Delete variant from CostVariantConfig for team B
    let costVariantConfig = getData().getCurrentScenario().resourceParameters.costVariantConfig;
    const updatedCostVariantConfig = { ...costVariantConfig };

    updatedCostVariantConfig.variants = updatedCostVariantConfig.variants.filter(v => v.id !== variantId);
    updatedCostVariantConfig.count = updatedCostVariantConfig.variants.length;
    getData().getCurrentScenario().resourceParameters.CostVariantConfig = updatedCostVariantConfig;
    await getData().saveCurrentScenario();

    console.log('CostVariantConfig:', getData().getCurrentScenario().resourceParameters.CostVariantConfig);

    toasting("info", "Variant deleted", "Cost variant deleted successfully");
};