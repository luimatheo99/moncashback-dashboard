import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    HStack,
    SimpleGrid,
    VStack,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { SubmitHandler, useForm } from 'react-hook-form';
import InputMask from 'react-input-mask';
import { useMutation } from 'react-query';
import * as yup from 'yup';

import { Input } from '../../components/Form/Input';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { api } from '../../services/apiClient';
import { queryClient } from '../../services/queryClient';

type CreateCashbackFormData = {
    id: string;
    name: string;
    expires_date: string;
    percentage: number;
};

const createCashbackFormSchema = yup.object().shape({
    name: yup.string().required('Nome obrigatório'),
    expires_date: yup.string().required('Data Expiração obrigatória'),
    percentage: yup.string().required('Porcentagem obrigatória'),
});

export default function CreateCashback({ id }) {
    const router = useRouter();
    const toast = useToast();

    const { register, handleSubmit, formState } = useForm({
        resolver: yupResolver(createCashbackFormSchema),
    });

    const { errors } = formState;

    const createCashback = useMutation(
        async (cashback: CreateCashbackFormData) => {
            const response = await api.post(`cashbacks/byuser`, cashback);
            return response.data;
        },
        {
            onError: () => {
                toast({
                    title: `Erro ao salvar os dados!`,
                    status: 'error',
                    isClosable: true,
                });
            },
            onSuccess: () => {
                toast({
                    title: `Salvo com sucesso!`,
                    status: 'success',
                    isClosable: true,
                });

                queryClient.invalidateQueries('cashbacks');
                router.push('/cashbacks');
            },
        },
    );

    const handleCreateCashback: SubmitHandler<CreateCashbackFormData> = async (
        values,
    ) => {
        try {
            const day = values.expires_date.split('/')[0];
            const month = values.expires_date.split('/')[1];
            const year = values.expires_date.split('/')[2];
            values.expires_date = `${year}-${month}-${day}`;

            await createCashback.mutateAsync(values);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box>
            <Header />

            <Flex w="100%" my="6" maxWidth={1480} mx="auto" px="6">
                <Sidebar />

                <Box
                    as="form"
                    flex="1"
                    borderRadius={8}
                    bg="gray.0"
                    p={['6', '8']}
                    onSubmit={handleSubmit(handleCreateCashback)}
                >
                    <Heading size="lg" fontWeight="normal">
                        Criar cashback
                    </Heading>

                    <Divider my="6" borderColor="gray.100" />
                    <VStack spacing="8">
                        <SimpleGrid
                            minChildWidth="240px"
                            spacing={['6', '8']}
                            w="100%"
                        >
                            <Input
                                label="Nome"
                                {...register('name')}
                                error={errors.name}
                            />
                        </SimpleGrid>

                        <SimpleGrid
                            minChildWidth="240px"
                            spacing={['6', '8']}
                            w="100%"
                        >
                            <InputMask
                                mask="99/99/9999"
                                {...register('expires_date')}
                                error={errors.expires_date}
                            >
                                <Input label="Data Expiração" />
                            </InputMask>
                            <Input
                                label="Porcentagem"
                                {...register('percentage')}
                                error={errors.percentage}
                            />
                        </SimpleGrid>
                    </VStack>

                    <Flex mt="8" justify="flex-end">
                        <HStack spacing="4">
                            <Button
                                type="submit"
                                colorScheme="green"
                                isLoading={formState.isSubmitting}
                            >
                                Salvar
                            </Button>
                        </HStack>
                    </Flex>
                </Box>
            </Flex>
        </Box>
    );
}
