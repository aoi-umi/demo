export default {
    api: {
        test: {
            defaultArgs: {
                host: 'http://localhost:3010',
            },
            method: {
                bookmarkQuery: {
                    url: '/bookmark/query',
                    method: 'POST',
                    isUseDefault: false,
                    args: {
                        host: 'http://localhost:6001',
                    }
                },
            }
        }
    }
}