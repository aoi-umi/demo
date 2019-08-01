import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iview from 'iview';
import { Upload, Modal, Icon, Progress } from '@/components/iview';
import { convClass } from '@/helpers';
import { VueCropper } from 'vue-cropper';
import { MyImg } from '../my-img';
import './my-upload.less';

const clsPrefix = 'my-upload-';

type FileType = {
    name?: string;
    url?: string;
    percentage?: number;
    status?: string;
    showProgress?: boolean;
};

@Component({
    VueCropper
})
class MyUpload extends Vue {
    @Prop()
    uploadUrl: string;

    @Prop()
    format?: string[];

    @Prop({
        default: 2048
    })
    maxSize?: number;

    @Prop({
        default: 1
    })
    maxCount?: number;

    @Prop({
        default: 60
    })
    width?: number;

    @Prop({
        default: 60
    })
    height?: number;

    @Prop()
    headers?: () => any;

    @Prop({
        default: () => []
    })
    defaultFileList: { name?: string; url?: string }[];

    @Prop()
    successHandler: (res: any, file: FileType) => any;

    $refs: { upload: iview.Upload & { fileList: FileType[] }, cropper: any };

    defaultList = [];
    visible = false;
    uploadList: FileType[] = [];
    private file;
    private showUrl = '';
    private uploadHeaders = {};
    private cropper = {
        show: false,
        img: '',
        autoCropWidth: 240,
        autoCropHeight: 160
    };
    getFileCount() {
        let upload = this.$refs.upload;
        return upload ? upload.fileList.length : 0;
    }

    getHideUpload() {
        return this.maxCount > 0 && this.getFileCount() >= this.maxCount;
    }

    created() {
        if (this.defaultFileList) {
            this.defaultList = this.maxCount > 0 && this.defaultFileList.length > this.maxCount ?
                this.defaultFileList.slice(0, this.maxCount) :
                this.defaultFileList;
        }
    }

    mounted() {
        this.uploadList = this.$refs.upload.fileList;
    }

    handleView(file: FileType) {
        this.showUrl = file.url;
        this.visible = true;
    }

    handleRemove(file: FileType) {
        const fileList = this.$refs.upload.fileList;
        this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
    }

    handleSuccess(res, file: FileType) {
        if (this.successHandler) {
            try {
                this.successHandler(res, file);
            } catch (e) {
                this.handleRemove(file);
                this.handleError(e);
            }
        }
    }

    handleError(error) {
        this.$Notice.error({
            title: '上传出错了',
            desc: error
        });
    }

    handleFormatError(file: FileType) {
        this.$Notice.warning({
            title: '文件格式不正确',
            desc: `文件 "${file.name}" 的格式不正确, 只能上传${this.format.join(',')}格式的文件`
        });
    }

    handleMaxSize(file: FileType) {
        this.$Notice.warning({
            title: '文件大小超出限制',
            desc: `文件 "${file.name}" 大小超出限制`
        });
    }

    handleBeforeUpload(file) {
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = e => {
            this.cropper.img = (e.target as any).result;
            this.cropper.show = true;
        }
        this.file = file;
        return false
        return true;
    }

    render() {
        let width = this.width + 'px',
            height = this.height + 'px';
        let uploadCls = [clsPrefix + 'upload'];
        if (this.getHideUpload())
            uploadCls.push('hidden');
        return (
            <div>
                {this.uploadList.map(item => {
                    return (
                        <div class={clsPrefix + 'list'} style={{ width, height, lineHeight: height }}>
                            {item.status === 'finished' ? (
                                <div style={{
                                    width: 'inherit',
                                    height: 'inherit',
                                }}>
                                    <MyImg style={{
                                        width: 'inherit',
                                        height: 'inherit',
                                    }} src={item.url} />
                                    <div class={clsPrefix + 'list-cover'}>
                                        <Icon type="ios-eye-outline" nativeOn-click={() => { this.handleView(item); }} />
                                        <Icon type="ios-trash-outline" nativeOn-click={() => { this.handleRemove(item); }} />
                                    </div>
                                </div>
                            ) : (
                                    <div>
                                        {item.showProgress && <Progress percent={item.percentage} hide-info />}
                                    </div>
                                )
                            }
                        </div>
                    )
                })}

                <Upload
                    class={uploadCls}
                    ref="upload"
                    show-upload-list={false}
                    default-file-list={this.defaultList as any}
                    format={this.format}
                    max-size={this.maxSize}
                    props={{
                        onSuccess: this.handleSuccess,
                        onFormatError: this.handleFormatError,
                        onExceededSize: this.handleMaxSize,
                        onError: this.handleError
                    }}
                    before-upload={this.handleBeforeUpload}
                    headers={this.uploadHeaders}
                    multiple
                    type="drag"
                    action={this.uploadUrl}
                    style={{ width }}>
                    <div style={{ width, height, lineHeight: height }} on-click={() => {
                        if (this.headers)
                            this.uploadHeaders = this.headers();
                    }}>
                        <Icon type="ios-camera" size="20"></Icon>
                    </div>
                </Upload>
                <Modal title="裁剪" v-model={this.cropper.show} >
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ width: '480px', height: '300px', display: 'inline-block' }}>
                            <VueCropper
                                ref="cropper"
                                img={this.cropper.img}
                                autoCrop={true}
                                autoCropWidth={this.cropper.autoCropWidth}
                                autoCropHeight={this.cropper.autoCropHeight}
                            ></VueCropper>
                        </div>
                    </div>
                </Modal>
                <Modal title="查看图片" v-model={this.visible}>
                    <img src={this.showUrl} style={{ width: '100%' }} />
                </Modal>
            </div>
        );
    }
}

const MyUploadView = convClass<MyUpload>(MyUpload);
export default MyUploadView;