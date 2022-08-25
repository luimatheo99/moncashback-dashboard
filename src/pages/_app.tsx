import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from 'react-query';

import { AuthProvider } from '../contexts/AuthContext';
import { SidebarDrawerProvider } from '../contexts/SidebarDrawerContext';
import { queryClient } from '../services/queryClient';
import { theme } from '../styles/theme';

function MyApp({ Component, pageProps }) {
    return (
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <ChakraProvider theme={theme}>
                    <SidebarDrawerProvider>
                        <Component {...pageProps} />
                    </SidebarDrawerProvider>
                </ChakraProvider>
            </QueryClientProvider>
        </AuthProvider>
    );
}

export default MyApp;
