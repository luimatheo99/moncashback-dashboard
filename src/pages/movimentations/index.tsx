/* eslint-disable no-nested-ternary */
import { useDisclosure } from '@chakra-ui/hooks';
import {
    Box,
    Button,
    Flex,
    Heading,
    Icon,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useBreakpointValue,
    Spinner,
    IconButton,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    theme,
    Tooltip,
    useToast,
    HStack,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    FormLabel,
    Select,
    Stack,
    Input,
} from '@chakra-ui/react';
import moment from 'moment';
import NextLink from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { RiAddLine, RiCloseLine, RiFilter2Line } from 'react-icons/ri';
import InputMask from 'react-input-mask';
import { useMutation } from 'react-query';

import { Header } from '../../components/Header';
import { Pagination } from '../../components/Pagination';
import { Sidebar } from '../../components/Sidebar';
import { api } from '../../services/apiClient';
import {
    getMovimentations,
    GetMovimentationsResponse,
    useMovimentations,
} from '../../services/hooks/useMovimentations';
import { queryClient } from '../../services/queryClient';

export default function MovimentationList() {
    const [type, setType] = useState('');
    const [situation, setSituation] = useState('');
    const [startDate, setStartDate] = useState(
        moment().locale('pt-br').format('DD/MM/YYYY'),
    );
    const [endDate, setEndDate] = useState(
        moment().locale('pt-br').format('DD/MM/YYYY'),
    );

    const [movimentationId, setMovimentationId] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading, error, isFetching } = useMovimentations({
        page,
        situation: '',
        type: '',
        start_date: moment()
            .locale('pt-br')
            .set('hour', 0)
            .set('minute', 0)
            .set('second', 0)
            .set('millisecond', 0)
            .toISOString(true),
        end_date: moment()
            .locale('pt-br')
            .set('hour', 23)
            .set('minute', 59)
            .set('second', 59)
            .set('millisecond', 59)
            .toISOString(true),
    });

    const [isOpenCancel, setIsOpenCancel] = useState(false);
    const onCloseCancel = () => setIsOpenCancel(false);
    const cancelRefCancel = useRef();

    const [dataGrid, setDataGrid] = useState<GetMovimentationsResponse>(data);

    const {
        isOpen: isOpenFilter,
        onOpen: onOpenFilter,
        onClose: onCloseFilter,
    } = useDisclosure();

    const toast = useToast();

    const isWideVersion = useBreakpointValue({
        base: false,
        lg: true,
    });

    useEffect(() => {
        setDataGrid(data);
    }, [data]);

    async function handleOpenCancel(movimentationId: string) {
        setMovimentationId(movimentationId);
        setIsOpenCancel(true);
    }

    const cancelMovimentationById = useMutation(
        async () => {
            const response = await api.put(
                `/movimentations/${movimentationId}/cancel`,
            );

            if (response.status !== 204) {
                toast({
                    title: `Erro ao cancelar a movimentação!`,
                    status: 'error',
                    isClosable: true,
                });
            }
        },
        {
            onError: () => {
                toast({
                    title: `Erro ao cancelar a movimentação!`,
                    status: 'error',
                    isClosable: true,
                });
            },
            onSuccess: () => {
                toast({
                    title: `Movimentação cancelada com sucesso!`,
                    status: 'success',
                    isClosable: true,
                });

                queryClient.invalidateQueries('movimentations');
            },
        },
    );

    async function handleCancelMovimentationById() {
        try {
            await cancelMovimentationById.mutateAsync();
            setMovimentationId('');
            setIsOpenCancel(false);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleFilter() {
        const dayStartDate = startDate.split('/')[0];
        const monthStartDate = startDate.split('/')[1];
        const yearStartDate = startDate.split('/')[2];
        const startDateString = `${yearStartDate}-${monthStartDate}-${dayStartDate}`;

        const startDateConvert = moment(startDateString)
            .locale('pt-br')
            .set('hour', 0)
            .set('minute', 0)
            .set('second', 0)
            .set('millisecond', 0)
            .toISOString(true);

        const dayEndDate = endDate.split('/')[0];
        const monthEndDate = endDate.split('/')[1];
        const yearEndDate = endDate.split('/')[2];
        const endDateString = `${yearEndDate}-${monthEndDate}-${dayEndDate}`;

        const endDateConvert = moment(endDateString)
            .locale('pt-br')
            .set('hour', 23)
            .set('minute', 59)
            .set('second', 59)
            .set('millisecond', 59)
            .toISOString(true);

        try {
            const ret = await getMovimentations({
                page,
                start_date: startDateConvert,
                end_date: endDateConvert,
                type,
                situation,
            });
            setDataGrid(ret);

            onCloseFilter();
        } catch (err) {
            toast({
                title: `Erro ao buscar!`,
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
                    <Box flex="1" borderRadius={8} bg="gray.0" p="8">
                        <Flex mb="8" justify="space-between" align="center">
                            <Heading size="lg" fontWeight="normal">
                                Movimentações
                                {!isLoading && isFetching && (
                                    <Spinner
                                        size="sm"
                                        color="gray.500"
                                        ml="4"
                                    />
                                )}
                            </Heading>

                            <Flex>
                                <HStack>
                                    <Button
                                        size="sm"
                                        fontSize="sm"
                                        colorScheme="blue"
                                        leftIcon={
                                            <Icon
                                                as={RiFilter2Line}
                                                fontSize="20"
                                            />
                                        }
                                        onClick={onOpenFilter}
                                    >
                                        Filtro
                                    </Button>
                                    <NextLink
                                        href="/movimentations/create"
                                        passHref
                                    >
                                        <Button
                                            as="a"
                                            size="sm"
                                            fontSize="sm"
                                            colorScheme="green"
                                            leftIcon={
                                                <Icon
                                                    as={RiAddLine}
                                                    fontSize="20"
                                                />
                                            }
                                        >
                                            Criar novo
                                        </Button>
                                    </NextLink>
                                </HStack>
                            </Flex>
                        </Flex>

                        {isLoading ? (
                            <Flex justify="center">
                                <Spinner />
                            </Flex>
                        ) : error ? (
                            <Flex justify="center">
                                <Text>
                                    Falha ao obter dados das movimentações.
                                </Text>
                            </Flex>
                        ) : (
                            <>
                                <Table colorScheme="whiteAlpha">
                                    <Thead>
                                        <Tr>
                                            <Th />
                                            <Th>Cliente</Th>
                                            <Th>Tipo</Th>
                                            <Th>Valor Ganho</Th>
                                            <Th>Valor do Pagto</Th>
                                            <Th>Valor Total</Th>
                                            <Th>Situação</Th>
                                            <Th>Data</Th>
                                            {isWideVersion && (
                                                <Th>Cód. Externo</Th>
                                            )}
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {dataGrid?.movimentations?.map(
                                            (movimentation) => {
                                                return (
                                                    <Tr key={movimentation.id}>
                                                        <Td>
                                                            <Tooltip label="Cancelar">
                                                                <IconButton
                                                                    aria-label="Cancel"
                                                                    size="xs"
                                                                    color="red"
                                                                    variant="outline"
                                                                    colorScheme="red"
                                                                    disabled={
                                                                        movimentation.situation ===
                                                                            'C' ||
                                                                        Number(
                                                                            movimentation.diff_minutes,
                                                                        ) < -10
                                                                    }
                                                                    icon={
                                                                        <Icon
                                                                            as={
                                                                                RiCloseLine
                                                                            }
                                                                            fontSize="20"
                                                                        />
                                                                    }
                                                                    onClick={() =>
                                                                        handleOpenCancel(
                                                                            movimentation.id,
                                                                        )
                                                                    }
                                                                />
                                                            </Tooltip>
                                                        </Td>
                                                        <Td>
                                                            <Text fontWeight="bold">
                                                                {`${movimentation.customer.name} - ${movimentation.customer.phone}`}
                                                            </Text>
                                                        </Td>
                                                        <Td>
                                                            <Text fontWeight="bold">
                                                                {
                                                                    movimentation.typeDescription
                                                                }
                                                            </Text>
                                                        </Td>
                                                        <Td>
                                                            <Text>
                                                                {
                                                                    movimentation.earned_value
                                                                }
                                                            </Text>
                                                        </Td>
                                                        <Td>
                                                            <Text>
                                                                {
                                                                    movimentation.pay_value
                                                                }
                                                            </Text>
                                                        </Td>
                                                        <Td>
                                                            <Text>
                                                                {
                                                                    movimentation.amount
                                                                }
                                                            </Text>
                                                        </Td>
                                                        <Td>
                                                            <Text
                                                                fontWeight="bold"
                                                                p={2}
                                                                color="white"
                                                                borderRadius={2}
                                                                bgColor={
                                                                    movimentation.situation ===
                                                                    'F'
                                                                        ? 'green.600'
                                                                        : 'red.600'
                                                                }
                                                            >
                                                                {
                                                                    movimentation.situationDescription
                                                                }
                                                            </Text>
                                                        </Td>
                                                        <Td>
                                                            <Text>
                                                                {
                                                                    movimentation.created_at
                                                                }
                                                            </Text>
                                                        </Td>
                                                        {isWideVersion && (
                                                            <Td>
                                                                <Text>
                                                                    {
                                                                        movimentation.external_id
                                                                    }
                                                                </Text>
                                                            </Td>
                                                        )}
                                                    </Tr>
                                                );
                                            },
                                        )}
                                    </Tbody>
                                </Table>

                                <Pagination
                                    totalCountOfRegisters={data.totalCount}
                                    currentPage={page}
                                    onPageChange={setPage}
                                />
                            </>
                        )}
                    </Box>
                </Flex>
            </Box>
            <AlertDialog
                motionPreset="slideInBottom"
                isOpen={isOpenCancel}
                leastDestructiveRef={cancelRefCancel}
                onClose={onCloseCancel}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg={theme.colors.gray[50]}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Cancelar movimentação
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Tem certeza? Você não pode desfazer esta ação
                            depois.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button
                                ref={cancelRefCancel}
                                onClick={onCloseCancel}
                                bg={theme.colors.gray[300]}
                                _hover={{ opacity: 0.85 }}
                            >
                                Fechar
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleCancelMovimentationById}
                                ml={3}
                            >
                                Cancelar
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            <Drawer
                isOpen={isOpenFilter}
                placement="right"
                onClose={onCloseFilter}
                size="md"
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">Filtros</DrawerHeader>

                    <DrawerBody>
                        <Stack spacing="24px">
                            <Box>
                                <FormLabel>Período</FormLabel>
                                <HStack>
                                    <FormLabel>De</FormLabel>
                                    <InputMask
                                        mask="99/99/9999"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                    >
                                        <Input />
                                    </InputMask>
                                    <FormLabel>Até</FormLabel>
                                    <InputMask
                                        mask="99/99/9999"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                    >
                                        <Input />
                                    </InputMask>
                                </HStack>
                            </Box>
                            <Box>
                                <FormLabel>Tipo</FormLabel>
                                <Select
                                    defaultValue=""
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="W">Ganhou MON</option>
                                    <option value="P">Pagou com MON</option>
                                </Select>
                            </Box>
                            <Box>
                                <FormLabel>Situação</FormLabel>
                                <Select
                                    defaultValue=""
                                    value={situation}
                                    onChange={(e) =>
                                        setSituation(e.target.value)
                                    }
                                >
                                    <option value="">Todas</option>
                                    <option value="F">Finalizada</option>
                                    <option value="C">Cancelada</option>
                                </Select>
                            </Box>
                        </Stack>
                    </DrawerBody>

                    <DrawerFooter borderTopWidth="1px">
                        <Button
                            variant="outline"
                            mr={3}
                            onClick={onCloseFilter}
                        >
                            Cancelar
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={() => handleFilter()}
                        >
                            Filtrar
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
