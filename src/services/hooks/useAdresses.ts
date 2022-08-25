import { api } from '../apiClient';

type State = {
    id: string;
    name: string;
    uf: string;
};

type GetStateResponse = {
    states: State[];
};

type City = {
    id: string;
    name: string;
    state_id: string;
};

type GetCityResponse = {
    cities: City[];
};

export async function getStates(): Promise<GetStateResponse> {
    const { data } = await api.get(`adresses/states`);

    return {
        states: data,
    };
}

export async function getCities(state_id: string): Promise<GetCityResponse> {
    const { data } = await api.get(`adresses/cities/state=${state_id}`);

    return {
        cities: data,
    };
}
