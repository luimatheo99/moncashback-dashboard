import { Flex, Text, Box, Icon, HStack } from '@chakra-ui/react';
import { useContext } from 'react';
import { RiLogoutBoxLine } from 'react-icons/ri';

import { AuthContext } from '../../contexts/AuthContext';

interface IProfileProps {
    showProfileData: boolean;
}

export function Profile({ showProfileData = true }: IProfileProps) {
    const { user, signOut } = useContext(AuthContext);

    return (
        <Flex alignItems="center">
            {showProfileData && (
                <Box mr="4" textAlign="right">
                    <Text>{user?.name}</Text>
                    <Text color="gray.300" fontSize="small">
                        {user?.email}
                    </Text>
                </Box>
            )}

            <HStack color="gray.700" borderLeftWidth={1} borderColor="gray.700">
                <Icon
                    ml="4"
                    as={RiLogoutBoxLine}
                    onClick={signOut}
                    fontSize="20"
                />
            </HStack>

            {/* <Avatar size="md" name="Lui Matheo" src="https://scontent.fjjg4-1.fna.fbcdn.net/v/t1.6435-1/p200x200/92090717_1684433615044161_204194169864847360_n.jpg?_nc_cat=104&ccb=1-3&_nc_sid=7206a8&_nc_ohc=5qPaluhxqQwAX-VBSaH&_nc_ht=scontent.fjjg4-1.fna&tp=6&oh=35fa05e2848f42c914b8e3002423737d&oe=60E8E11C" /> */}
        </Flex>
    );
}
