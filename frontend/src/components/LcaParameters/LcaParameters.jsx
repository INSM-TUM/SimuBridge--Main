import React, { useState, useRef, useEffect } from "react";
import {
  Alert, AlertIcon, AlertDescription, CloseButton, useDisclosure,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Flex, Stack,
  Heading,
  Card, CardHeader, CardBody,
  Text,
  Input, InputGroup, InputRightElement, InputLeftElement,
  Select, Button,
  Progress,
  Box,
  Spinner,
  useToast,
  UnorderedList, ListItem
} from '@chakra-ui/react';

import { ExternalLinkIcon } from '@chakra-ui/icons';
import ProgressPage from "../StartView/ProgressPage";

import { FiChevronDown } from 'react-icons/fi';
import Dropdown from './Dropdown';
import "./styles.css"
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";


import {
  debounce
} from 'min-dash';
import SimulationModelModdle, { assign, limitToDataScheme } from "simulation-bridge-datamodel/DataModel";
import VariantEditor from "./VariantEditor";
import OLCAconnectionAlert from "./OLCAconnectionAlert";

const LcaParameters = ({ getData }) => {
  //vars
  const [inputValue, setInputValue] = useState('');
  const [apiUrl, setApiUrl] = useState('http://localhost:8080');
  const [isApiUrlValid, setIsApiUrlValid] = useState(true);
  const [isFetchingRunning, setIsFetchingRunning] = useState(false);
  const [isScenarioModelLoaded, setIsScenarioModelLoaded] = useState(true);
  const impactMethodId = 'b4571628-4b7b-3e4f-81b1-9a8cca6cb3f8';
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState('');
  const [allCostDrivers, setAllCostDrivers] = useState([]);
  const [isCostDriversLoaded, setIsCostDriversLoaded] = useState(false);
  const [bpmnActivities, setBpmnActivities] = useState([]);
  const modelData = getData().getCurrentModel();
  const resourceParameters = getData().getCurrentScenario().resourceParameters;

  const inputNameRef = useRef('');
  const [selected, setSelected] = useState("Choose Abstract Component");
  const [selectedC, setSelectedC] = useState("Choose Concrete Component");
  const [activities, setActivities] = useState([1]);

  //init
  console.log("Current resource parameters: ", getData().getCurrentScenario().resourceParameters);
  console.log('Scenario Data: ', getData().getCurrentScenario().models[0]);

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



  //handlers
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleApiUrlChange = (event) => {
    const value = event.target.value;
    setApiUrl(value);
    validateUrl(value);
  };

  const validateUrl = (url) => {
    const regex = /^http:\/\/[\w.]+:\d+$/;
    setIsApiUrlValid(regex.test(url));
  };

  const fillDefaultHostPortButtonClick = () => {
    setApiUrl('http://localhost:8080');
    setIsApiUrlValid(true);
  };

  const toast = useToast();

  const processApiResponse = async (response) => {
    var data = response.result;
    console.log('Cost drivers from API:', data);
    var abstractCostDrivers = [];

    data.forEach(el => {
        let unitConfig = SimulationModelModdle.getInstance().create("simulationmodel:TargetUnit", {
            id: el.targetUnit['@id'],
            name: el.targetUnit.name,
        });

        let concreteCostDriverConfig = SimulationModelModdle.getInstance().create("simulationmodel:ConcreteCostDriver", {
            id: el['@id'],
            name: el.name,
            cost: el.targetAmount,
            unit: unitConfig
        });

        let abstractDriver = abstractCostDrivers.find(driver => driver.name === el.abstractDriverName);
        if (!abstractDriver) {
            abstractDriver = SimulationModelModdle.getInstance().create("simulationmodel:AbstractCostDriver", {
                id: el.category,
                name: el.category,
                concreteCostDrivers: [concreteCostDriverConfig]
            });
            abstractCostDrivers.push(abstractDriver);
        } else {
            abstractDriver.concreteCostDrivers.push(concreteCostDriverConfig);
        }
    });

    getData().getCurrentScenario().resourceParameters.environmentalCostDrivers = abstractCostDrivers;

    console.log('Abstract Cost Drivers:', abstractCostDrivers);
    console.log('Resource Parameters:', getData().getCurrentScenario().resourceParameters);

    await getData().saveCurrentScenario();
};



  const handleButtonClick = async () => {
    if (!isApiUrlValid) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL in the format 'http://[host]:[port]'",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

      return;
    }

    const saveCostVariant = (costVariant) => {
      console.log('Saving cost variant:', costVariant);
    }

    setIsFetchingRunning(true);

    // Make an API call using fetch
    let resp = await fetch(apiUrl, {
      method: "POST",
      timeout: 10000,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "data/get/all",
        params: {
          "@type": "ProductSystem"
        }
      })
    })
      .then((response) => {
        setIsFetchingRunning(false);
        if (!response.ok) {

          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(async (data) => {
        console.log('API Response:', data);
        await processApiResponse(data);
        setIsCostDriversLoaded(true);
        // Handle the response as needed
      })
      .catch((error) => {
        setIsFetchingRunning(false);
        toast({
          title: "Error while fetching data from OpenLCA",
          description: "Please check if the OpenLCA IPC server is running and the URL is correct",
          status: "error",
          duration: 3000,
          isClosable: true,
        });

        console.error('API Error:', error);
        // Handle errors as needed
      });
  };

  //const [myConfig, setMyConfig] = useState('');

  const handleSaveButtonClick = () => {
    //Handles the button that saves the variant configuration

    /*const currentConfig = inputNameRef.current.value;
    if (currentConfig !== '') {
      setVariants(prevVariants => [...prevVariants, currentConfig]);
      inputNameRef.current.value = '';
    }*/
  };

  const removeItem = (indexToRemove) => {
    setVariants(variants.filter((_, index) => index !== indexToRemove));
  };

  //Functionality for adding in activity array
  const addActivity = () => {
    const newActivity = {/* new activity object */ };
    setActivities([...activities, newActivity]);
  };

  //Functionality for removing from activity array
  const removeActivity = (indexToRemove) => {
    setActivities(prevActivities => prevActivities.filter((_, index) => index !== indexToRemove));
  };


  return (
    !isScenarioModelLoaded ?
      <Flex
        height="100vh"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size='xl' />
      </Flex>
      :
      <Box>
        <Card bg="white" mt="25px">
          <CardHeader>
            <Heading size='md'>Configure OpenLCA integration</Heading>
          </CardHeader>
          <CardBody>
            OpenLCA IPC server host and port:
            <Flex mt={2}>
              <InputGroup size='md'>
                <InputLeftElement pointerEvents='none'>
                  <ExternalLinkIcon color='gray.300' />
                </InputLeftElement>
                <Input
                  size="md"
                  type="url"
                  value={apiUrl}
                  isInvalid={!isApiUrlValid}
                  errorBorderColor='red.300'
                  onChange={handleApiUrlChange}
                  placeholder="e.g., http://localhost:8080"
                />
                <InputRightElement width='4.5rem' mr={2}>
                  <Button h='1.75rem' size='sm'
                    onClick={fillDefaultHostPortButtonClick}>
                    Default
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Button
                onClick={handleButtonClick}
                disabled={isFetchingRunning}
                colorScheme='white'
                variant='outline'
                border='1px'
                borderColor='#B4C7C9'
                color='#6E6E6F'
                _hover={{ bg: '#B4C7C9' }}
                ml={2}
              >
                Fetch
              </Button>
            </Flex>
            {isFetchingRunning && <Progress mt={2} colorScheme='green' size='xs' isIndeterminate />}
            {
              isCostDriversLoaded && allCostDrivers &&
              <OLCAconnectionAlert countCostDrivers={allCostDrivers.length}  />
            }
          </CardBody>
        </Card>
        <Card my={2}>
          <CardHeader>
            <Heading size='md'>Saved variants (total: {variants.length})</Heading>
            {console.log("Variants: ", variants)}
          </CardHeader>
          <CardBody>
            {/* list of variants */}
          </CardBody>
        </Card>
        <VariantEditor
          costVariant={currentVariant}
          bpmnActivities={bpmnActivities}
          allCostDrivers={allCostDrivers}
        />
       </Box>
  );
};
export default LcaParameters;
