import {
    Select as ChakraSelect,
    FormLabel,
    FormControl,
    SelectProps as ChakraSelectProps,
    FormErrorMessage,
} from '@chakra-ui/react';
import { forwardRef, ForwardRefRenderFunction } from 'react';

interface ISelectProps extends ChakraSelectProps {
    label: string;
    error?: boolean;
    message?: string;
}

const SelectBase: ForwardRefRenderFunction<HTMLInputElement, ISelectProps> = (
    { label, error = false, message, ...rest },
    ref,
) => {
    return (
        <FormControl isInvalid={!!error}>
            {!!label && <FormLabel>{label}</FormLabel>}
            <ChakraSelect
                focusBorderColor="green.500"
                bgColor="gray.50"
                variant="filled"
                _hover={{
                    bgColor: 'gray.50',
                }}
                size="lg"
                // ref={ref}
                {...rest}
            />

            {!!error && <FormErrorMessage>{message}</FormErrorMessage>}
        </FormControl>
    );
};

export const SelectGeneral = forwardRef(SelectBase);
