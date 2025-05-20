import type { AxiosRequestConfig } from "axios";
import BaseService from "./BaseService"

export default class OrdersService extends BaseService {
    constructor() {
        super();
        this.url = '/orders';
        this.setupApi(import.meta.env.VITE_API_BASE_URL);
    }

    async getAllOrders(config: AxiosRequestConfig) {
        return await this.get("/", config);
    }

    async getOrderByStatus(status: string, config: {}) {
        return await this.get(`/${status}`, config);
    }

    async createOrder(data: any, config: {}) {
        return await this.post("/", data, config);
    }

    async deleteOrder(id: number, config: {}) {
        return await this.delete(`/${id}`, config);
    }

    async getOrderByNoOrder(noOrder: string, config: {}) {
        return await this.get(`/details/${noOrder}`, config);
    }

    async kepalaTeknisiTakeoverOrder(id: number, config: {}) {
        return await this.put(`/kt/${id}`, {}, config);
    }

    async assignTeknisi(id: number, data: FormData, config: {}) {
        return await this.post(`/kt/assignTeknisi/${id}`, data, config);
    }

    async teknisiStart(id: number, data: FormData, config: {}) {
        return await this.post(`/inProgress/${id}`, data, config);
    }

    async teknisiFinish(id: number, data: FormData, config: {}) {
        return await this.post(`/finish/${id}`, data, config);
    }
}