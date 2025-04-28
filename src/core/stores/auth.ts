import { defineStore } from "pinia";
import { ref } from "vue";
import AuthService from "../../services/AuthService";
import UsersService from "../../services/UsersService";
import { type User, Role } from "../types/user";
import { AxiosError } from "axios";
import router from "../../router/router";

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false);
    const jwtToken = ref('');
    const refreshToken = ref('');
    const user = ref({} as User);

    async function login(payload: {}, isRemember: boolean) {
        const authService = new AuthService();
        try {
            const response = await authService.login(payload);
            setAuthenticated(true);
            setJwtToken(response.data.access_token);
            if(isRemember) {
                setRefreshToken(response.data.refresh_token);
            }
            await getCurrentUser();
            window.location.reload();
        } catch (error) {
            await Promise.reject(error);
        }
    }

    async function refresh() {
        if(refreshToken.value === '') {
            await logout();
            throw new Error('Refresh token is empty');
        }

        const authService = new AuthService();

        try {
            const response = await authService.refresh({
                headers: {
                    Authorization: `Bearer ${refreshToken.value}`
                }
            });
            setJwtToken(response.data.access_token);
            setRefreshToken(response.data.refresh_token);
            await getCurrentUser();
            return;
        } catch (error) {
            if(error instanceof AxiosError) {
                const status = error.response?.status;
                if(status !== undefined && [401, 418].includes(status)) {
                    await logout();

                    // throw the error
                    throw error;
                }
            }

            throw error;
        }
    }

    async function getCurrentUser() {
        const usersService = new UsersService();

        try {
            const response = await usersService.getCurrentUser({
                headers: {
                    Authorization: `Bearer ${jwtToken.value}`
                }
            });
            setUser(response.data);
        } catch (error) {
            throw error;
        }
    }

    function setAuthenticated(value: boolean) {
        isAuthenticated.value = value;
    }

    function setJwtToken(value: string) {
        jwtToken.value = value;
    }

    function setRefreshToken(value: string) {
        refreshToken.value = value;
    }

    async function logout() {
        setAuthenticated(false);
        setJwtToken('');
        setRefreshToken('');
        user.value = {} as User;

        // Redirect to login page without history
        await router.push({ name: 'login' });
    }

    function setUser(value: any) {
        user.value = value;
    }

    return {
        isAuthenticated,
        jwtToken,
        refreshToken,
        user,
        login,
        refresh,
        setAuthenticated,
        setJwtToken,
        setRefreshToken,
        logout,
        setUser
    };
}, {
    persist: true
});