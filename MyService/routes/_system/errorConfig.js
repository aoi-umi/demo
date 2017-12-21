/**
 * Created by bang on 2017-7-28.
 */
//lang ISO 639-1
module.exports = {
    DEV: {
        code: 'DEV',
        desc: {
            'zh': 'dev',
            'en': 'dev',
        }
    },
    CODE_ERROR: {
        code: 'CODE_ERROR',
        desc: {
            'zh': '代码有误',
            'en': 'code error',
        }
    },
    BAD_REQUEST: {
        code: 'BAD_REQUEST',
        status: 400,
        desc: {
            'zh': '错误请求',
            'en': 'bad request',
        }
    },
    NOT_FOUND: {
        code: 'NOT_FOUND',
        status: 404,
        desc: {
            'zh': '无法找到路径',
            'en': 'Not Found',
        }
    },

    TOKEN_WRONG: {
        code: 'TOKEN_WRONG',
        desc: {
            'zh': '密码错误或参数有误',
            'en': 'password wrong or bad request!',
        }
    },
    NO_LOGIN: {
        code: 'NO_LOGIN',
        status: 401,
        desc: {
            'zh': '未登录',
            'en': 'No Login',
        }
    },
    ARGS_ERROR: {
        code: 'ARGS_ERROR',
        desc: {
            'zh': '参数有误',
            'en': 'args error',
        }
    },
    CAN_NOT_BE_EMPTY: {
        code: 'CAN_NOT_BE_EMPTY',
        desc: {
            'zh': '{0}不能为空',
            'en': '{0} can not be empty',
        }
    },
    NO_PERMISSIONS: {
        code: 'NO_PERMISSIONS',
        status: 403,
        desc: {
            'zh': '无权限',
            'en': 'No Permissions',
        }
    },
    ENUM_CHANGED_INVALID: {
        code: 'ENUM_CHANGED_INVALID',
        desc: {
            'zh': '{0}无法变更为{1}',
            'en': '{0} can not change to {1}',
        }
    },
    //数据库
    DB_NO_DATA: {
        code: 'DB_NO_DATA',
        desc: {
            'zh': '查无数据',
            'en': 'No Data',
        }
    },
    //缓存
    CACHE_TIMEOUT: {
        code: 'CACHE_TIMEOUT',
        desc: {
            'zh': '缓存超时',
            'en': 'Cache Timeout',
        }
    },
    CACHE_EXPIRE: {
        code: 'CACHE_EXPIRE',
        desc: {
            'zh': '缓存失效',
            'en': 'Cache Expire',
        }
    }
};