import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Card, CardHeader, CardBody, Button, Flex, Text, useToast,
  Alert, AlertIcon, AlertDescription, CloseButton, Link
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/hooks';
import VariantEditor from './VariantEditor';

function LcaConfiguration({ getData, toasting }) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({ name: '', mappings: [] });
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

  const saveCostVariant = (variant) => {
    if (!variant.name || variant.mappings.length === 0) {
      toasting("error", "Invalid input", "Variant Name and Task-Abstract Driver mappings are required");
      return;
    }

    const updatedVariants = [...variants];
    const variantIndex = variants.findIndex(v => v.name === variant.name);

    if (variantIndex >= 0) {
      updatedVariants[variantIndex] = variant;
    } else {
      updatedVariants.push(variant);
    }

    setVariants(updatedVariants);
    setCurrentVariant({ name: '', mappings: [] });
    toasting("success", "Variant saved", "Cost variant saved successfully");
  };

  const editVariant = (variant) => {
    setCurrentVariant(variant);
  };

  const deleteVariant = (variantName) => {
    setVariants(variants.filter(v => v.name !== variantName));
    toasting("info", "Variant deleted", "Cost variant deleted successfully");
  };

  return (
    !isCostDriversLoaded ? 
    (
      <Alert status='warning' mt={2} display='flex' alignItems='center' justifyContent='space-between'>
            <Flex alignItems='center'>
                <AlertIcon />
                <AlertDescription>There are no cost drivers saved in the system. Use
                      <Button as={Link} to="/lcaintegration"
                            colorScheme='#ECF4F4'
                            variant='outline'
                            border='1px'
                            borderColor='#B4C7C9'
                            color='#6E6E6F'
                            onClick={onOpen}
                            _hover={{bg: '#B4C7C9'}}>
                        OpenLCA Integration page
                    </Button> to fetch cost drivers.</AlertDescription>
            </Flex>
            <CloseButton position='relative' onClick={onClose} />
        </Alert>
    ) :
    (<Box>
      <Heading size='lg'>Environmental Configuration for {getData().getCurrentScenario().scenarioName}</Heading>
      <Card my={2}>
        <CardHeader>
          <Heading size='md'>Saved Variants (Total: {variants.length})</Heading>
        </CardHeader>
        <CardBody>
          {variants.map(variant => (
            <Flex key={variant.name} alignItems="center" justifyContent="space-between" mb={2}>
              <Text>{variant.name}</Text>
              <Button onClick={() => editVariant(variant)} colorScheme="blue" mr={2}>Edit</Button>
              <Button onClick={() => deleteVariant(variant.name)} colorScheme="red">Delete</Button>
            </Flex>
          ))}
        </CardBody>
      </Card>
      <VariantEditor
        costVariant={currentVariant}
        setCostVariant={setCurrentVariant}
        bpmnActivities={bpmnActivities}
        allCostDrivers={allCostDrivers}
        saveCostVariant={saveCostVariant}
      />
    </Box>)
  );
}

export default LcaConfiguration;
