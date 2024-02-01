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

const LcaParameters = ({ getData }) => {
  //vars
  const [inputValue, setInputValue] = useState('');
  const [apiUrl, setApiUrl] = useState('http://localhost:8080');
  const [isApiUrlValid, setIsApiUrlValid] = useState(true);
  const [isFetchingRunning, setIsFetchingRunning] = useState(false);
  const [isScenarioModelLoaded, setIsScenarioModelLoaded] = useState(true);
  const impactMethodId = 'b4571628-4b7b-3e4f-81b1-9a8cca6cb3f8';

  //init
  console.log("Current resource parameters: ", getData().getCurrentScenario().resourceParameters);
  console.log('Scenario Data: ', getData().getCurrentScenario().models[0]);

  const [allCostDrivers, setAllCostDrivers] =
    useState(getData().getCurrentScenario().resourceParameters.environmentalCostDrivers);
  const [isCostDriversLoaded, setIsCostDriversLoaded] = useState(allCostDrivers.length > 0);

  const [bpmnActivities, setBpmnActivities] = useState([]);

  const modelData = getData().getCurrentModel();
  useEffect(() => {
    console.log("model data: ", modelData);
    if (modelData && modelData.elementsById) {
      const extractedTasks = Object.entries(modelData.elementsById)
        .filter(([_, value]) => value.$type === 'bpmn:Task')
        .map(([id, value]) => ({ id, name: value.name }));

      setBpmnActivities(extractedTasks);
    }
  }, [modelData]);

  const [variants, setVariants] = useState([]);

  const resourceParameters = getData().getCurrentScenario().resourceParameters;
  useEffect(() => {
    if (resourceParameters.costVariantConfig) {
      setVariants(resourceParameters.costVariantConfig.variants);
    }
  }, [resourceParameters]);


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

  function AlertCostDriversLoaded() {
    const {
      isOpen: isVisible,
      onClose,
    } = useDisclosure({ defaultIsOpen: true });

    if (!isVisible) return null;

    return (
      <Alert status='success' mt={2} display='flex' alignItems='center' justifyContent='space-between'>
        <Flex alignItems='center'>
          <AlertIcon />
          <AlertDescription>{allCostDrivers.length} cost drivers loaded</AlertDescription>
        </Flex>
        <CloseButton position='relative' onClick={onClose} />
      </Alert>
    );
  }


  const processApiResponse = async (response) => {
    //console.log('Resource Parameters:', getData().getCurrentScenario().resourceParameters);
    var data = response.result;
    var environmentalCostDrivers = [];

    data.forEach(el => {
      let unit = {
        id: el.targetUnit['@id'],
        name: el.targetUnit.name,
      };
      const unitConfig = SimulationModelModdle.getInstance().create("simulationmodel:TargetUnit", unit);

      let costDriver = {
        id: el['@id'],
        name: el.name,
        cost: el.targetAmount,
        unit: unitConfig
      };
      const costDriverConfig = SimulationModelModdle.getInstance().create("simulationmodel:ConcreteCostDriver", costDriver);

      getData().getCurrentScenario().resourceParameters.environmentalCostDrivers.push(costDriverConfig);
    });

    setAllCostDrivers(getData().getCurrentScenario().resourceParameters.environmentalCostDrivers);

    console.log('Resource Parameters:', getData().getCurrentScenario().resourceParameters);

    await getData().saveCurrentScenario();
  }

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
  const inputNameRef = useRef('');

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

  const [selected, setSelected] = useState("Choose Abstract Component");
  const [selectedC, setSelectedC] = useState("Choose Concrete Component");

  //Functionality for adding in activity array
  const [activities, setActivities] = useState([1]);
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
              AlertCostDriversLoaded()
            }
          </CardBody>
        </Card>
        <Card my={2}>
          <CardHeader>
            <Heading size='md'>Saved variants (total: {variants.length})</Heading>
            {console.log("Variants: ", variants)}
          </CardHeader>
          <CardBody>
            
          </CardBody>
        </Card>
        <Card my={2}>
          <CardHeader>
            <Heading size='md'>Mapping between Tasks and Product Systems</Heading>
          </CardHeader>
          <CardBody>
            <Accordion allowToggle>
              {bpmnActivities.map((activity, index) => (
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box as="span" flex='1' textAlign='left'>
                        {activity.name}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    Dropdowns
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </CardBody>
        </Card>

        <br></br>
        <br></br>

        <hr style={{ borderTop: '2px solid black' }} />
        <br></br>


        <div className="Big-Container" style={{
          border: '0.1px solid black',
          padding: '0px',
          margin: '0px',
        }}>

          {/* This adds an extra activity based on the users preference*/}

          {activities.map((activity, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ padding: '5px 10px', fontSize: '15px', fontWeight: 'bold' }}>
                Activity {index + 1}
              </label>
              <Dropdown selected={selected} setSelected={setSelected} />
              <Dropdown selected={selectedC} setSelected={setSelectedC} />

              {/* This adds a button that adds an activity*/}

              <button style={{
                marginLeft: 'auto',
                visibility: index === activities.length - 1 ? 'visible' : 'hidden',
                fontWeight: 'bold',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 0px 5px 2px rgba(0,0,0,0.1)',
                width: '30px',
                height: '30px',
                justifyContent: 'center', // Center '+' horizontally
                alignItems: 'center', // Center '+' vertically
                transition: 'background-color 0.3s',
              }}

                onClick={addActivity}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#808080'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#FFFFFF'}>
                +
              </button>
              {/* This adds a button that removes an activity*/}

              {activities.length > 1 && <button
                style={{
                  marginLeft: '10px',
                  marginRight: '10px',
                  padding: '5px',
                  fontWeight: 'bold',
                  width: '30px',
                  height: '30px',
                  justifyContent: 'center', // Center '-' horizontally
                  alignItems: 'center', // Center '-' vertically
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 0px 5px 2px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.3s',
                }}
                onClick={() => removeActivity(index)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#FF0800'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#FFFFFF'}>
                -
              </button>}
            </div>
          ))}

          {/* Code for extra activity ends here*/}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <input style={{
              display: 'flex',
              marginLeft: 'auto',
              border: '0.1px solid black',
              padding: '5px',
              margin: '5px',
            }}
              type="text"
              placeholder="Save Variant as:"
              ref={inputNameRef} // Update inputName when the input changes
            />
            <button style={{
              margin: '5px',
              padding: '5px',
              fontWeight: 'bold',
              background: '#45CEA2',
              border: '0.1px solid black',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background-color 0.3s',
            }}
              onClick={handleSaveButtonClick}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#50C878'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#45CEA2'}
            >
              Save variant
            </button>
          </div>
        </div>



      </Box>
  );
};
export default LcaParameters;
