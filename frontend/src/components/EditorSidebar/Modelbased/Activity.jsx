import {
  Input, FormControl, FormLabel, Select, Box, ButtonGroup, IconButton, Text, Flex, Accordion,
  UnorderedList, ListItem,
  Button,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react'
import { AddIcon, SettingsIcon } from '@chakra-ui/icons'
import { CloseIcon } from '@chakra-ui/icons';
import DistributionEditor from '../../DistributionEditor';
import { distributionToState, stateToDistribution } from '../../../util/Distributions';
import AbstractModelElementEditor from './AbstractModelElementEditor';
import SimulationModelModdle from 'simulation-bridge-datamodel/DataModel';

const Activity = ({ getData, currentElement }) => {
  const [allCostDrivers, setAllCostDrivers] = useState([]);

  //init
  useEffect(() => {
    const scenario = getData().getCurrentScenario();

    if (scenario) {
      const costDrivers = scenario.resourceParameters.environmentalCostDrivers;
      const uniqueCostDrivers = Array.from(new Map(costDrivers.map(item => [item.id, item])).values());
      setAllCostDrivers(uniqueCostDrivers);
    }
  }, []);

  const variants = getData().getCurrentScenario().resourceParameters.environmentMappingConfig.variants;
  const nodeId = currentElement.id;
  const nodeMappings = variants.flatMap(variant => variant.mappings)
    .filter(mapping => mapping.task === nodeId);


  function getExistingActivityConfiguration() {
    return getData().getCurrentModel().modelParameter.activities.find(value => value.id === currentElement.id)
  }

  const [activityConfiguration, setActivityConfiguration] = useState(undefined);

  let save = () => { throw 'Not set yet' };
  function setSave(saveFunc) {
    save = saveFunc;
  }


  function setCost(cost) {
    activityConfiguration.cost = cost;
    save();
  }

  function setResources(resources) {
    activityConfiguration.resources = resources;
    save();
  }
  function setAbstractCostDrivers(abstractCostDrivers) {
    activityConfiguration.costDrivers = abstractCostDrivers;
    save();
  }
  function setDuration(duration) {
    activityConfiguration.duration = stateToDistribution(duration);
    save();
  }


  const addResource = () => {
    setResources([...activityConfiguration.resources.filter(resource => resource), undefined])
  }

  const removeResource = (index) => {
    setResources(activityConfiguration.resources.filter((value, localIndex) => localIndex !== index))
  }

  const handleResources = (index, value) => {
    activityConfiguration.resources[index] = value;
    setResources(activityConfiguration.resources.filter(resource => resource));
  }
  const addAbstractCostDriver = () => {
    setAbstractCostDrivers([...activityConfiguration.costDrivers.filter(abstractCostDriver => abstractCostDriver), undefined])
  }

  const removeAbstractCostDriver = (index) => {
    setAbstractCostDrivers(activityConfiguration.costDrivers.filter((value, localIndex) => localIndex !== index))
  }

  const handleAbstractCostDrivers = (index, value) => {
    activityConfiguration.costDrivers[index] = value;
    setAbstractCostDrivers(activityConfiguration.costDrivers.filter(abstractCostDriver => abstractCostDriver));
  }
  return <AbstractModelElementEditor  {...{
    type: 'activities',
    typeName: 'Activity',
    state: activityConfiguration,
    setState: setActivityConfiguration,
    currentElement,
    getData,
    moddleClass: 'simulationmodel:Activity',
    setSave
  }}>

    {activityConfiguration && (
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                General Parameters
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <FormControl>
              <FormLabel>Fix costs:</FormLabel>
              <Input name="cost" type="input" value={activityConfiguration.cost} onChange={(event) => setCost(event.target.value)} bg="white" /> {/* TODO: Potentially also display the current money unit for the scenario */}
            </FormControl>
          </AccordionPanel>
          {  <AccordionPanel pb={4}>
                {
                  activityConfiguration.costDrivers.map((abstractCostDriver, index) => {
                    return <FormControl>
                      <FormLabel>Abstract Cost Driver { (index + 1 )}:</FormLabel>
                      <Flex gap='0' flexDirection='row'>
                        <Select key={index} name="abstractCostDriver" value={abstractCostDriver} {...(!abstractCostDriver && {placeholder : 'Select abstract cost driver', color : 'red'})} onChange={(event) => handleAbstractCostDrivers(index,event.target.value )} bg="white">
                          {getData().getCurrentScenario().resourceParameters.costDrivers
                              .filter(alternativeAbstractCostDriver => !activityConfiguration.costDrivers.includes(alternativeAbstractCostDriver.id) || alternativeAbstractCostDriver.id === abstractCostDriver)
                              .map(x =>{
                                return  <option style={{ color: 'black' }} value={x.id} key={x.id}>{x.id}</option>
                              } )}

                        </Select>
                        <IconButton icon={<CloseIcon />} onClick={() => removeAbstractCostDriver(index)} />
                      </Flex>
                    </FormControl>
                  })

                }

                <ButtonGroup size='md' isAttached variant="outline" >
                  <IconButton icon={<AddIcon />} disabled={activityConfiguration.costDrivers.filter(abstractCostDriver => !abstractCostDriver).length} onClick={() => addAbstractCostDriver()} />
                </ButtonGroup>
              </AccordionPanel> }
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                Duration
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <DistributionEditor {...{ state: distributionToState(activityConfiguration.duration), setState: setDuration }} />
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                Resources
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Text fontWeight="bold" fontSize="md">Resources:</Text>

            {
              activityConfiguration.resources.map((resource, index) => {
                return <FormControl>
                  <FormLabel>Resource {(index + 1)}:</FormLabel>
                  <Flex gap='0' flexDirection='row'>
                    <Select key={index} name="resource" value={resource} {...(!resource && { placeholder: 'Select resource', color: 'red' })} onChange={(event) => handleResources(index, event.target.value)} bg="white">
                      {getData().getCurrentScenario().resourceParameters.roles
                        .filter(alternativeResource => !activityConfiguration.resources.includes(alternativeResource.id) || alternativeResource.id === resource)
                        .map(x => {
                          return <option style={{ color: 'black' }} value={x.id} key={x.id}>{x.id}</option>
                        })}

                    </Select>
                    <IconButton icon={<CloseIcon />} onClick={() => removeResource(index)} />
                  </Flex>
                </FormControl>
              })

            }

            <ButtonGroup size='md' isAttached variant="outline" >
              {/* <IconButton icon={<MinusIcon />} onClick={() => changeValueAmount(-1)} /> */}
              <IconButton icon={<AddIcon />} disabled={activityConfiguration.resources.filter(res => !res).length} onClick={() => addResource()} />
            </ButtonGroup>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem pb={4}>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                OLCA Drivers
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Button
              as="a"
              size="sm"
              variant="link"
              href="/lcavariants"
              rightIcon={<SettingsIcon />}
              colorScheme="teal"
            >
              Configure
            </Button>

            <Box p={4}>
                {variants.map((variant, variantIndex) => {
                  const nodeMappings = variant.mappings.filter(mapping => mapping.task === nodeId);
                  return (
                    <Box key={variantIndex}>
                      <Flex><Text>Variant: </Text><Text fontWeight="bold">{variant.name}</Text></Flex>
                      <UnorderedList>
                        {nodeMappings.length > 0 ? (
                          nodeMappings.map((mapping, mappingIndex) => (
                            <ListItem key={mappingIndex}>
                              <Text>
                                {mapping.abstractDriver} -
                                {
                                  allCostDrivers
                                    .flatMap(driver => driver.concreteCostDrivers)
                                    .find(driver => driver.id === mapping.concreteDriver)?.name || 'Not found'
                                }
                              </Text>
                            </ListItem>
                          ))
                        ) : (
                          <ListItem>
                            <Text>No mappings in variant "{variant.name}"</Text>
                          </ListItem>
                        )}
                      </UnorderedList>
                    </Box>
                  );
                })}
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    )}
  </AbstractModelElementEditor>
}




export default Activity;