import {
    Input as ChakraInput,
    FormLabel,
    FormControl,
    InputProps as ChakraInputProps,
    FormErrorMessage,
} from '@chakra-ui/react';
import { forwardRef, ForwardRefRenderFunction } from 'react';
import { FieldError } from 'react-hook-form';

interface IInputProps extends ChakraInputProps {
    name?: string;
    label?: string;
    error?: FieldError;
}

const InputBase: ForwardRefRenderFunction<HTMLInputElement, IInputProps> = (
    { name, label, error = null, ...rest },
    ref,
) => {
    return (
        <FormControl isInvalid={!!error}>
            {!!label && <FormLabel htmlFor={name}>{label}</FormLabel>}
            <ChakraInput
                name={name}
                id={name}
                focusBorderColor="green.500"
                bgColor="gray.50"
                variant="filled"
                _hover={{
                    bgColor: 'gray.50',
                }}
                size="lg"
                ref={ref}
                {...rest}
            />

            {!!error && <FormErrorMessage>{error.message}</FormErrorMessage>}
        </FormControl>
    );
};

export const Input = forwardRef(InputBase);
