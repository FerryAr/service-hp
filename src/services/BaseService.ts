import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";


export default abstract class BaseService {
    api!: AxiosInstance;
    url = '';

    setupApi(baseURL: string) {
        this.api = axios.create({
            baseURL : baseURL + this.url,
            withCredentials: false
        });

        this.api.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                return Promise.reject(error);
            }
        )
    }

    protected post(url: string, data: any, config: {}) {
        if(!config) {
            config = {};
        }

        if(data instanceof FormData) {
            config = this.setHeaders(config);
        }

        return this.api.post(url, data, config);
    }

    protected get(url: string, config: {}) {
        return this.api.get(url, config);
    }

    protected put(url: string, data: any, config: {}) {
        if(!config) {
            config = {};
        }

        if(data instanceof FormData) {
            config = this.setHeaders(config);
            data.append('_method', 'PUT');
        }

        return this.api.put(url, data, config);
    }

    protected patch(url: string, data: any, config: {}) {
        if(!config) {
            config = {};
        }

        if(data instanceof FormData) {
            config = this.setHeaders(config);
            data.append('_method', 'PATCH');
        }

        return this.api.patch(url, data, config);
    }

    protected delete(url: string, config: {}) {
        return this.api.delete(url, config);
    }

    protected setHeaders(config: AxiosRequestConfig) {
        if(!config.headers) {
            config.headers = {};
        }

        config.headers['Content-Type'] = 'multipart/form-data';

        return config;
    }
}