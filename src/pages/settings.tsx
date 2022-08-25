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
import * as yup from 'yup';

import { Input } from '../components/Form/Input';
import { Select } from '../components/Form/Select';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/apiClient';
import { getCities, getStates } from '../services/hooks/useAdresses';
import { getCompanies } from '../services/hooks/useCompanies';

type UpdateCompanyFormData = {
    id: string;
    name: string;
    email: string;
    phone: string;
    facebook_url: string;
    instagram_url: string;
    site_url: string;
    category_id: string;
    state_id: string;
    city_id: string;
    district: string;
    street: string;
    number: number;
    maximum_redeption_limit_perc: number;
};

type State = {
    id: string;
    name: string;
    uf: string;
};

type City = {
    id: string;
    name: string;
    state_id: string;
};

const updateCompanyFormSchema = yup.object().shape({
    name: yup.string().required('Nome obrigatório'),
    email: yup.string().required('E-mail obrigatório').email('E-mail inválido'),
    phone: yup
        .string()
        .required('Celular obrigatório')
        .min(10, 'Celular inválido'),
    state_id: yup.string().required('Estado obrigatório'),
    city_id: yup.string().required('Cidade obrigatório'),
});

export default function Settings() {
    const [states, setStates] = useState<State[]>([]);
    const [stateId, setStateId] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [cityId, setCityId] = useState('');

    const router = useRouter();
    const toast = useToast();

    const { register, handleSubmit, formState, setValue } = useForm({
        resolver: yupResolver(updateCompanyFormSchema),
        mode: 'onChange',
    });

    const { errors } = formState;

    useEffect(() => {
        async function init() {
            const { states } = await getStates();
            setStates(states);

            const { company } = await getCompanies();
            setValue('id', company.id);
            setValue('name', company.name);
            setValue('email', company.email);
            setValue('phone', company.phone);
            setValue('facebook_url', company.facebook_url);
            setValue('instagram_url', company.instagram_url);
            setValue('site_url', company.site_url);
            setValue('category_id', company.category_id);
            setValue('state_id', company.state_id);
            setStateId(company.state_id);
            setValue('city_id', company.city_id);
            setCityId(company.city_id);
            setValue('district', company.district);
            setValue('street', company.street);
            setValue('number', company.number);
            setValue(
                'maximum_redeption_limit_perc',
                company.maximum_redeption_limit_perc,
            );

            const { cities } = await getCities(company.state_id);
            setCities(cities);
        }
        init();
    }, []);

    async function handleOnChangeState(value: string) {
        const { cities } = await getCities(value);
        setCities(cities);

        setValue('state_id', value);
        setStateId(value);
    }

    const handleUpdateCompany: SubmitHandler<UpdateCompanyFormData> = async (
        values,
    ) => {
        try {
            await api.put(`companies/byuser`, values);
            toast({
                title: `Salvo com sucesso!`,
                status: 'success',
                isClosable: true,
            });
            router.push('/settings');
        } catch (err) {
            toast({
                title: `Erro ao atualizar os dados!`,
                status: 'error',
                isClosable: true,
            });
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
                    onSubmit={handleSubmit(handleUpdateCompany)}
                >
                    <Heading size="lg" fontWeight="normal">
                        Editar configurações
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
                            <Input
                                type="email"
                                label="E-mail"
                                {...register('email')}
                                error={errors.email}
                            />
                            <Input
                                label="Celular"
                                {...register('phone')}
                                error={errors.phone}
                            />
                        </SimpleGrid>

                        <SimpleGrid
                            minChildWidth="240px"
                            spacing={['6', '8']}
                            w="100%"
                        >
                            <Select
                                label="Estado"
                                name="state_id"
                                value={stateId}
                                {...register('state_id')}
                                onChange={(e) =>
                                    handleOnChangeState(e.target.value)
                                }
                                error={errors.state_id}
                            >
                                {states &&
                                    states.map((state) => (
                                        <option key={state.id} value={state.id}>
                                            {state.name}
                                        </option>
                                    ))}
                            </Select>
                            <Select
                                label="Cidade"
                                name="city_id"
                                value={cityId}
                                {...register('city_id')}
                                onChange={(e) => {
                                    setValue('city_id', e.target.value);
                                    setCityId(e.target.value);
                                }}
                                error={errors.city_id}
                            >
                                {cities &&
                                    cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name}
                                        </option>
                                    ))}
                            </Select>
                            <Input label="Bairro" {...register('district')} />
                            <Input label="Rua" {...register('street')} />
                            <Input
                                label="Nº"
                                type="number"
                                {...register('number')}
                            />
                        </SimpleGrid>

                        <SimpleGrid
                            minChildWidth="240px"
                            spacing={['6', '8']}
                            w="100%"
                        >
                            <Input
                                label="Facebook"
                                {...register('facebook_url')}
                            />
                            <Input
                                label="Instagram"
                                {...register('instagram_url')}
                            />
                            <Input label="Site" {...register('site_url')} />
                        </SimpleGrid>
                        <SimpleGrid
                            minChildWidth="240px"
                            spacing={['6', '8']}
                            w="100%"
                        >
                            <Input
                                type="number"
                                label="Percentual máximo que pode pagar"
                                w="xs"
                                {...register('maximum_redeption_limit_perc')}
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
