import {
    GetServerSideProps,
    GetServerSidePropsContext,
    GetServerSidePropsResult,
} from 'next';
import { destroyCookie, parseCookies } from 'nookies';

import { AuthTokenError } from '../services/errors/AuthTokenError';

type withSSRAuthOptions = {
    permissions?: string[];
    roles?: string[];
};

export function withSSRAuth<P>(
    fn: GetServerSideProps<P>,
    options?: withSSRAuthOptions,
): GetServerSideProps {
    return async (
        ctx: GetServerSidePropsContext,
    ): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(ctx);
        const token = cookies['moncashback.token'];

        if (!token) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }

        // if (options) {
        //     const user = decode<{ permissions: string[], roles: string[] }>(token)
        //     const { permissions, roles } = options

        //     const userHasValidPermissions = validateUserPermissions({
        //         user,
        //         permissions,
        //         roles
        //     })

        //     if (!userHasValidPermissions) {
        //         return {
        //             redirect: {
        //                 destination: '/dashboard',
        //                 permanent: false
        //             }
        //         }
        //     }
        // }

        try {
            return await fn(ctx);
        } catch (err) {
            if (err instanceof AuthTokenError) {
                destroyCookie(ctx, 'moncashback.token');
                destroyCookie(ctx, 'moncashback.refreshToken');

                return {
                    redirect: {
                        destination: '/',
                        permanent: false,
                    },
                };
            }
        }
    };
}
