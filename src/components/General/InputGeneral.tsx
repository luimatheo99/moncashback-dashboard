import {
    Input as ChakraInput,
    FormLabel,
    FormControl,
    InputProps as ChakraInputProps,
    FormErrorMessage,
} from '@chakra-ui/react';
import { forwardRef, ForwardRefRenderFunction } from 'react';

interface IInputProps extends ChakraInputProps {
    label: string;
    error?: boolean;
    message?: string;
}

const InputBase: ForwardRefRenderFunction<HTMLInputElement, IInputProps> = (
    { label, error = false, message, ...rest },
    ref,
) => {
    return (
        <FormControl isInvalid={!!error}>
            {!!label && <FormLabel>{label}</FormLabel>}
            <ChakraInput
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

            {!!error && <FormErrorMessage>{message}</FormErrorMessage>}
        </FormControl>
    );
};

export const InputGeneral = forwardRef(InputBase);
