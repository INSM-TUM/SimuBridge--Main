import React, { useState } from 'react';
import {
  Alert, AlertIcon, AlertDescription, CloseButton, useDisclosure,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Flex, Stack,
  Heading,
  Card, CardHeader, CardBody,
  Text,
  Input, InputGroup, InputRightElement, InputLeftElement,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Select, Button,
  Progress,
  Box,
  Spinner,
  useToast,
  UnorderedList, ListItem
} from '@chakra-ui/react';

export default function VariantEditor({costVariant, bpmnActivities, allCostDrivers, saveCostVariant}) {
  const [taskDriverMapping, setTaskDriverMapping] = useState([]);

  const addNewTaskDriverMapping = () => {
    setTaskDriverMapping([...taskDriverMapping, { task: null, category: null, driver: null }]);
  };

  // Get unique categories from allCostDrivers
  const categories = Array.from(new Set(allCostDrivers.map(driver => driver.category)));

  return (
    <Card my={2}>
      <CardHeader>
        <Heading size='md'>{costVariant ? 'Edit' : 'Add'} Variant</Heading>
      </CardHeader>
      <CardBody>
        <Stack>
          <Flex>
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
              <Select placeholder="Select Category" value={mapping.category} onChange={(e) => {
                const newMapping = { ...mapping, category: e.target.value, driver: null };
                setTaskDriverMapping(taskDriverMapping.map((m, idx) => idx === index ? newMapping : m));
              }} mr={3}>
                {categories.map((category) => (
                  <option value={category} key={category}>{category}</option>
                ))}
              </Select>
              <Select placeholder="Select Driver" value={mapping.driver} onChange={(e) => {
                const newMapping = { ...mapping, driver: e.target.value };
                setTaskDriverMapping(taskDriverMapping.map((m, idx) => idx === index ? newMapping : m));
              }}>
                {allCostDrivers.filter(driver => driver.category === mapping.category).map((driver) => (
                  <option value={driver.id} key={driver.id}>{driver.name}</option>
                ))}
              </Select>
            </Flex>
          ))}
        </Stack>
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
      </CardBody>
    </Card>
  );
}
