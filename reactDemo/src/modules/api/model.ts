import { request } from '../../helpers/util';
export class ApiModel {
    private host: string;
    constructor(host: string) {
        this.host = host;
    }

    protected async request(url: string, method?: string) {
        return request({
            url: this.host + url,
            method: method,
        });
    }
}