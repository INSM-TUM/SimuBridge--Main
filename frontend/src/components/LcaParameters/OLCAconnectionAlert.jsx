import React, { useState } from 'react';
import {
  Alert, AlertIcon, AlertDescription, CloseButton, useDisclosure,
  Flex, Stack,
} from '@chakra-ui/react';

export default function OLCAconnectionAlert({countCostDrivers}) {
    const {
        isOpen: isVisible,
        onClose,
    } = useDisclosure({ defaultIsOpen: true });

    return (
        <Alert status='success' mt={2} display='flex' alignItems='center' justifyContent='space-between'>
            <Flex alignItems='center'>
                <AlertIcon />
                <AlertDescription>{countCostDrivers} cost drivers loaded</AlertDescription>
            </Flex>
            <CloseButton position='relative' onClick={onClose} />
        </Alert>
    );
}