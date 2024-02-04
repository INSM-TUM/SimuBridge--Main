import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Card, CardHeader, CardBody, Button, Flex, Text,
  Alert, AlertIcon, AlertDescription, CloseButton, Link,
  UnorderedList, ListItem,
  Accordion, AccordionItem, AccordionPanel, AccordionButton
} from '@chakra-ui/react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import VariantEditor from './VariantEditor';

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

      if (scenario.costVariantConfig) {
        setVariants(scenario.costVariantConfig.variants);
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

  const addCostVariant = (variant) => {
    const updatedVariants = [...variants];
    const variantIndex = variants.findIndex(v => v.name === variant.name);

    if (variantIndex >= 0) {
      updatedVariants[variantIndex] = variant; // Update existing variant
    } else {
      updatedVariants.push(variant); // Add new variant
    }

    setVariants(updatedVariants);
    setCurrentVariant({ name: '', mappings: [], frequency: 15 }); // Reset currentVariant
    toasting("success", "Variant saved", "Cost variant saved successfully");
  };

  const editVariant = (variant) => {
    setCurrentVariant(variant);
  };

  const deleteVariant = (variantName) => {
    setVariants(variants.filter(v => v.name !== variantName));
    toasting("info", "Variant deleted", "Cost variant deleted successfully");
    if (currentVariant.name === variantName) {
      setCurrentVariant({ name: '', mappings: [], frequency: 15 });
    }
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
                          onClick={() => deleteVariant(variant.name)}
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
            saveCostVariant={editVariant}
            addCostVariant={addCostVariant}
            toasting={toasting}
          />
        </Box>}
    </Box>
  );
}

export default LcaConfiguration;
