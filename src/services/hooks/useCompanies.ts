import { api } from '../apiClient';

type Company = {
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

type GetCompaniesResponse = {
    company: Company;
};

export async function getCompanies(): Promise<GetCompaniesResponse> {
    const { data } = await api.get(`companies/byuser`);

    return {
        company: {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            facebook_url: data.facebook_url,
            instagram_url: data.instagram_url,
            site_url: data.site_url,
            category_id: data.category_id,
            state_id: data.state_id,
            city_id: data.city_id,
            district: data.district,
            street: data.street,
            number: data.number,
            maximum_redeption_limit_perc: data.maximum_redeption_limit_perc,
        },
    };
}
