import axios from "axios";
import BaseService from "@/services/BaseService";
import { useGlobalStateStore } from "@/stores/global";

export default class OrderService extends BaseService {

    private globalStateStore;

    constructor() {
        super();
        this.url = '/';
        this.setupAPI(axios.defaults.baseURL);
        this.globalStateStore = useGlobalStateStore();
    }

    async getOrder(orderId) {
        this.globalStateStore.loadingElements['get-order'] = true;
        await this.get("/sanctum/csrf-cookie");
        return this.get(`/api/orders/${orderId}`).finally(() => {
            this.globalStateStore.loadingElements['get-order'] = false;
        });
    }

    async createOrder(payload) {
        this.globalStateStore.loadingElements['create-order'] = true;
        await this.get("/sanctum/csrf-cookie");
        return this.post("/api/orders", payload).finally(() => {
            this.globalStateStore.loadingElements['create-order'] = false;
        });
    }

    async updateOrder(orderId, payload) {
        this.globalStateStore.loadingElements['update-order'] = true;
        await this.get("/sanctum/csrf-cookie");
        return this.put(`/api/orders/${orderId}`, payload).finally(() => {
            this.globalStateStore.loadingElements['update-order'] = false;
        });
    }

    async deleteOrder(orderId) {
        this.globalStateStore.loadingElements['delete-order'] = true;
        await this.get("/sanctum/csrf-cookie");
        return this.delete(`/api/orders/${orderId}`).finally(() => {
            this.globalStateStore.loadingElements['delete-order'] = false;
        });
    }

    async listOrders() {
        this.globalStateStore.loadingElements['list-orders'] = true;
        return this.get("/api/orders").finally(() => {
            this.globalStateStore.loadingElements['list-orders'] = false;
        });
    }
}