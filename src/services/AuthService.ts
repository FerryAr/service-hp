import type { AxiosRequestConfig } from "axios";
import BaseService from "./BaseService";

export default class AuthService extends BaseService {
    constructor() {
        super();
        this.url = '/auth';
        this.setupApi(import.meta.env.VITE_API_BASE_URL);
    }

    async login(payload: any) {
        return await this.post("/login", payload, {});
    }

    async refresh(config: AxiosRequestConfig) {
        return await this.get("/refresh", config);
    }
}