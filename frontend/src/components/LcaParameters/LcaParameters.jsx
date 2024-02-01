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


  const [selected, setSelected] = useState("Choose Abstract Component");
  const [selectedC, setSelectedC] = useState("Choose Concrete Component");
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
            fontSize: '15px'
          }}>
          {item}</div> // Create a new div for each item
      ))
      }

      <div className="Big-Container" style={{
        border: '0.1px solid black',
        padding: '0px',
        margin: '0px',
      }}>
        <div style={{  /* Here starts the first activity configuration */
          display: 'flex',
          alignItems: 'center',
          /* Here ends the first activity configuration */
        }}>
          <label style={{
            padding: '5px 10px',
            fontSize: '15px',
            fontWeight: 'bold',
          }}>
            Activity 1
          </label>
          <Dropdown selected={selected} setSelected={setSelected} />
          <Dropdown selected={selectedC} setSelected={setSelectedC} />
        </div>

        <div style={{  /* Here starts the second activity configuration */
          display: 'flex',
          alignItems: 'center',
          /* Here ends the second activity configuration */

        }}>
          <label style={{
            padding: '5px 10px',
            fontSize: '15px',
            fontWeight: 'bold',
          }}>
            Activity 2
          </label>
          <Dropdown selected={selected} setSelected={setSelected} />
          <Dropdown selected={selected} setSelected={setSelected} />
        </div>

        <div style={{  /* Here starts the third activity configuration */
          display: 'flex',
          alignItems: 'center',
          /* Here ends the third activity configuration */
        }}>
          <label style={{
            padding: '5px 10px',
            fontSize: '15px',
            fontWeight: 'bold',
          }}>
            Activity 3
          </label>
          <Dropdown selected={selected} setSelected={setSelected} />
          <Dropdown selected={selectedC} setSelected={setSelectedC} />
        </div>

        <div style={{  /* Here starts the fourth activity configuration */
          display: 'flex',
          alignItems: 'center',
          /* Here ends the fourth activity configuration */
        }}>
          <label style={{
            padding: '5px 10px',
            fontSize: '15px',
            fontWeight: 'bold',
          }}>
            Activity 4
          </label>
          <Dropdown selected={selected} setSelected={setSelected} />
          <Dropdown selected={selected} setSelected={setSelected} />
        </div>
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
            background: '#23b131',
            border: '0.1px solid black',
            cursor: 'pointer',
            borderRadius: '8px',
          }}
            onClick={handleSaveButtonClick}
          >
            Save variant
          </button>
        </div>
      </div>



    </Box>
  );
};
export default LcaParameters;
