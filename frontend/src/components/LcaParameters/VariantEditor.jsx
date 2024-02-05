import React, { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardBody, Heading, Stack, Flex, Text,
  FormControl, FormLabel,
  Input, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Select, Button, IconButton, VStack
} from '@chakra-ui/react';
import { FiSave, FiSlash } from 'react-icons/fi';
import { AiOutlineMinusCircle } from 'react-icons/ai';

export default function VariantEditor({ costVariant, allCostDrivers, saveCostVariant, setCurrentVariant,
  toasting }) {
  const defaultFrequency = 15;
  const minFrequency = 0;
  const maxFrequency = 100;

  const [isNewVariant, setIsNewVariant] = useState(!costVariant.id);
  const [driverMapping, setDriverMapping] = useState(isNewVariant ? [] : costVariant.mappings);
  const [isVariantNameValid, setIsVariantNameValid] = useState(true);
  const [variantName, setVariantName] = useState(isNewVariant ? '' : costVariant.name);
  const [frequency, setFrequency] = useState(isNewVariant ? defaultFrequency : costVariant.frequency);
  const [mappingValidations, setMappingValidations] = useState([]);

  useEffect(() => {
    setDriverMapping(costVariant.mappings || []);
    setVariantName(costVariant.name || '');
    setFrequency(costVariant.frequency || defaultFrequency);
    setIsNewVariant(!costVariant.id);
  }, [costVariant]);

  useEffect(() => {
    const initialValidations = driverMapping.map(mapping => ({
      abstractDriverValid: !!mapping.abstractDriver,
      concreteDriverValid: !!mapping.concreteDriver
    }));
    setMappingValidations(initialValidations);
  }, [driverMapping]);

  const addNewDriverMapping = () => {
    setDriverMapping([...driverMapping, { abstractDriver: '', concreteDriver: '' }]);
  };

  const removeDriverMapping = (index) => {
    const updatedMappings = driverMapping.filter((_, idx) => idx !== index);
    setDriverMapping(updatedMappings);
  };

  const updateVariantDetails = (field, value) => {
    if (field === 'name') {
      setIsVariantNameValid(value.length > 0);
      setVariantName(value);
    } else if (field === 'frequency') {
      setFrequency(value);
    }
  };

  const abstractDriverNames = Array.from(new Set(allCostDrivers.map(driver => driver.name)));

  const updateMapping = (index, field, value) => {
    const updatedMappings = [...driverMapping];
    updatedMappings[index][field] = value;
    setDriverMapping(updatedMappings);

    const updatedValidations = [...mappingValidations];
    updatedValidations[index][`${field}Valid`] = !!value;
    setMappingValidations(updatedValidations);
  };

  const saveVariantClicked = () => {
    const allMappingsValid = mappingValidations.every(validation =>
      validation.abstractDriverValid && validation.concreteDriverValid);

    if (!variantName || driverMapping.length === 0 || !allMappingsValid) {
      toasting("error", "Invalid input", "All fields are required and must be valid.");
      return;
    }

    saveCostVariant({
      ...costVariant,
      mappings: driverMapping,
      name: variantName,
      frequency: frequency
    });
  }

  return (
    <Card my={2}>
      <CardHeader>
        <Flex justifyContent="space-between" alignItems="center">
          <VStack align="start">
            <Heading size='md'>{isNewVariant ? 'Add' : 'Edit'} Variant</Heading>
            {costVariant.id &&
              <Text fontSize='sm' color='gray.500'>
                ID: {costVariant.id}
              </Text>
            }
          </VStack>
          {
            !isNewVariant &&
            <Button
              onClick={() => {
                setCurrentVariant({ name: '', mappings: [], frequency: 15 });
              }}
              colorScheme='white'
              variant='outline'
              border='1px'
              borderColor='#B4C7C9'
              color='#6E6E6F'
              _hover={{ bg: '#B4C7C9' }}
              leftIcon={<FiSlash />}
            >
              Cancel
            </Button>
          }
        </Flex>
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
            <NumberInput
              placeholder="Frequency"
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
            >{isNewVariant ? 'Add' : 'Edit'}</Button>
          </Flex>
          {driverMapping.map((mapping, index) => (
            <Flex key={index} mt={3} alignItems="center">
              <Text mr={3}>{index + 1}.</Text>
              <Select
                placeholder="Select Abstract Driver"
                value={mapping.abstractDriver}
                onChange={(e) => updateMapping(index, 'abstractDriver', e.target.value)}
                isInvalid={!mappingValidations[index]?.abstractDriverValid}
                errorBorderColor='red.300'
                mr={3}>
                {abstractDriverNames.map(name => (
                  <option value={name} key={name}>{name}</option>
                ))}
              </Select>
              <Select placeholder="Select Concrete Driver"
                value={mapping.concreteDriver}
                onChange={(e) => updateMapping(index, 'concreteDriver', e.target.value)}
                isInvalid={!mappingValidations[index]?.concreteDriverValid}
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
                onClick={() => removeDriverMapping(index)}

              />
            </Flex>
          ))}
          <Button
            onClick={addNewDriverMapping}
            colorScheme='white'
            variant='outline'
            border='1px'
            borderColor='#B4C7C9'
            color='#6E6E6F'
            _hover={{ bg: '#B4C7C9' }}
            mt={2}
          >
            Add Driver Concretization
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );
}
