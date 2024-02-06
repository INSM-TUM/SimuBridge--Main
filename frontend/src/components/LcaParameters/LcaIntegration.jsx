import React, { useState, useEffect } from "react";

import {
  Alert, AlertIcon, AlertDescription, CloseButton, useDisclosure,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Flex, Heading, Card, CardHeader, CardBody,
  Text, Input, InputGroup, InputRightElement, InputLeftElement,
  Select, Button, Progress, Box, Spinner,
  UnorderedList, ListItem
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

import { processApiResponse, handleButtonClick } from './LcaIntegrationUtils';

import "./styles.css";


const LcaIntegration = ({ getData, toasting }) => {
  //vars
  const defaultApiUrl = 'http://localhost:8081';
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [isApiUrlValid, setIsApiUrlValid] = useState(true);
  const [isFetchingRunning, setIsFetchingRunning] = useState(false);
  const [fetchingProgress, setFetchingProgress] = useState(-1);
  const [isScenarioModelLoaded, setIsScenarioModelLoaded] = useState(true);
  const impactMethodId = 'b4571628-4b7b-3e4f-81b1-9a8cca6cb3f8';
  const [allCostDrivers, setAllCostDrivers] = useState([]);
  const [isCostDriversLoaded, setIsCostDriversLoaded] = useState(false);

  //init
  useEffect(() => {
    const scenario = getData().getCurrentScenario();

    if (scenario) {
      const costDrivers = scenario.resourceParameters.environmentalCostDrivers;
      if (costDrivers) {
        const uniqueCostDrivers = Array.from(new Map(costDrivers.map(item => [item.id, item])).values());
        setAllCostDrivers(uniqueCostDrivers);
        setIsCostDriversLoaded(uniqueCostDrivers.length > 0);
      }
    }
  }, []);

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
    setApiUrl(defaultApiUrl);
    setIsApiUrlValid(true);
  };

  const processApiResponseBound = async (client, data) => {
    await processApiResponse(client, data, 
      getData, setFetchingProgress, setIsFetchingRunning,
      toasting, impactMethodId, setAllCostDrivers, setIsCostDriversLoaded);
};

const handleButtonClickBound = async () => {
    await handleButtonClick(apiUrl, isApiUrlValid,
      setIsFetchingRunning, setFetchingProgress,
      toasting, processApiResponseBound);
};

  const {
    isOpen: isAlertBoxVisible,
    onClose,
    onOpen,
  } = useDisclosure({ defaultIsOpen: true })

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
              <InputGroup size='md' flex='2'>
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
                  placeholder={'e.g., ' + defaultApiUrl}
                />
                <InputRightElement width='4.5rem' mr={2}>
                  <Button h='1.75rem' size='sm'
                    onClick={fillDefaultHostPortButtonClick}>
                    Default
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Select isDisabled value={impactMethodId} ml={2} flex='2'>
                <option value={impactMethodId}>EF 3.0 weighted and normalized</option>
              </Select>
              <Button
                onClick={handleButtonClickBound}
                disabled={isFetchingRunning}
                isLoading={isFetchingRunning}
                loadingText='Fetching...'
                colorScheme='white'
                flex='1'
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
            {isFetchingRunning &&
              <Progress mt={2} colorScheme='green' size='md' hasStripe
                {...(fetchingProgress >= 0 ? { value: fetchingProgress } : { isIndeterminate: true })}
              />
            }
          </CardBody>
        </Card>

        {!isCostDriversLoaded && isAlertBoxVisible &&
          <Alert status='warning' mt={2} display='flex' alignItems='center' justifyContent='space-between'>
            <Flex alignItems='center'>
              <AlertIcon />
              <AlertDescription>There are no cost drivers saved in the system. Use the window above to fetch.</AlertDescription>
            </Flex>
            <CloseButton position='relative' onClick={onClose} />
          </Alert>
        }
        {isCostDriversLoaded &&
          <Card mt={2}>
            <CardHeader>
              <Heading size='md'>{allCostDrivers.length} abstract cost drivers</Heading>
            </CardHeader>
            <CardBody>
              <Accordion allowToggle>
                {allCostDrivers.map((costDriver, index) => (
                  <AccordionItem key={index}>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontSize="lg" fontWeight="bold">
                            {costDriver.name}
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <UnorderedList>
                        {costDriver.concreteCostDrivers.map((concreteCostDriver, index) => (
                          <ListItem key={index}>
                            {concreteCostDriver.name}: {concreteCostDriver.cost}
                          </ListItem>
                        ))}
                      </UnorderedList>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          </Card>
        }
      </Box>
  );
};
export default LcaIntegration;
