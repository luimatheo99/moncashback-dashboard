import {
    Select as ChakraSelect,
    FormLabel,
    FormControl,
    SelectProps as ChakraSelectProps,
    FormErrorMessage,
} from '@chakra-ui/react';
import { forwardRef, ForwardRefRenderFunction } from 'react';
import { FieldError } from 'react-hook-form';

interface ISelectProps extends ChakraSelectProps {
    name: string;
    label?: string;
    error?: FieldError;
}

const SelectBase: ForwardRefRenderFunction<HTMLInputElement, ISelectProps> = (
    { name, label, error = null, ...rest },
    ref,
) => {
    return (
        <FormControl isInvalid={!!error}>
            {!!label && <FormLabel htmlFor={name}>{label}</FormLabel>}
            <ChakraSelect
                name={name}
                id={name}
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

            {!!error && <FormErrorMessage>{error.message}</FormErrorMessage>}
        </FormControl>
    );
};

export const Select = forwardRef(SelectBase);
