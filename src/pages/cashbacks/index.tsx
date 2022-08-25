/* eslint-disable no-nested-ternary */
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
    Link,
    IconButton,
    HStack,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    theme,
    useToast,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { RiAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri';
import { useMutation } from 'react-query';

import { Header } from '../../components/Header';
import { Pagination } from '../../components/Pagination';
import { Sidebar } from '../../components/Sidebar';
import { api } from '../../services/apiClient';
import { useCashbacks } from '../../services/hooks/useCashbacks';
import { queryClient } from '../../services/queryClient';

export default function CashbackList() {
    const [cashbackId, setCashbackId] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading, error, isFetching } = useCashbacks(page);

    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const onCloseDelete = () => setIsOpenDelete(false);
    const cancelRefDelete = useRef();

    const toast = useToast();
    const router = useRouter();

    const isWideVersion = useBreakpointValue({
        base: false,
        lg: true,
    });

    async function handleOpenDelete(cashbackId: string) {
        setCashbackId(cashbackId);
        setIsOpenDelete(true);
    }

    const deleteCashbackById = useMutation(
        async () => {
            const response = await api.delete(`/cashbacks/${cashbackId}`);

            if (response.status !== 204) {
                toast({
                    title: `Erro ao excluir o cashback!`,
                    status: 'error',
                    isClosable: true,
                });
            }
        },
        {
            onError: () => {
                toast({
                    title: `Erro ao excluir o cashback!`,
                    status: 'error',
                    isClosable: true,
                });
            },
            onSuccess: () => {
                toast({
                    title: `Cashback excluido com sucesso!`,
                    status: 'success',
                    isClosable: true,
                });

                queryClient.invalidateQueries('cashbacks');
                router.push('/cashbacks');
            },
        },
    );

    async function handleDeleteCashbackById() {
        try {
            await deleteCashbackById.mutateAsync();
            setCashbackId('');
            setIsOpenDelete(false);
        } catch (err) {
            console.error(err);
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
                                Cashbacks
                                {!isLoading && isFetching && (
                                    <Spinner
                                        size="sm"
                                        color="gray.500"
                                        ml="4"
                                    />
                                )}
                            </Heading>

                            <NextLink href="/cashbacks/create" passHref>
                                <Button
                                    as="a"
                                    size="sm"
                                    fontSize="sm"
                                    colorScheme="green"
                                    leftIcon={
                                        <Icon as={RiAddLine} fontSize="20" />
                                    }
                                >
                                    Criar novo
                                </Button>
                            </NextLink>
                        </Flex>

                        {isLoading ? (
                            <Flex justify="center">
                                {' '}
                                <Spinner />{' '}
                            </Flex>
                        ) : error ? (
                            <Flex justify="center">
                                <Text>Falha ao obter dados dos cashbacks.</Text>
                            </Flex>
                        ) : (
                            <>
                                <Table colorScheme="whiteAlpha">
                                    <Thead>
                                        <Tr>
                                            <Th
                                                px={['4', '4', '6']}
                                                color="green.300"
                                                width="8"
                                            />
                                            <Th>Nome</Th>
                                            {isWideVersion && (
                                                <Th>Porcentagem</Th>
                                            )}
                                            {isWideVersion && (
                                                <Th>Expira em</Th>
                                            )}
                                            <Th width="8"></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {data.cashbacks.map((cashback) => {
                                            return (
                                                <Tr key={cashback.id}>
                                                    <Td px={['4', '4', '6']}>
                                                        <HStack spacing="2">
                                                            <Link
                                                                color="purple.400"
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/cashbacks/${cashback.id}`,
                                                                    )
                                                                }
                                                            >
                                                                <IconButton
                                                                    aria-label="Edit"
                                                                    // as="a"
                                                                    size="sm"
                                                                    fontSize="sm"
                                                                    colorScheme="blue"
                                                                    icon={
                                                                        <Icon
                                                                            as={
                                                                                RiEditLine
                                                                            }
                                                                            fontSize="20"
                                                                        />
                                                                    }
                                                                />
                                                            </Link>
                                                            <IconButton
                                                                aria-label="Edit"
                                                                // as="a"
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
                                                                    handleOpenDelete(
                                                                        cashback.id,
                                                                    )
                                                                }
                                                            />
                                                        </HStack>
                                                    </Td>
                                                    <Td>
                                                        <Text fontWeight="bold">
                                                            {cashback.name}
                                                        </Text>
                                                    </Td>
                                                    {isWideVersion && (
                                                        <Td>
                                                            {
                                                                cashback.percentage
                                                            }
                                                            %
                                                        </Td>
                                                    )}
                                                    {isWideVersion && (
                                                        <Td>
                                                            {
                                                                cashback.expires_date
                                                            }
                                                        </Td>
                                                    )}
                                                </Tr>
                                            );
                                        })}
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
                isOpen={isOpenDelete}
                leastDestructiveRef={cancelRefDelete}
                onClose={onCloseDelete}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg={theme.colors.gray[50]}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Excluir cashback
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Tem certeza? Você não pode desfazer esta ação
                            depois.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button
                                ref={cancelRefDelete}
                                onClick={onCloseDelete}
                                bg={theme.colors.gray[300]}
                                _hover={{ opacity: 0.85 }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleDeleteCashbackById}
                                ml={3}
                            >
                                Deletar
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}
