import React, { useState, useRef } from "react";
import {
  Flex, Stack,
  Heading,
  Card, CardHeader, CardBody,
  Text,
  Input, InputGroup, InputRightElement, InputLeftElement,
  Select, Button,
  Progress,
  Box,
  useToast,
  UnorderedList,
  ListItem
} from '@chakra-ui/react';

import { ExternalLinkIcon } from '@chakra-ui/icons';

import { FiChevronDown } from 'react-icons/fi';
import Dropdown from './Dropdown';
import "./styles.css"
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const LcaParameters = () => {
  const [inputValue, setInputValue] = useState('');
  const [apiUrl, setApiUrl] = useState('http://localhost:8080');
  const [isApiUrlValid, setIsApiUrlValid] = useState(true);
  const [isFetchingRunning, setIsFetchingRunning] = useState(false);
  const impactMethodId = 'b4571628-4b7b-3e4f-81b1-9a8cca6cb3f8';

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

  const handleButtonClick = () => {
    if(!isApiUrlValid){
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
    let resp = fetch(apiUrl, {
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
      .then((data) => {
        console.log('API Response:', data);
        // Handle the response as needed
      })
      .catch((error) => {
        setIsFetchingRunning(false);
        console.error('API Error:', error);
        // Handle errors as needed
      });
  };

  const [variants, setMyVariants] = useState([]);
  const [myConfig, setMyConfig] = useState('');
  const inputNameRef = useRef('');

  const handleSaveButtonClick = () => {
    //Handles the button that saves the variant configuration

    const currentConfig = inputNameRef.current.value;
    if (currentConfig !== '') {
      setMyVariants(prevVariants => [...prevVariants, currentConfig]);
      inputNameRef.current.value = '';
    }
  };

    const removeItem = (indexToRemove) => {
      setMyVariants(variants.filter((_, index) => index !== indexToRemove));
    };

  const [selected, setSelected] = useState("Choose Abstract Component");
  const [selectedC, setSelectedC] = useState("Choose Concrete Component");

    //Functionality for adding in activity array
    const [activities, setActivities] = useState([1]);
    const addActivity = () => {
      const newActivity = {/* new activity object */};
      setActivities([...activities, newActivity]);
    };

    //Functionality for removing from activity array
    const removeActivity = (indexToRemove) => {
      setActivities(prevActivities => prevActivities.filter((_, index) => index !== indexToRemove));
    };

  return (
    <Box>
      <Card bg="white" mt="25px">
        <CardHeader>
          <Heading size='md'>Configure OpenLCA integration</Heading>
        </CardHeader>
        <CardBody>
          IPC Server host and port:
          <Flex mt={2}>
            <InputGroup size='md'>
              <InputLeftElement pointerEvents='none'>
                <ExternalLinkIcon color='gray.300' />
              </InputLeftElement>
              <Input
                size="md"
                type="url"
                value={apiUrl}
                isInvalid = {!isApiUrlValid}
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
        </CardBody>
      </Card>

      <hr style={{ borderTop: '2px solid black' }} />
      <br></br>

      {variants.map((item, index) => (
        <div key={index}
        style={{
              border: '0.1px solid black',
              padding: '2px',
              margin: '2px',
              fontWeight: 'bold',
              fontSize: '15px',
              display: 'flex',
              justifyContent:'space-between',
        }}>
        {item}
        <button
        style={{
          cursor: 'pointer',
          width: '30px', // Set width to make the button square
          height: '30px', // Set height to make the button square
          justifyContent: 'center', // Center 'x' horizontally
          alignItems: 'center', // Center 'x' vertically
          fontWeight: 'bold',
          fontSize: '15px',
          margin: '2px',
          marginLeft: 'auto',
          border: '0.1px solid black',
          backgroundColor: '#FF0800',
          color: '#FFFFFF',
          boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.5)',
          transition: 'background-color 0.3s',

        }} 
        onClick={
          () => removeItem(index)}
          // Add :hover styles
      onMouseEnter={(e) => e.target.style.backgroundColor = '#8B0000'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#FF0800'}>
          x
          </button>
        </div> // Create a new div for each item
      ))
      }

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

              <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
              <input style={{
                display: 'flex',
                    marginLeft: 'auto',
                    border: '0.1px solid black',
                    padding: '5px',
                    margin:'5px',
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
