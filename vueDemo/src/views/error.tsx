import { Component, Vue, Watch } from 'vue-property-decorator';
import { getErrorCfgByCode } from '@/config/error';

@Component
export default class Error extends Vue {
    protected render() {
        let query = this.$route.query;
        let err = getErrorCfgByCode(query.code);
        return (
            <h2 style={{ textAlign: 'center', marginTop: '20px' }}>{query.msg || (err && err.msg) || '未知错误'}</h2>
        );
    }
}