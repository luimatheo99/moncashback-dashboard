import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    HStack,
    SimpleGrid,
    VStack,
    IconButton,
    Stack,
    Icon,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    theme,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Text,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { useRouter } from 'next/router';
import { useState, useContext, useEffect, useRef } from 'react';
import { RiCloseLine, RiDeleteBinLine } from 'react-icons/ri';

import { InputGeneral } from '../../components/General/InputGeneral';
import { InputNumberGeneral } from '../../components/General/InputNumberGeneral';
import { SelectGeneral } from '../../components/General/SelectGeneral';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/apiClient';
import { getCompanies } from '../../services/hooks/useCompanies';
import { queryClient } from '../../services/queryClient';

type Cashback = {
    id: string;
    name: string;
    percentage: string;
};

type MovimentationItem = {
    earned_value?: number;
    amountPaid?: number;
    paidCashbackValue?: string;
    cashback_id: string;
    cashback?: {
        name: string;
        percentage: string;
    };
    pay_value?: string;
    item_value: string;
};

export default function CreateMovimentation() {
    const [cashbacks, setCashbacks] = useState<Cashback[]>([]);
    const [movimentationsItems, setMovimentationsItems] = useState<
        MovimentationItem[]
    >([]);
    const [type, setType] = useState('');
    const [value, setValue] = useState('');
    const [payValue, setPayValue] = useState('');
    const [paidCashbackValue, setPaidCashbackValue] = useState('');
    const [code, setCode] = useState('');
    const [idCashback, setIdCashback] = useState('');
    const [earnedValueTotal, setEarnedValueTotal] = useState(0);
    const [maximumValue, setMaximumValue] = useState(0);
    const [externalId, setExternalId] = useState('');

    const [percentageCashback, setPercentageCashback] = useState('');
    const [idCustomer, setIdCustomer] = useState('');
    const [nameCustomer, setNameCustomer] = useState('');
    const [balanceCustomer, setBalanceCustomer] = useState(0);

    const [errorCode, setErrorCode] = useState(false);
    const [errorIdCashback, setErrorIdCashback] = useState(false);
    const [errorType, setErrorType] = useState(false);
    const [errorPayValue, setErrorPayValue] = useState(false);
    const [errorValue, setErrorValue] = useState(false);

    const [message, setMessage] = useState('');

    const [isOpen, setIsOpen] = useState(false);
    const onClose = () => setIsOpen(false);
    const cancelRef = useRef();

    const router = useRouter();
    const toast = useToast();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        async function init() {
            if (user) {
                const { data } = await api.get(
                    `/cashbacks/company/${user?.company_id}`,
                );

                setCashbacks([{ id: '', name: '', percentage: '0' }, ...data]);

                setIdCashback('');
                setPercentageCashback('0');
            }
        }

        init();
    }, [user]);

    async function handleValidadeCode() {
        setIdCustomer('');
        setNameCustomer('');

        if (code) {
            try {
                const responseCustomer = await api.get(
                    `/customers/code=${code}`,
                );

                if (!responseCustomer.data.success) {
                    toast({
                        title: responseCustomer.data.message,
                        status: 'warning',
                        isClosable: true,
                    });
                    return;
                }

                setIdCustomer(responseCustomer.data.customer.id);
                setNameCustomer(responseCustomer.data.customer.name);
                setBalanceCustomer(responseCustomer.data.customer.balance);
            } catch (error) {
                console.error(error);
                toast({
                    title: 'Não foi possível validar o código. Tente novamente!',
                    status: 'error',
                    isClosable: true,
                });
            }
        }
    }

    async function handleAdd() {
        if (code === '') {
            setErrorCode(true);
            return;
        }

        if (type === '') {
            setErrorType(true);
            return;
        }

        if (Number(value) <= 0) {
            setErrorValue(true);
            return;
        }

        if (type === 'W' && !idCashback) {
            setErrorIdCashback(true);
            return;
        }

        if (type === 'P' && Number(payValue) <= 0) {
            setErrorPayValue(true);
            setMessage('Informe o valor a pagar');
            return;
        }

        if (type === 'P' && maximumValue < Number(payValue)) {
            setErrorPayValue(true);
            setMessage('Valor inválido');
            return;
        }

        if (type === 'P' && balanceCustomer < Number(payValue)) {
            setErrorPayValue(true);
            setMessage('Saldo insuficiente');
            return;
        }

        const nameCashback = cashbacks.find((el) => el.id === idCashback)?.name;
        const percentageCashback = cashbacks.find(
            (el) => el.id === idCashback,
        )?.percentage;

        const earned_value =
            ((Number(value) - Number(paidCashbackValue)) / 100) *
            Number(percentageCashback);
        const earnedValueTotalSum = earnedValueTotal + earned_value;
        setEarnedValueTotal(earnedValueTotalSum);

        setMovimentationsItems((old) => [
            ...old,
            {
                earned_value,
                paidCashbackValue,
                cashback_id: idCashback,
                cashback: {
                    name: nameCashback,
                    percentage: percentageCashback,
                },
                item_value: value,
                pay_value: payValue,
            },
        ]);

        setIdCashback('');
        setValue('');
        setPayValue('');
        setPaidCashbackValue('');
        setMaximumValue(0);
    }

    async function handleOnChangeCashback(value: string) {
        setIdCashback(value);
        setErrorIdCashback(false);

        const { percentage } = cashbacks.find((el) => el.id === value);
        setPercentageCashback(percentage);
    }

    async function handleOnChangeType(value: string) {
        setValue('');
        setType(value);
        setErrorType(false);
        setErrorPayValue(false);

        if (value === '' || value === 'W') {
            setPayValue('');
            setMaximumValue(0);
        }

        if (value === '' || value === 'P') {
            setIdCashback('');
            setPaidCashbackValue('');
        }
    }

    async function handleOnChangeValue(value: number) {
        if (value > 0) {
            setErrorValue(false);

            if (type === 'P') {
                try {
                    const response = await getCompanies();

                    if (response.company.maximum_redeption_limit_perc > 0) {
                        const maximumValue =
                            (response.company.maximum_redeption_limit_perc /
                                100) *
                            Number(value);
                        setMaximumValue(maximumValue);
                    }
                } catch (error) {
                    console.error(error);
                    toast({
                        title: 'Não foi possível buscar o percentual.',
                        status: 'error',
                        isClosable: true,
                    });
                }
            }
        }
    }

    async function handleDelete(cashbackId: string) {
        const retIndexOf = movimentationsItems.findIndex(
            (el) => el.cashback_id === cashbackId,
        );
        movimentationsItems.splice(retIndexOf, 1);

        setMovimentationsItems([...movimentationsItems]);

        let sum = 0;

        if (movimentationsItems.length > 0) {
            movimentationsItems.forEach((mi) => {
                sum += mi.earned_value;
            });
        }
        setEarnedValueTotal(sum);
    }

    async function handleSaveMovimentations() {
        let amount = 0;
        let earned_value = 0;
        let pay_value = 0;

        amount = movimentationsItems.reduce((total, { item_value }) => {
            return Number(total) + Number(item_value);
        }, 0);

        if (type === 'W') {
            earned_value = movimentationsItems.reduce(
                (total, { earned_value }) => {
                    return Number(total) + Number(earned_value);
                },
                0,
            );
        }

        if (type === 'P') {
            pay_value = movimentationsItems.reduce((total, { pay_value }) => {
                return Number(total) + Number(pay_value);
            }, 0);
        }

        const movimentation = {
            customer_id: idCustomer,
            company_id: user.company_id,
            amount,
            earned_value,
            pay_value,
            type,
            external_id: externalId,
            movimentationsItems,
        };

        try {
            await api.post('movimentations', movimentation);

            setIsOpen(true);
        } catch (err) {
            console.error(err);
            toast({
                title: `Erro ao salvar os dados!`,
                status: 'error',
                isClosable: true,
            });
        }
    }

    return (
        <>
            <Box>
                <Header />

                <Flex w="100%" my="6" maxWidth={1480} mx="auto" px="6">
                    <Sidebar />

                    <Box flex="1" borderRadius={8} bg="gray.0" p={['6', '8']}>
                        <Heading size="lg" fontWeight="normal">
                            Criar movimentação
                        </Heading>

                        <Divider my="6" borderColor="gray.100" />

                        <VStack w="100%" spacing="8">
                            <Stack direction="row">
                                <InputGeneral
                                    label="Código MON"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    onBlur={() => {
                                        handleValidadeCode();
                                        setErrorCode(false);
                                    }}
                                    error={errorCode}
                                    message="Selecione um código MON"
                                />
                                <SelectGeneral
                                    label="Tipo"
                                    isDisabled={
                                        !idCustomer ||
                                        movimentationsItems.length > 0
                                    }
                                    value={type}
                                    onChange={(e) => {
                                        handleOnChangeType(e.target.value);
                                    }}
                                    error={errorType}
                                    message="Selecione um tipo"
                                >
                                    <option value=""></option>
                                    <option value="W">Ganhar MON</option>
                                    <option value="P">Pagar com MON</option>
                                </SelectGeneral>
                            </Stack>
                            <SimpleGrid
                                minChildWidth="240px"
                                spacing={['6', '8']}
                                w="100%"
                            >
                                <InputGeneral
                                    label="Cliente"
                                    value={nameCustomer}
                                    isDisabled={true}
                                />
                                <InputGeneral
                                    label="Código Externo"
                                    value={externalId}
                                    onChange={(e) =>
                                        setExternalId(e.target.value)
                                    }
                                    isDisabled={!idCustomer}
                                />
                                <Stack direction="row">
                                    <SelectGeneral
                                        label="Cashbacks"
                                        isDisabled={!idCustomer || type !== 'W'}
                                        value={idCashback}
                                        onChange={(e) => {
                                            handleOnChangeCashback(
                                                e.target.value,
                                            );
                                        }}
                                        error={errorIdCashback}
                                        message="Selecione um cashback"
                                    >
                                        {cashbacks &&
                                            cashbacks.map((cashback) => (
                                                <option
                                                    key={cashback.id}
                                                    value={cashback.id}
                                                >
                                                    {`${cashback.name} ${cashback.percentage}%`}
                                                </option>
                                            ))}
                                    </SelectGeneral>
                                    <IconButton
                                        aria-label="Del"
                                        size="lg"
                                        colorScheme="red"
                                        isDisabled={!idCustomer || type !== 'W'}
                                        alignSelf="end"
                                        m="1"
                                        icon={
                                            <Icon
                                                as={RiCloseLine}
                                                fontSize="20"
                                            />
                                        }
                                        onClick={() => {
                                            setIdCashback('');
                                            setPercentageCashback('');
                                        }}
                                    />
                                </Stack>
                            </SimpleGrid>
                            <SimpleGrid
                                minChildWidth="240px"
                                spacing={['6', '8']}
                                w="100%"
                            >
                                <InputNumberGeneral
                                    label="Valor"
                                    value={value}
                                    onChange={(e) => {
                                        setValue(e);
                                    }}
                                    isDisabled={!idCustomer || type === ''}
                                    onBlur={(e) => {
                                        handleOnChangeValue(
                                            Number(e.target.value),
                                        );
                                    }}
                                    error={errorValue}
                                    message="Informe o valor do item"
                                />
                                <InputNumberGeneral
                                    label="Valor Pago em Cashback"
                                    value={paidCashbackValue}
                                    onChange={(e) => setPaidCashbackValue(e)}
                                    isDisabled={!idCustomer || type !== 'W'}
                                />
                                <Stack direction="column">
                                    <InputNumberGeneral
                                        label="Valor a Pagar"
                                        value={payValue}
                                        onChange={(e) => setPayValue(e)}
                                        onBlur={(e) => {
                                            if (Number(e.target.value) > 0) {
                                                setErrorPayValue(false);
                                            }
                                        }}
                                        isDisabled={!idCustomer || type !== 'P'}
                                        error={errorPayValue}
                                        message={message}
                                    />
                                    {Number(value) > 0 && type === 'P' && (
                                        <Text fontSize="14px" color="blue.500">
                                            Valor Máximo{' '}
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            }).format(Number(maximumValue))}
                                        </Text>
                                    )}
                                </Stack>
                            </SimpleGrid>
                        </VStack>
                        <Flex mt="4" justify="flex-end">
                            <Button
                                colorScheme="blue"
                                onClick={() => handleAdd()}
                            >
                                Adicionar
                            </Button>
                        </Flex>

                        <Box mt="8">
                            {type === 'W' ? (
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Cashback</Th>
                                            <Th isNumeric>Valor</Th>
                                            <Th isNumeric>
                                                Valor Pago em Cashback
                                            </Th>
                                            <Th isNumeric>Valor Ganho</Th>
                                            <Th />
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {movimentationsItems &&
                                            movimentationsItems.map(
                                                (movimentationItem, index) => (
                                                    <Tr key={index}>
                                                        <Td>
                                                            {`${movimentationItem.cashback.name} ${movimentationItem.cashback.percentage}%`}
                                                        </Td>
                                                        <Td isNumeric>
                                                            {new Intl.NumberFormat(
                                                                'pt-BR',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'BRL',
                                                                },
                                                            ).format(
                                                                Number(
                                                                    movimentationItem.item_value,
                                                                ),
                                                            )}
                                                        </Td>
                                                        <Td isNumeric>
                                                            {new Intl.NumberFormat(
                                                                'pt-BR',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'BRL',
                                                                },
                                                            ).format(
                                                                Number(
                                                                    movimentationItem.paidCashbackValue,
                                                                ),
                                                            )}
                                                        </Td>
                                                        <Td isNumeric>
                                                            {new Intl.NumberFormat(
                                                                'pt-BR',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'BRL',
                                                                },
                                                            ).format(
                                                                movimentationItem.earned_value,
                                                            )}
                                                        </Td>
                                                        <Td>
                                                            <IconButton
                                                                aria-label="Del"
                                                                size="sm"
                                                                fontSize="sm"
                                                                colorScheme="red"
                                                                icon={
                                                                    <Icon
                                                                        as={
                                                                            RiDeleteBinLine
                                                                        }
                                                                        fontSize="20"
                                                                    />
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        movimentationItem.cashback_id,
                                                                    )
                                                                }
                                                            />
                                                        </Td>
                                                    </Tr>
                                                ),
                                            )}
                                    </Tbody>
                                    <Tfoot>
                                        <Tr>
                                            <Th />
                                            <Th />
                                            <Th />
                                            <Th isNumeric>
                                                {new Intl.NumberFormat(
                                                    'pt-BR',
                                                    {
                                                        style: 'currency',
                                                        currency: 'BRL',
                                                    },
                                                ).format(earnedValueTotal)}
                                            </Th>
                                        </Tr>
                                    </Tfoot>
                                </Table>
                            ) : (
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th isNumeric>Valor</Th>
                                            <Th isNumeric>
                                                Valor Pago em Cashback
                                            </Th>
                                            <Th isNumeric>Valor Total</Th>
                                            <Th />
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {movimentationsItems &&
                                            movimentationsItems.map(
                                                (movimentationItem, index) => (
                                                    <Tr key={index}>
                                                        <Td isNumeric>
                                                            {new Intl.NumberFormat(
                                                                'pt-BR',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'BRL',
                                                                },
                                                            ).format(
                                                                Number(
                                                                    movimentationItem.item_value,
                                                                ),
                                                            )}
                                                        </Td>
                                                        <Td isNumeric>
                                                            {new Intl.NumberFormat(
                                                                'pt-BR',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'BRL',
                                                                },
                                                            ).format(
                                                                Number(
                                                                    movimentationItem.pay_value,
                                                                ),
                                                            )}
                                                        </Td>
                                                        <Td isNumeric>
                                                            {new Intl.NumberFormat(
                                                                'pt-BR',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'BRL',
                                                                },
                                                            ).format(
                                                                Number(
                                                                    movimentationItem.item_value,
                                                                ) -
                                                                    Number(
                                                                        movimentationItem.pay_value,
                                                                    ),
                                                            )}
                                                        </Td>
                                                        <Td>
                                                            <IconButton
                                                                aria-label="Del"
                                                                size="sm"
                                                                fontSize="sm"
                                                                colorScheme="red"
                                                                icon={
                                                                    <Icon
                                                                        as={
                                                                            RiDeleteBinLine
                                                                        }
                                                                        fontSize="20"
                                                                    />
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        movimentationItem.cashback_id,
                                                                    )
                                                                }
                                                            />
                                                        </Td>
                                                    </Tr>
                                                ),
                                            )}
                                    </Tbody>
                                    <Tfoot>
                                        <Tr>
                                            <Th />
                                            <Th />
                                            <Th />
                                        </Tr>
                                    </Tfoot>
                                </Table>
                            )}
                        </Box>

                        <Flex mt="8" justify="flex-end">
                            <HStack spacing="4">
                                <Button
                                    colorScheme="green"
                                    onClick={() => handleSaveMovimentations()}
                                    isDisabled={movimentationsItems.length <= 0}
                                >
                                    Salvar
                                </Button>
                            </HStack>
                        </Flex>
                    </Box>
                </Flex>
            </Box>
            <AlertDialog
                motionPreset="slideInBottom"
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg={theme.colors.gray[50]}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Salvo com sucesso
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Deseja cadastrar outra movimentação?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button
                                ref={cancelRef}
                                onClick={() => {
                                    queryClient.invalidateQueries(
                                        'movimentations',
                                    );
                                    router.push('/movimentations');
                                }}
                                bg={theme.colors.gray[300]}
                                _hover={{ opacity: 0.85 }}
                            >
                                Não
                            </Button>
                            <Button
                                colorScheme="green"
                                onClick={() => router.reload()}
                                ml={3}
                            >
                                Sim
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}
