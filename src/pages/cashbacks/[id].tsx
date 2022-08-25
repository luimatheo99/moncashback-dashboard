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
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import InputMask from 'react-input-mask';
import { useMutation } from 'react-query';
import * as yup from 'yup';

import { Input } from '../../components/Form/Input';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { api } from '../../services/apiClient';
import { getCashbackById } from '../../services/hooks/useCashbacks';
import { queryClient } from '../../services/queryClient';
import { withSSRAuth } from '../../utils/withSSRAuth';

type UpdateCashbackFormData = {
    id: string;
    name: string;
    expires_date: string;
    percentage: number;
};

const updateCashbackFormSchema = yup.object().shape({
    name: yup.string().required('Nome obrigatório'),
    expires_date: yup.string().required('Data Expiração obrigatória'),
    percentage: yup.string().required('Porcentagem obrigatória'),
});

export default function Cashback({ id }) {
    const router = useRouter();
    const toast = useToast();

    const [date, setDate] = useState('');

    const { register, handleSubmit, formState, setValue, getValues } = useForm({
        resolver: yupResolver(updateCashbackFormSchema),
    });

    const { errors } = formState;

    useEffect(() => {
        async function init() {
            const cashback = await getCashbackById(id);

            setValue('id', cashback.id);
            setValue('name', cashback.name);
            setDate(cashback.expires_date);
            setValue('expires_date', cashback.expires_date);
            setValue('percentage', cashback.percentage);
        }
        init();
    }, []);

    const updateCashback = useMutation(
        async (cashback: UpdateCashbackFormData) => {
            const response = await api.put(`cashbacks/${id}`, cashback);
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

    const handleUpdateCashback: SubmitHandler<UpdateCashbackFormData> = async (
        values,
    ) => {
        try {
            const day = values.expires_date.split('/')[0];
            const month = values.expires_date.split('/')[1];
            const year = values.expires_date.split('/')[2];
            values.expires_date = `${year}-${month}-${day}`;

            alert(values.expires_date);
            await updateCashback.mutateAsync(values);
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
                    onSubmit={handleSubmit(handleUpdateCashback)}
                >
                    <Heading size="lg" fontWeight="normal">
                        Editar cashback
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
                            <SimpleGrid
                                minChildWidth="240px"
                                spacing={['6', '8']}
                                w="100%"
                            >
                                <InputMask
                                    mask="99/99/9999"
                                    {...register('expires_date')}
                                    error={errors.expires_date}
                                    value={date}
                                    onChange={(e) => {
                                        setValue(
                                            'expires_date',
                                            e.target.value,
                                        );
                                        setDate(e.target.value);
                                    }}
                                >
                                    <Input label="Data Expiração" />
                                </InputMask>
                                <Input
                                    label="Porcentagem"
                                    {...register('percentage')}
                                    error={errors.percentage}
                                />
                            </SimpleGrid>
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

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const { id } = ctx.params;

    return {
        props: {
            id,
        },
    };
});
