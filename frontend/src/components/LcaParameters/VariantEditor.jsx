import React, { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardBody, Heading, Stack, Flex, Text,
  Input, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Select, Button, IconButton
} from '@chakra-ui/react';
import { FiSave } from 'react-icons/fi';
import { AiOutlineMinusCircle } from 'react-icons/ai';

export default function VariantEditor({ costVariant,
  bpmnActivities, allCostDrivers,
  saveCostVariant,
  toasting }) {
  const defaultFrequency = 15;
  const minFrequency = 0;
  const maxFrequency = 100;

  const [isNewVariant, setIsNewVariant] = useState(costVariant.id ? false : true);
  const [taskDriverMapping, setTaskDriverMapping] = useState(isNewVariant ? [] : costVariant.mappings);
  const [isVariantNameValid, setIsVariantNameValid] = useState(true);
  const [variantName, setVariantName] = useState(isNewVariant ? '' : costVariant.name);
  const [frequency, setFrequency] = useState(isNewVariant ? defaultFrequency : costVariant.frequency);
  const [mappingValidations, setMappingValidations] = useState([]);

  useEffect(() => {
    if (costVariant) {
      setTaskDriverMapping(costVariant.mappings || []);
      setVariantName(costVariant.name || '');
      setFrequency(costVariant.frequency || defaultFrequency);
    }
  }, [costVariant]);

  useEffect(() => {
    const initialValidations = taskDriverMapping.map(mapping => ({
      taskValid: !!mapping.task,
      abstractDriverValid: !!mapping.abstractDriver,
      concreteDriverValid: !!mapping.concreteDriver
    }));
    setMappingValidations(initialValidations);
  }, [taskDriverMapping]);

  const addNewTaskDriverMapping = () => {
    setTaskDriverMapping([...taskDriverMapping, { task: '', abstractDriver: '', concreteDriver: '' }]);
  };

  const removeTaskDriverMapping = (index) => {
    const updatedMappings = taskDriverMapping.filter((_, idx) => idx !== index);
    setTaskDriverMapping(updatedMappings);
  };

  const updateVariantDetails = (field, value) => {
    if (field === 'name') {
      let isVariantNameValid = value.length > 0;
      setIsVariantNameValid(isVariantNameValid);
      setVariantName(value);
    }
    else if (field === 'frequency') {
      setFrequency(value);
    }
  };

  const abstractDriverNames = Array.from(new Set(allCostDrivers.map(driver => driver.name)));

  const updateMapping = (index, field, value) => {
    const updatedMappings = [...taskDriverMapping];
    updatedMappings[index][field] = value;
    setTaskDriverMapping(updatedMappings);

    const updatedValidations = [...mappingValidations];
    updatedValidations[index][`${field}Valid`] = !!value;
    setMappingValidations(updatedValidations);
  };

  const saveVariantClicked = () => {
    const allMappingsValid = mappingValidations.every(validation =>
      validation.taskValid && validation.abstractDriverValid && validation.concreteDriverValid);

    if (!variantName || taskDriverMapping.length === 0 || !allMappingsValid) {
      toasting("error", "Invalid input", "All fields are required and must be valid.");
      return;
    }

    saveCostVariant({
      ...costVariant,
      mappings: taskDriverMapping,
      name: variantName,
      frequency: frequency
    });
  }

  return (
    <Card my={2}>
      <CardHeader>
        <Heading size='md'>{costVariant.name ? 'Edit' : 'Add'} Variant</Heading>
        <Text fontSize='sm' color='gray.500' mt={1}>
          {costVariant.id && `ID: ${costVariant.id}`}
        </Text>
      </CardHeader>
      <CardBody>
        <Stack>
          <Text>Please specify variant name and frequency</Text>
          <Flex mt={2}>
            <Input
              placeholder="Variant Name"
              value={variantName}
              onChange={(e) => updateVariantDetails('name', e.target.value)}
              isInvalid={!isVariantNameValid}
              errorBorderColor='red.300'
            />
            <NumberInput placeholder="Frequency"
              value={frequency}
              defaultValue={defaultFrequency} min={minFrequency} max={maxFrequency}
              ml={3}
              onChange={(value) => updateVariantDetails('frequency', value)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button
              onClick={saveVariantClicked}
              colorScheme='white'
              variant='outline'
              border='1px'
              borderColor='#B4C7C9'
              color='#6E6E6F'
              ml={3}
              _hover={{ bg: '#B4C7C9' }}
              leftIcon={<FiSave />}
            >{costVariant.name ? 'Edit' : 'Add'}</Button>
          </Flex>
          {taskDriverMapping.map((mapping, index) => (
            <Flex key={index} mt={3} alignItems="center">
              <Text mr={3}>{index + 1}.</Text>
              <Select
                placeholder="Select Task"
                value={mapping.task}
                onChange={(e) => updateMapping(index, 'task', e.target.value)}
                isInvalid={!mappingValidations[index]?.taskValid}
                errorBorderColor='red.300'
                mr={3}>
                {bpmnActivities.map((activity) => (
                  <option value={activity.id} key={activity.id}>{activity.name}</option>
                ))}
              </Select>
              <Select
                placeholder="Select Abstract Driver"
                value={mapping.abstractDriver}
                onChange={(e) => updateMapping(index, 'abstractDriver', e.target.value)}
                isInvalid={!mappingValidations[index]?.taskValid}
                errorBorderColor='red.300'
                mr={3}>
                {abstractDriverNames.map(name => (
                  <option value={name} key={name}>{name}</option>
                ))}
              </Select>
              <Select placeholder="Select Concrete Driver"
                value={mapping.concreteDriver}
                onChange={(e) => updateMapping(index, 'concreteDriver', e.target.value)}
                isInvalid={!mappingValidations[index]?.taskValid}
                errorBorderColor='red.300'
              >
                {allCostDrivers
                  .find(driver => driver.name === mapping.abstractDriver)?.concreteCostDrivers
                  .map(concreteDriver => (
                    <option value={concreteDriver.id} key={concreteDriver.id}>{concreteDriver.name}</option>
                  ))}
              </Select>
              <IconButton
                aria-label="Remove mapping"
                icon={<AiOutlineMinusCircle />}
                isRound={true}
                ml={2}
                colorScheme="teal"
                variant="outline"
                onClick={() => removeTaskDriverMapping(index)}
              />
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
