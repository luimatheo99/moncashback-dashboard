import moment from 'moment';
import { useQuery } from 'react-query';

import { api } from '../apiClient';

export type Movimentation = {
    id: string;
    earned_value: string;
    pay_value: string;
    amount: string;
    type: string;
    typeDescription: string;
    situation: string;
    situationDescription: string;
    created_at: string;
    diff_minutes: string;
    external_id: string;
    customer: {
        name: string;
        phone: string;
    };
};

export type GetMovimentationsResponse = {
    totalCount: number;
    movimentations: Movimentation[];
};

type Request = {
    page: number;
    start_date: string;
    end_date: string;
    type: string;
    situation: string;
};

export async function getMovimentations({
    page,
    start_date,
    end_date,
    type,
    situation,
}: Request): Promise<GetMovimentationsResponse> {
    const { data } = await api.get('movimentations/grid/byuser', {
        params: {
            page,
            start_date,
            end_date,
            type,
            situation,
        },
    });

    const totalCount = data[1];

    const movimentations = data[0].map((movimentation) => {
        return {
            id: movimentation.id,
            earned_value: new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(Number(movimentation.earned_value)),
            pay_value: new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(Number(movimentation.pay_value)),
            amount: new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(Number(movimentation.amount)),
            type: movimentation.type,
            typeDescription:
                movimentation.type === 'W' ? 'Ganhou MON' : 'Pago com MON',
            situation: movimentation.situation,
            situationDescription:
                movimentation.situation === 'F' ? 'Finalizado' : 'Cancelado',
            external_id: movimentation.external_id,
            created_at: moment(movimentation.created_at)
                .locale('pt-br')
                .format('DD/MM/YYYY HH:mm'),
            diff_minutes: moment(movimentation.created_at)
                .locale('pt-br')
                .diff(moment().locale('pt-br'), 'm'),
            customer: {
                name: movimentation.customer.name,
                phone: movimentation.customer.phone,
            },
        };
    });

    return {
        movimentations,
        totalCount,
    };
}

export function useMovimentations({
    page,
    start_date,
    end_date,
    type,
    situation,
}: Request) {
    return useQuery(
        ['movimentations', page, start_date, end_date, type, situation],
        () =>
            getMovimentations({ page, start_date, end_date, type, situation }),
        {
            staleTime: 1000 * 60 * 10, // 10 minutes
        },
    );
}
