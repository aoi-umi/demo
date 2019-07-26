import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iview from 'iview';
import { Upload, Modal, Icon, Progress } from '@/components/iview';
import { convClass } from '@/helpers';
import './my-img.less';

const clsPrefix = 'my-img-';

@Component
class MyImg extends Vue {
    @Prop()
    src: string;

    @Prop()
    alt: string;

    $refs: { img: HTMLElement }
    hasBg = true;
    private imgData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjkzM0E4QjFGODk4NzExRThCN0VCRjNDNjMyQjc3REY5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjkzM0E4QjIwODk4NzExRThCN0VCRjNDNjMyQjc3REY5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OTMzQThCMUQ4OTg3MTFFOEI3RUJGM0M2MzJCNzdERjkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OTMzQThCMUU4OTg3MTFFOEI3RUJGM0M2MzJCNzdERjkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5qQIuYAAACsElEQVR42uydzUtUURiHz6iBKWGoUEEfVBAUBWEu+qDBCqLaRwuhRas2tWkZfYC0FXTlIiToD4gggqIiJchFQbsWtavIoCIQ+8Kafi/3DaRkUJiZc8bzPPBjdOYyHu5zzj3vOXMHS5VKJUA6tHAKEAIIQQggBCGAEIQAQhACCAGEIAQQghBACEIAIQgBhABCEAIIQQggBCGAEIQAQuB/2mL94Tcvps7q4ZLSmVDH+K3MKkMbdu8di9GAUqyvI0jIJz10+6/frC2RZdiJWOk/f5aQnqxGiFjhPfKMMpnICCkr4962kJsQ46dyX3mfiJDv3qasJ/X2hObU6G2hyqLsXTJrPAiJzIDySHnteaAcYh0Sh4PK3XllqHFE2a8cVZ4wQhrbSYb+kfEXe+6a0oqQxmGLxf4qr29XehEC2QqxLZVnVV5/qXxESOP4pVwNxSbfQivpy34MQhrIY+WEl73TodhaeagcUyYoe+Mw6aXu2lDsxH7IYQ5pa4I2TtfgPVYp+5QDylZlvT//TnnlI/GpMoOQ+rJRsQ/CTilbqhx3RXmu3FbmfEQipIasVi64jMWuWfZ4jC8IqR223zWq7KTKio+NinvNKqOZRkjJ54Nu70R2SXmr/Jh3zIhyniqrvuxSBpXjXhl1uZwZL4Nt1/dWKHaAz1H21o91vlo/HRb+WLXLsy0UN0mwDqkjh5XryuaQIalN6nZ5upOrjNRGyEnlZoh/w1z2I8Qm6D7lRu4yUhBiZesmHxkdAaIKqXiGlR2oiC/E7uu1PacyGtKtshDCKUAIIAQhgBCELOfO0JLjSZlLWEi0tsXcXLwYiq9Fp7Zl8jUUd99HocR/aeNaCQhBCCAEIYAQhABCEAIIAYQgBBCCEEAIQgAhCAGEAEIQAghBCCAEIYAQhABCACHJ80eAAQBZj2GdU095IgAAAABJRU5ErkJggg==';

    mounted() {
        this.$refs.img.addEventListener('load', this.clearBg);
    }

    beforeDestroy() {
        this.$refs.img.removeEventListener('load', this.clearBg);
    }

    clearBg() {
        this.hasBg = false;
    }

    handleError(e) {
        const target = e.target;
        target.src = this.imgData;
    }

    render() {
        let cls = [clsPrefix + 'image'];
        if (this.hasBg)
            cls.push('has-bg');
        return (
            <img ref="img" class={cls} on-error={this.handleError} src={this.src} alt={this.alt} />
        );
    }
}

const MyImgView = convClass<MyImg>(MyImg);
export default MyImgView;