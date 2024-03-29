import React from 'react'

import {
    Flex,
    Text,
    Link as WarapLink,
    Icon,
    Menu,
    MenuButton,
  } from '@chakra-ui/react'

  import { NavLink } from "react-router-dom";


function NavigationItem({ items, clickedcolor, color}) {

  return (
        <>
        {items.map((link, index) => (
        
            <Flex w="100%" key={index}>
                <Menu placement="right" w="100%">
                    <NavLink to={link.path} onClick={link.event} 
                     style={({ isActive }) => isActive ? { backgroundColor: clickedcolor} : { backgroundColor: color} }
                    className="navi"
                    >
                        <MenuButton                       
                        
                        w="100%">
                            <Flex alignItems='center' >
                                <Flex 
                                    borderRadius='lg' 
                                    bg="#FFFF" 
                                    color='white' 
                                    h={7} 
                                    w={7} 
                                    justifyContent='center' 
                                    alignItems='center' >
                                    <Icon as={link.icon} fontSize="md" color={"RGBA(0, 0, 0, 0.64)"} />
                                </Flex>
                                
                                <Text 
                                    ml={2} 
                                    fontSize={{base: "2xs", md:"sm"}}
                                    textAlign="left" 
                                    color="RGBA(0, 0, 0, 0.64)" 
                                    fontWeight="bold" 
                                    display="flex">{link.name}
                                </Text>
                            </Flex>
                        </MenuButton>
                        
                    </NavLink>
             
                    </Menu>
                </Flex>
        
      ))}
      </>    
  )
  }
  export default NavigationItem;
  