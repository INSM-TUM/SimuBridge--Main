import React, { useState, useRef } from "react";
import { Flex, Heading, Card, CardHeader, CardBody, Text, Select, Stack, Button, Progress, Box, Textarea, UnorderedList, ListItem } from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import Dropdown from './Dropdown';
import "./styles.css"

const LcaParameters = () => {
    const [inputValue, setInputValue] = useState('');
    const [apiUrl, setApiUrl] = useState('');
  
    const handleInputChange = (event) => {
      setInputValue(event.target.value);
    };
  
    const handleApiUrlChange = (event) => {
      setApiUrl(event.target.value);
    };
  
    const handleButtonClick = () => {
      // Make an API call using fetch
      fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: inputValue }),
      })
        .then((response) => {
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
          console.error('API Error:', error);
          // Handle errors as needed
        });
    };

    const[select, setSelected] = useState("Choose Abstract Component");
    const[selectC, setSelectedC] = useState("Choose Concrete Component");
  
    return (
<div>


        <label
        style={{
            padding: '20px 5px',
            fontSize: '25px',
            fontWeight: 'bold',
            }}>
Fetch OpenLCA data
        </label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
  display: 'flex', 
  alignItems: 'center', 
  border: '0.1px solid black', /* This will add a border */
  borderRadius: '8px', /* This will make the border round angled */
  padding: '0px', /* This will add some space between the border and the elements inside */
}}>
  <label
style={{
    backgroundColor: 'default', /* Teal */
    border: 'none',
    color: 'black',
    padding: '10px 25px',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '15px',
    fontWeight: 'bold',
    margin: '2px 1px',
    cursor: 'default',
    borderRadius: '8px',
  }}
>
Enter URL:  
</label>
  <input
  style={{
    padding: '5px',
  }}
    type="text"
    value={apiUrl}
    onChange={handleApiUrlChange}
    placeholder="Enter API URL..."
  />
</div>

          <button 
            onClick={handleButtonClick} 
            style={{
              backgroundColor: '#E8E8E8',
              border: '0.1px solid black',
              color: 'black',
              padding: '12px 40px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '15px',
              fontWeight: 'bold',
              margin: '25px 10px',
              cursor: 'pointer',
              borderRadius: '8px',
            }}
          >
            Fetch
          </button>
        </div>


        <hr style={{borderTop: '2px solid black'}}/>
        <br></br>
        
      
      <div className="Big-Container" style={{ 
              border: '0.1px solid black',
              padding: '0px',
              margin: '0px',}}>
                                <div style={{  /* Here starts the first activity configuration */
                                                              display: 'flex', 
                                                              alignItems: 'center', 
                                                              /* Here ends the first activity configuration */
                                                          }}>
                                        <label style={{
                                                        padding: '5px',
                                                        fontSize: '15px',
                                                        fontWeight: 'bold',
                                                    }}>
                                Activity 1
                                        </label>
                                <Dropdown selected={select} setSelected={setSelected} />
                                <Dropdown selected={select} setSelected={setSelected} />
                                </div> 

                                <div style={{  /* Here starts the second activity configuration */
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  /* Here ends the second activity configuration */
                                                    
                                }}>
                                  <label style={{
                                                        padding: '5px',
                                                        fontSize: '15px',
                                                        fontWeight: 'bold',
                                                    }}>
                                Activity 2
                                        </label>
                                <Dropdown selected={select} setSelected={setSelected} />
                                <Dropdown selected={select} setSelected={setSelected} />
                                </div>

                                <div style={{  /* Here starts the third activity configuration */
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  /* Here ends the third activity configuration */
                                }}>
                                  <label style={{
                                                        padding: '5px',
                                                        fontSize: '15px',
                                                        fontWeight: 'bold',
                                                    }}>
                                Activity 3
                                        </label>
                                <Dropdown selected={select} setSelected={setSelected} />
                                <Dropdown selected={select} setSelected={setSelected} />
                                </div>

                                <div style={{  /* Here starts the fourth activity configuration */
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  /* Here ends the fourth activity configuration */
                                }}>
                                  <label style={{
                                                        padding: '5px',
                                                        fontSize: '15px',
                                                        fontWeight: 'bold',
                                                    }}>
                                Activity 4
                                        </label>
                                <Dropdown selected={select} setSelected={setSelected} />
                                <Dropdown selected={select} setSelected={setSelected} />
                                </div>
      </div>




</div>  
    );
  };
export default LcaParameters;
