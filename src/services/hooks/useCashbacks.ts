import moment from 'moment';
import { useQuery, UseQueryOptions } from 'react-query';

import { api } from '../apiClient';

type Cashback = {
    id: string;
    name: string;
    expires_date: string;
    percentage: string;
    image: string;
};

type GetCashbacksResponse = {
    totalCount: number;
    cashbacks: Cashback[];
};

export async function getCashbacks(
    page: number,
): Promise<GetCashbacksResponse> {
    const { data } = await api.get('cashbacks/grid/byuser', {
        params: {
            page,
        },
    });

    const totalCount = data[1];

    const cashbacks = data[0].map((cashback) => {
        return {
            id: cashback.id,
            name: cashback.name,
            expires_date: moment(cashback.expires_date)
                .locale('pt-br')
                .utc()
                .format('DD/MM/YYYY'),
            percentage: cashback.percentage,
            image: cashback.image,
        };
    });

    return {
        cashbacks,
        totalCount,
    };
}

export async function getCashbackById(cashbackId: string): Promise<Cashback> {
    const { data } = await api.get(`cashbacks/${cashbackId}`);

    const cashback = {
        id: data.id,
        name: data.name,
        expires_date: moment(data.expires_date)
            .locale('pt-br')
            .utc()
            .format('DD/MM/YYYY'),
        percentage: data.percentage,
        image: data.image,
    };

    return cashback;
}

export function useCashbacks(page: number) {
    return useQuery(['cashbacks', page], () => getCashbacks(page), {
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}
