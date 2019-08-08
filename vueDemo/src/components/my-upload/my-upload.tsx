import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iview from 'iview';
import { Upload, Modal, Icon, Progress, Button } from '@/components/iview';
import { convClass } from '@/helpers';
import axios, { AxiosRequestConfig } from 'axios';
import { VueCropper } from 'vue-cropper';
import { MyImg } from '../my-img';
import { Utils } from '../utils';
import * as style from '../style';
import './my-upload.less';
import { MyImgViewer } from '../my-img-viewer';

const clsPrefix = 'my-upload-';

type FileType = {
    name?: string;
    url?: string;
    percentage?: number;
    status?: string;
    showProgress?: boolean;

    file?: File;
    data?: string;
    originData?: string;
    willUpload?: boolean;
    uploadRes?: any;
};

type CropperOption = {
    img?: any;
    autoCrop?: boolean;
    autoCropWidth?: number;
    autoCropHeight?: number;
    fixed?: boolean;
    fixedNumber?: [number, number]
    outputType?: 'jpeg' | 'png' | 'webp'
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
    value: FileType[];
    fileList: FileType[] = [];

    @Watch('value')
    private watchValue(newVal: any[]) {
        if (newVal) {
            this.fileList = this.maxCount > 0 && newVal.length > this.maxCount ?
                newVal.slice(0, this.maxCount) :
                newVal;
        } else {
            this.fileList = [];
        }
    }

    @Prop()
    successHandler: (res: any, file: FileType) => any;

    @Prop()
    cropperOptions?: CropperOption;

    $refs: { upload: iview.Upload & { fileList: FileType[] }, cropper: any };

    defaultList = [];
    visible = false;

    private showUrl = '';
    private uploadHeaders = {};
    private cropperShow = false;
    private editIndex = -1;
    private file: File;
    private cropper: CropperOption = {
        img: '',
        autoCrop: true,
        autoCropWidth: 512,
        autoCropHeight: 288,
        fixed: true,
        fixedNumber: [16, 9],
        outputType: 'png',
    };
    private getFileCount() {
        return this.fileList.length;
    }

    private getHideUpload() {
        return this.maxCount > 0 && this.getFileCount() >= this.maxCount;
    }

    protected created() {
        this.watchValue(this.value);
        if (this.cropperOptions) {
            this.cropper = {
                ...this.cropper,
                ...this.cropperOptions,
            };
        }
    }

    protected mounted() {
    }

    private handleEdit(file: FileType) {
        this.editIndex = this.fileList.indexOf(file);
        this.file = file.file;
        this.cropperShow = true;
        this.cropper.img = file.originData;
    }

    private handleView(file: FileType) {
        this.showUrl = file.url || file.data;
        this.visible = true;
    }

    private handleRemove(file: FileType) {
        this.fileList.splice(this.fileList.indexOf(file), 1);
    }

    async upload() {
        let errorList = [];
        let headers = this.headers && this.headers();
        for (let idx = 0; idx < this.fileList.length; idx++) {
            let file = this.fileList[idx];
            if (file.willUpload) {
                try {
                    let formData = new FormData();
                    let uploadFile = Utils.base64ToFile(file.data, file.file.name);
                    formData.append('file', uploadFile);
                    let rs = await axios.request({
                        method: 'post',
                        url: this.uploadUrl,
                        data: formData,
                        headers
                    });
                    file.uploadRes = this.successHandler && this.successHandler(rs.data, file);
                    file.willUpload = false;
                } catch (e) {
                    errorList.push(`[图${idx + 1}]:${e.message}`);
                }
            }
        }
        return errorList;
    }

    private handleSuccess(res, file: FileType) {
        if (this.successHandler) {
            try {
                this.successHandler(res, file);
            } catch (e) {
                this.handleRemove(file);
                this.handleError(e);
            }
        }
    }

    private handleError(error) {
        this.$Notice.error({
            title: '上传出错了',
            desc: error
        });
    }

    private handleFormatError(file: FileType) {
        this.$Notice.warning({
            title: '文件格式不正确',
            desc: `文件 "${file.name}" 的格式不正确, 只能上传${this.format.join(',')}格式的文件`
        });
    }

    private handleMaxSize(file: FileType) {
        this.$Notice.warning({
            title: '文件大小超出限制',
            desc: `文件 "${file.name}" 大小超出限制`
        });
    }

    private handleBeforeUpload(file) {
        this.file = file;
        let reader = new FileReader()
        reader.readAsDataURL(file);
        reader.onload = e => {
            this.cropper.img = (e.target as any).result;
            this.cropperShow = true;
        };
        return false;
    }

    private pushImg(data, originData?) {
        let file = {
            data: data,
            originData: originData || data,
            status: 'finished',
            file: this.file,
            willUpload: true,
        };
        if (this.editIndex >= 0) {
            this.fileList.splice(this.editIndex, 1, file);
        } else
            this.fileList.push(file);
    }

    protected render() {
        let width = this.width + 'px',
            height = this.height + 'px';
        let uploadCls = [clsPrefix + 'upload'];
        if (this.getHideUpload())
            uploadCls.push('hidden');
        return (
            <div>
                {this.fileList.map(item => {
                    return (
                        <div class={clsPrefix + 'list'} style={{ width, height, lineHeight: height }}>
                            <div style={{
                                width: 'inherit',
                                height: 'inherit',
                            }}>
                                <MyImg style={{
                                    width: 'inherit',
                                    height: 'inherit',
                                }} src={item.url || item.data} />
                                <div class={clsPrefix + 'list-cover'}>
                                    {item.originData && <Icon type="md-create" nativeOn-click={() => { this.handleEdit(item); }} />}
                                    <Icon type="md-eye" nativeOn-click={() => { this.handleView(item); }} />
                                    <Icon type="md-trash" nativeOn-click={() => { this.handleRemove(item); }} />
                                </div>
                            </div>
                        </div>
                    )
                })}

                <Upload
                    class={uploadCls}
                    ref="upload"
                    show-upload-list={false}
                    // default-file-list={this.defaultList as any}
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
                    multiple={false}
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
                <div class={[style.cls.mask, this.cropperShow ? '' : 'hidden']}>
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ width: '1024px', height: '576px', display: 'inline-block' }}>
                            <VueCropper
                                ref="cropper"
                                props={this.cropper}
                            />
                        </div>
                        <div>
                            <Button on-click={() => {
                                this.cropperShow = false;
                            }}>取消</Button>
                            <Button type="primary" on-click={() => {
                                this.$refs.cropper.getCropData((data) => {
                                    this.pushImg(data, this.cropper.img);
                                });
                                this.cropperShow = false;
                            }}>截取</Button>
                            <Button on-click={() => {
                                this.pushImg(this.cropper.img);
                                this.cropperShow = false;
                            }}>原图</Button>
                        </div>
                    </div>
                </div>
                {this.visible && <MyImgViewer src={this.showUrl} />}
            </div>
        );
    }
}

const MyUploadView = convClass<MyUpload>(MyUpload);
export default MyUploadView;
export interface IMyUpload extends MyUpload { }