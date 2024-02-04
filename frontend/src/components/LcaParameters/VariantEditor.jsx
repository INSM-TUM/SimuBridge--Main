import React, { useState } from 'react';
import {
  Card, CardHeader, CardBody, Heading, Stack, Flex, Text,
  Input, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Select, Button
} from '@chakra-ui/react';

export default function VariantEditor({ costVariant, setCostVariant, bpmnActivities, allCostDrivers, saveCostVariant }) {
  const [taskDriverMapping, setTaskDriverMapping] = useState(costVariant.mappings || []);
  const [isVariantNameValid, setIsVariantNameValid] = useState(true);

  const addNewTaskDriverMapping = () => {
    setTaskDriverMapping([...taskDriverMapping, { task: '', abstractDriver: '', concreteDriver: '' }]);
  };

  const updateVariantDetails = (field, value) => {
    if (field === 'name') {
      setIsVariantNameValid(value.length > 0);
    }
    setCostVariant({ ...costVariant, [field]: value });
  };

  const abstractDriverNames = Array.from(new Set(allCostDrivers.map(driver => driver.name)));

  const updateMapping = (index, field, value) => {
    const updatedMappings = [...taskDriverMapping];
    updatedMappings[index][field] = value;
    setTaskDriverMapping(updatedMappings);
  };

  return (
    <Card my={2}>
      <CardHeader>
        <Heading size='md'>{costVariant.name ? 'Edit' : 'Add'} Variant</Heading>
      </CardHeader>
      <CardBody>
        <Stack>
          <Text>Please specify variant name and frequency</Text>
          <Flex mt={2}>
            <Input 
              placeholder="Variant Name"
              value={costVariant.name}
              onChange={(e) => updateVariantDetails('name', e.target.value)}
              isInvalid={!isVariantNameValid}
              errorBorderColor='red.300'
               />
            <NumberInput placeholder="Frequency"
              value={costVariant.frequency}
              defaultValue={15} min={0} max={100}
              ml={3} onChange={(value) => updateVariantDetails('frequency', value)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button
              onClick={() => saveCostVariant({...costVariant, mappings: taskDriverMapping})}
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
              <Select placeholder="Select Task" value={mapping.task} onChange={(e) => updateMapping(index, 'task', e.target.value)} mr={3}>
                {bpmnActivities.map((activity) => (
                  <option value={activity.id} key={activity.id}>{activity.name}</option>
                ))}
              </Select>
              <Select placeholder="Select Abstract Driver" value={mapping.abstractDriver} onChange={(e) => updateMapping(index, 'abstractDriver', e.target.value)} mr={3}>
                {abstractDriverNames.map(name => (
                  <option value={name} key={name}>{name}</option>
                ))}
              </Select>
              <Select placeholder="Select Concrete Driver" value={mapping.concreteDriver} onChange={(e) => updateMapping(index, 'concreteDriver', e.target.value)}>
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
