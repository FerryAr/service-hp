import BaseService from "./BaseService";

export default class UsersService extends BaseService {
    constructor() {
        super();
        this.url = '/users';
        this.setupApi(import.meta.env.VITE_API_BASE_URL);
    }

    async getCurrentUser(config: {}) {
        return await this.get("/", config);
    }

    async getTeknisi(config: {}) {
        return await this.get("/teknisi", config);
    }
}