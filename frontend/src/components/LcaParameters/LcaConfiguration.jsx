import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Card, CardHeader, CardBody, Button, Flex, Text,
  Alert, AlertIcon, AlertDescription, CloseButton, Link,
  UnorderedList, ListItem,
  Accordion, AccordionItem, AccordionPanel, AccordionButton
} from '@chakra-ui/react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import VariantEditor from './VariantEditor';

import SimulationModelModdle, { assign, limitToDataScheme } from "simulation-bridge-datamodel/DataModel";

function LcaConfiguration({ getData, toasting }) {
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({ name: '', mappings: [], frequency: 15 });
  const [allCostDrivers, setAllCostDrivers] = useState([]);
  const [bpmnActivities, setBpmnActivities] = useState([]);
  const [isCostDriversLoaded, setIsCostDriversLoaded] = useState(false);

  useEffect(() => {
    const scenario = getData().getCurrentScenario();

    if (scenario) {
      const costDrivers = scenario.resourceParameters.environmentalCostDrivers;
      const uniqueCostDrivers = Array.from(new Map(costDrivers.map(item => [item.id, item])).values());
      setAllCostDrivers(uniqueCostDrivers);
      setIsCostDriversLoaded(uniqueCostDrivers.length > 0);

      console.log('environmentMappingConfig:', scenario.resourceParameters.environmentMappingConfig.variants);
      const environmentMappingConfig = scenario.resourceParameters.environmentMappingConfig;
      if (environmentMappingConfig && environmentMappingConfig.variants) {
        setVariants(environmentMappingConfig.variants);
      }
    }

    const modelData = getData().getCurrentModel();
    if (modelData && modelData.elementsById) {
      const extractedTasks = Object.entries(modelData.elementsById)
        .filter(([_, value]) => value.$type === 'bpmn:Task')
        .map(([id, value]) => ({ id, name: value.name }));
      const uniqueBpmnActivities = Array.from(new Map(extractedTasks.map(item => [item.id, item])).values());
      setBpmnActivities(uniqueBpmnActivities);
    }
  }, []);

  const saveCostVariant = async (variant) => {
    const isExistingVariant = variant.id && variants.some(v => v.id === variant.id);
    if (!isExistingVariant) {
      variant.id = uuidv4();
    }
    const updatedVariants = variants.filter(v => v.id !== variant.id);
    updatedVariants.push(variant);

    setVariants(updatedVariants);

    //save variants and its mappings
    let driverTaskMappings = variant.mappings.map(mapping => {
      return SimulationModelModdle.getInstance().create("simulationmodel:DriverTaskMapping", {
        task: mapping.task,
        abstractDriver: mapping.abstractDriver,
        concreteDriver: mapping.concreteDriver,
      });
    });

    let variantExtended = SimulationModelModdle.getInstance().create("simulationmodel:VariantExtended", {
      id: variant.id,
      name: variant.name,
      frequency: variant.frequency,
      mappings: driverTaskMappings,
    });
    let updatedVariantsObject = [...variants.filter(v => v.id !== variant.id), variantExtended];
    const environmentMappingConfig =
      SimulationModelModdle.getInstance().create("simulationmodel:EnvironmentMappingConfig", {
        variants: updatedVariantsObject,
      });
    getData().getCurrentScenario().resourceParameters.environmentMappingConfig = environmentMappingConfig;
    await getData().saveCurrentScenario();

    //save CostVariantConfig for Team B
    let costVariantConfig = SimulationModelModdle.getInstance().create("simulationmodel:CostVariantConfig", {
      count: updatedVariants.length,
      variants: [],
    });

    console.log('All cost drivers:', allCostDrivers);

    updatedVariants.forEach(v => {
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

    console.log('CostVariantConfig:', costVariantConfig);
    getData().getCurrentScenario().resourceParameters.CostVariantConfig = costVariantConfig;
    await getData().saveCurrentScenario();

    setCurrentVariant({ name: '', mappings: [], frequency: 15 });
    toasting("success", "Variant saved", "Cost variant saved successfully");
  };

  const editVariant = (variant) => {
    setCurrentVariant({ ...variant });
  };

  const deleteVariant = async (variantId) => {
    setVariants(variants.filter(v => v.id !== variantId));
    if (currentVariant.id === variantId) {
      setCurrentVariant({ name: '', mappings: [], frequency: 15 });
    }

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

  return (
    <Box>
      <Heading size='lg'>Environmental Configuration for {getData().getCurrentScenario().scenarioName}</Heading>
      {!isCostDriversLoaded ?
        <Alert status='warning' mt={2} display='flex' alignItems='center' justifyContent='space-between'>
          <Flex alignItems='center'>
            <AlertIcon />
            <AlertDescription>Cost drivers are not loaded. Please load the cost drivers from the OLCA server.</AlertDescription>
          </Flex>
          <Link href='/lcaintegration' color='blue.500'>Load cost drivers</Link>
        </Alert> :
        <Box>
          <Card my={2}>
            <CardHeader>
              <Heading size='md'>Saved Variants (Total: {variants.length})</Heading>
            </CardHeader>
            <CardBody>
              <Accordion allowMultiple>
                {variants.map((variant, index) => (
                  <AccordionItem key={index}>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontSize="lg" fontWeight="bold">
                            {variant.name}
                          </Text>
                        </Box>
                        <Button
                          colorScheme='white'
                          variant='outline'
                          border='1px'
                          borderColor='#B4C7C9'
                          color='#6E6E6F'
                          _hover={{ bg: '#B4C7C9' }}
                          onClick={() => editVariant(variant)}
                          leftIcon={<FiEdit />}
                        >Edit</Button>
                        <Button
                          colorScheme='white'
                          variant='outline'
                          border='1px'
                          borderColor='#B4C7C9'
                          color='#6E6E6F'
                          _hover={{ bg: '#B4C7C9' }}
                          ml={2}
                          onClick={() => deleteVariant(variant.id)}
                          leftIcon={<FiTrash2 />}
                        >Delete</Button>
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <Text fontSize="lg" fontWeight="bold">Frequency: {variant.frequency}</Text>
                      <Text fontSize="lg" fontWeight="bold">Mappings:</Text>
                      <UnorderedList>
                        {variant.mappings.map((mapping, mappingIndex) => (
                          <ListItem key={mappingIndex}>
                            {bpmnActivities.find(activity => activity.id === mapping.task)?.name}{" - "}
                            {mapping.abstractDriver}{" - "}
                            {allCostDrivers.find(driver => driver.name === mapping.abstractDriver)
                              ?.concreteCostDrivers.find(concreteDriver => concreteDriver.id === mapping.concreteDriver)
                              ?.name}
                          </ListItem>
                        ))}
                      </UnorderedList>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          </Card>
          <VariantEditor
            costVariant={currentVariant}
            bpmnActivities={bpmnActivities}
            allCostDrivers={allCostDrivers}
            saveCostVariant={saveCostVariant}
            toasting={toasting}
          />
        </Box>}
    </Box>
  );
}

export default LcaConfiguration;
