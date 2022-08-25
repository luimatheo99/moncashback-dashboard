import { Stack } from '@chakra-ui/react';
import { FaHandHoldingUsd } from 'react-icons/fa';
import {
    RiDashboardLine,
    RiSettings2Line,
    RiExchangeDollarLine,
} from 'react-icons/ri';

import { NavLink } from './NavLink';
import { NavSection } from './NavSection';

export function SidebarNav() {
    return (
        <Stack spacing="12" align="flex-start">
            <NavSection title="GERAL">
                <NavLink icon={RiDashboardLine} href="/dashboard">
                    Dashboard
                </NavLink>
                <NavLink icon={FaHandHoldingUsd} href="/cashbacks">
                    Cashbacks
                </NavLink>
                <NavLink icon={RiExchangeDollarLine} href="/movimentations">
                    Movimentações
                </NavLink>
                <NavLink icon={RiSettings2Line} href="/settings">
                    Configurações
                </NavLink>
            </NavSection>
        </Stack>
    );
}
