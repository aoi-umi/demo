type ErrConfigType = {
    code: string;
    msg: string;
};
export const errConfig = {
    NO_LOGIN: {
        code: 'NO_LOGIN',
        status: 401,
    },
    NOT_FOUND: {
        code: 'NOT_FOUND',
        msg: '页面走丢了'
    }
};

export function getErrorCfgByCode(code: any) {
    if (!code)
        return;
    for (let key in errConfig) {
        let cfg: ErrConfigType = errConfig[key];
        if (cfg.code === code)
            return cfg;
    }
}