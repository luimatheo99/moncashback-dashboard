import Router from 'next/router';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { createContext, ReactNode, useEffect, useState } from 'react';

import { api } from '../services/apiClient';

type User = {
    email: string;
    name: string;
    company_id: string;
};

type SignInCredentials = {
    email: string;
    password: string;
};

type AuthContextData = {
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signOut: () => void;
    isAuthenticated: boolean;
    user: User;
};

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut() {
    destroyCookie(undefined, 'moncashback.token');
    destroyCookie(undefined, 'moncashback.refreshToken');

    authChannel.postMessage('signOut');

    Router.push('/');
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>(null);
    const isAuthenticated = !!user;

    useEffect(() => {
        authChannel = new BroadcastChannel('auth');

        authChannel.onmessage = (message) => {
            switch (message.data) {
                case 'signOut':
                    signOut();
                    break;
                default:
                    break;
            }
        };
    }, []);

    useEffect(() => {
        const { 'moncashback.token': token } = parseCookies();

        if (token) {
            api.get('/users/me')
                .then((response) => {
                    const { email, name, company_id } = response.data;

                    setUser({ email, name, company_id });
                })
                .catch(() => {
                    if (process.browser) {
                        signOut();
                    }
                });
        }
    }, []);

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await api.post('sessions-user', {
                email,
                password,
            });

            const { token, refresh_token, user } = response.data;

            setCookie(undefined, 'moncashback.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            setCookie(undefined, 'moncashback.refreshToken', refresh_token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            setUser({
                name: user.name,
                email,
                company_id: user.company_id,
            });

            api.defaults.headers.Authorization = `Bearer ${token}`;

            Router.push('/dashboard');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <AuthContext.Provider
            value={{ signIn, signOut, isAuthenticated, user }}
        >
            {children}
        </AuthContext.Provider>
    );
}
