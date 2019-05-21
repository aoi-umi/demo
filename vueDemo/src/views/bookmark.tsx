import { Component, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Bookmark extends Vue {
    protected render() {
        return (
            <div>
                bookmark
            </div>
        );
    }
}