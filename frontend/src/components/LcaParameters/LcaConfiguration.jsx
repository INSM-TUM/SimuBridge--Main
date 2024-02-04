import React, { useState, useRef, useEffect } from "react";
import {
  Alert, AlertIcon, AlertDescription, CloseButton, useDisclosure,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Flex, Stack,
  Heading,
  Card, CardHeader, CardBody,
  Text,
  Input, InputGroup, InputRightElement, InputLeftElement,
  Select, Button,
  Progress,
  Box,
  Spinner,
  useToast,
  UnorderedList, ListItem
} from '@chakra-ui/react';

import { ExternalLinkIcon } from '@chakra-ui/icons';
import ProgressPage from "../StartView/ProgressPage";

import { FiChevronDown } from 'react-icons/fi';
import Dropdown from './Dropdown';
import "./styles.css"
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";


import {
  debounce
} from 'min-dash';
import SimulationModelModdle, { assign, limitToDataScheme } from "simulation-bridge-datamodel/DataModel";
import VariantEditor from "./VariantEditor";
import OLCAconnectionAlert from "./OLCAconnectionAlert";

function LcaConfiguration({ getData,toasting }) {
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState('');
  const [allCostDrivers, setAllCostDrivers] = useState([]);
  const [bpmnActivities, setBpmnActivities] = useState([]);

  return (
    <Box>
      <Heading size='lg' >Environmental Configuration for {getData().getCurrentScenario().scenarioName}</Heading>
      <Card my={2}>
          <CardHeader>
            <Heading size='md'>Saved variants (total: {variants.length})</Heading>
            {console.log("Variants: ", variants)}
          </CardHeader>
          <CardBody>
            {/* list of variants */}
          </CardBody>
        </Card>
        <VariantEditor
          costVariant={currentVariant}
          bpmnActivities={bpmnActivities}
          allCostDrivers={allCostDrivers}
        />
    </Box>
  );
}

export default LcaConfiguration;