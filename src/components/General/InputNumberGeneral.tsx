import {
    NumberInput as ChakraNumberInput,
    NumberInputField as ChakraNumberInputField,
    FormLabel,
    FormControl,
    NumberInputProps as ChakraNumberInputProps,
    FormErrorMessage,
} from '@chakra-ui/react';
import { forwardRef, ForwardRefRenderFunction } from 'react';

interface INumberInputProps extends ChakraNumberInputProps {
    label: string;
    error?: boolean;
    message?: string;
}

const InputNumberBase: ForwardRefRenderFunction<
    HTMLInputElement,
    INumberInputProps
> = ({ label, error = false, message, ...rest }, ref) => {
    return (
        <FormControl isInvalid={!!error}>
            {!!label && <FormLabel>{label}</FormLabel>}
            <ChakraNumberInput
                focusBorderColor="green.500"
                variant="filled"
                size="lg"
                ref={ref}
                precision={2}
                step={0.2}
                {...rest}
            >
                <ChakraNumberInputField
                    variant="filled"
                    bgColor="gray.50"
                    _hover={{
                        bgColor: 'gray.50',
                    }}
                />
            </ChakraNumberInput>

            {!!error && <FormErrorMessage>{message}</FormErrorMessage>}
        </FormControl>
    );
};

export const InputNumberGeneral = forwardRef(InputNumberBase);
