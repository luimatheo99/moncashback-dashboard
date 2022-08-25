import { Flex, Button, Stack } from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useContext } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { Input } from '../components/Form/Input';
import { AuthContext } from '../contexts/AuthContext';
import { withSSRGuest } from '../utils/withSSRGuest';

type SignInFormData = {
    email: string;
    password: string;
};

const signInFormSchema = yup.object().shape({
    email: yup.string().required('E-mail obrigatório').email('E-mail inválido'),
    password: yup.string().required('Senha obrigatória'),
});

export default function Home() {
    const { register, handleSubmit, formState } = useForm({
        resolver: yupResolver(signInFormSchema),
    });

    const { signIn } = useContext(AuthContext);
    const { errors } = formState;

    const handleSignIn: SubmitHandler<SignInFormData> = async (values) => {
        await signIn(values);
    };

    return (
        <Flex w="100vw" h="100vh" align="center" justify="center">
            <Flex
                as="form"
                width="100%"
                maxWidth={360}
                bg="gray.0"
                p="8"
                borderRadius={8}
                flexDir="column"
                onSubmit={handleSubmit(handleSignIn)}
            >
                <Stack spacing="4">
                    <Input
                        name="email"
                        type="email"
                        label="E-mail"
                        {...register('email')}
                        error={errors.email}
                    />
                    <Input
                        name="password"
                        type="password"
                        label="Senha"
                        {...register('password')}
                        error={errors.password}
                    />
                </Stack>

                <Button
                    type="submit"
                    mt="6"
                    colorScheme="green"
                    size="lg"
                    isLoading={formState.isSubmitting}
                >
                    Entrar
                </Button>
            </Flex>
        </Flex>
    );
}

export const getServerSideProps = withSSRGuest(async (ctx) => ({
    props: {},
}));
