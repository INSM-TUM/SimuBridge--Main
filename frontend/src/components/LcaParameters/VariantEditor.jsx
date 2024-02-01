import React, { useState } from 'react';
import {
  Alert, AlertIcon, AlertDescription, CloseButton, useDisclosure,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Flex, Stack, Heading, Card, CardHeader, CardBody, Text,
  Input, InputGroup, InputRightElement, InputLeftElement,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Select, Button, Progress, Box, Spinner, useToast, UnorderedList, ListItem
} from '@chakra-ui/react';

export default function VariantEditor({ costVariant, bpmnActivities, allCostDrivers, saveCostVariant }) {
  const [taskDriverMapping, setTaskDriverMapping] = useState([]);

  const addNewTaskDriverMapping = () => {
    setTaskDriverMapping([...taskDriverMapping, { task: null, abstractDriver: null, concreteDriver: null }]);
  };

  // Extract unique abstract driver names from allCostDrivers
  const abstractDriverNames = Array.from(new Set(allCostDrivers.map(driver => driver.name)));

  return (
    <Card my={2}>
      <CardHeader>
        <Heading size='md'>{costVariant ? 'Edit' : 'Add'} Variant</Heading>
      </CardHeader>
      <CardBody>
        <Stack>
          <Text>Please specify variant name and frequency</Text>
          <Flex mt={2}>
            <Input placeholder="Variant Name" value={costVariant.id} />
            <NumberInput placeholder="Frequency"
              value={costVariant.frequency}
              defaultValue={15} min={0} max={100}
              ml={3}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button
              onClick={() => saveCostVariant(costVariant)}
              colorScheme='white'
              variant='outline'
              border='1px'
              borderColor='#B4C7C9'
              color='#6E6E6F'
              ml={3}
              _hover={{ bg: '#B4C7C9' }}
            >Save</Button>
          </Flex>
          {taskDriverMapping.map((mapping, index) => (
            <Flex key={index} mt={3} alignItems="center">
              <Text mr={3}>{index + 1}.</Text>
              <Select placeholder="Select Task" value={mapping.task} onChange={(e) => {
                const newMapping = { ...mapping, task: e.target.value };
                setTaskDriverMapping(taskDriverMapping.map((m, idx) => idx === index ? newMapping : m));
              }} mr={3}>
                {bpmnActivities.map((activity) => (
                  <option value={activity.id} key={activity.id}>{activity.name}</option>
                ))}
              </Select>
              <Select placeholder="Select Abstract Driver" value={mapping.abstractDriver} onChange={(e) => {
                const newMapping = { ...mapping, abstractDriver: e.target.value, concreteDriver: null };
                setTaskDriverMapping(taskDriverMapping.map((m, idx) => idx === index ? newMapping : m));
              }} mr={3}>
                {abstractDriverNames.map(name => (
                  <option value={name} key={name}>{name}</option>
                ))}
              </Select>
              <Select placeholder="Select Concrete Driver" value={mapping.concreteDriver} onChange={(e) => {
                const newMapping = { ...mapping, concreteDriver: e.target.value };
                setTaskDriverMapping(taskDriverMapping.map((m, idx) => idx === index ? newMapping : m));
              }}>
                {allCostDrivers
                  .find(driver => driver.name === mapping.abstractDriver)?.concreteCostDrivers
                  .map(concreteDriver => (
                    <option value={concreteDriver.id} key={concreteDriver.id}>{concreteDriver.name}</option>
                  ))}
              </Select>
            </Flex>
          ))}
          <Button
            onClick={addNewTaskDriverMapping}
            colorScheme='white'
            variant='outline'
            border='1px'
            borderColor='#B4C7C9'
            color='#6E6E6F'
            _hover={{ bg: '#B4C7C9' }}
            mt={2}
          >
            Add mapping to OpenLCA cost driver
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );
}
