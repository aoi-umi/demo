export default {
    api: {
        test: {
            defaultArgs: {
                host: 'http://localhost:3010',
            },
            method: {
                bookmarkQuery: {
                    url: '/bookmark/query',
                    method: 'get',
                    isUseDefault: false,
                    args: {
                        host: 'http://localhost:8000',
                    }
                },
            }
        }
    }
}