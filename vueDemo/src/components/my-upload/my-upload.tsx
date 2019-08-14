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
import { MyImgViewer, IMyImgViewer } from '../my-img-viewer';

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

    @Prop({
        default: () => []
    })
    format?: string[];

    @Prop({
        default: 1024 * 5
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
        default: 'square'
    })
    shape?: 'circle' | 'square';

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

    $refs: { upload: iview.Upload & { fileList: FileType[] }, cropper: any, imgViewer: IMyImgViewer };

    defaultList = [];

    private showUrl = '';
    private uploadHeaders = {};
    private cropperShow = false;
    private editIndex = -1;
    private selectedIndex = -1;
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

    private handleSelectFile(file: FileType) {
        this.$refs.upload['handleClick']();
        this.selectedIndex = this.fileList.indexOf(file);
    }

    private handleView(file: FileType) {
        this.showUrl = file.url || file.data;
        this.$refs.imgViewer.show();
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

    private checkFormat(file: File) {
        // check format
        if (this.format.length) {
            const _file_format = file.name.split('.').pop().toLocaleLowerCase();
            const checked = this.format.some(item => item.toLocaleLowerCase() === _file_format);
            if (!checked) {
                this.handleFormatError(file, this.fileList);
                return false;
            }
        }
        return true;
    }

    private handleFormatError(file: File, fileList: FileType[]) {
        this.$Notice.warning({
            title: '文件格式不正确',
            desc: `文件 "${file.name}" 的格式不正确, 只能上传${this.format.join(',')}格式的文件`
        });
    }

    private checkSize(file: File, checkData?: string) {
        let size = file.size;
        if (checkData) {
            checkData = checkData.split(',')[1];
            checkData = checkData.split('=')[0];
            let strLength = checkData.length;
            size = parseInt((strLength - (strLength / 8) * 2) as any);
        }
        // check maxSize
        if (this.maxSize) {
            if (size > this.maxSize * 1024) {
                this.handleMaxSize(file, this.fileList);
                return false;
            }
        }
        return true;
    }

    private handleMaxSize(file: File, fileList: FileType[]) {
        this.$Notice.warning({
            title: '文件大小超出限制',
            desc: `文件 "${file.name}" 大小超出限制(${(this.maxSize / 1024).toFixed(2)}M)`
        });
    }

    private handleBeforeUpload(file: File) {
        this.file = file;
        let rs = this.checkFormat(file);
        if (!rs)
            return false;

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
        let rs = this.checkSize(this.file, data);
        if (!rs)
            return false;
        if (this.editIndex >= 0) {
            this.fileList.splice(this.editIndex, 1, file);
        } else if (this.selectedIndex >= 0) {
            this.fileList.splice(this.selectedIndex, 1, file);
        } else
            this.fileList.push(file);

        this.cropperShow = false;
    }

    protected render() {
        let width = this.width + 'px',
            height = this.height + 'px';
        return (
            <div>
                {this.fileList.map(item => {
                    return (
                        <div class={[clsPrefix + 'item', this.shape == 'circle' ? style.cls.circle : '']} style={{ width, height }}>
                            <div style={{
                                width: 'inherit',
                                height: 'inherit',
                            }}>
                                <MyImg style={{
                                    width: 'inherit',
                                    height: 'inherit',
                                }} src={item.url || item.data} />
                                <div class={clsPrefix + 'item-cover'} style={{ lineHeight: height }}>
                                    {item.originData && <Icon type="md-create" nativeOn-click={() => { this.handleEdit(item); }} />}
                                    <Icon type="md-camera" nativeOn-click={() => {
                                        this.handleSelectFile(item);
                                    }} />
                                    <Icon type="md-eye" nativeOn-click={() => { this.handleView(item); }} />
                                    <Icon type="md-trash" nativeOn-click={() => { this.handleRemove(item); }} />
                                </div>
                            </div>
                        </div>
                    )
                })}

                <Upload
                    class={clsPrefix + 'upload'}
                    v-show={!this.getHideUpload()}
                    ref="upload"
                    show-upload-list={false}
                    format={this.format}
                    max-size={this.maxSize}
                    // props={{
                    //     onSuccess: this.handleSuccess,
                    //     onFormatError: this.handleFormatError,
                    //     onExceededSize: this.handleMaxSize,
                    //     onError: this.handleError
                    // }}
                    before-upload={this.handleBeforeUpload}
                    headers={this.uploadHeaders}
                    multiple={false}
                    type="drag"
                    action={this.uploadUrl}
                    style={{ width }}
                    nativeOn-click={() => {
                        this.selectedIndex = -1;
                    }}>
                    <div style={{ width, height, lineHeight: height }} on-click={() => {
                        if (this.headers)
                            this.uploadHeaders = this.headers();
                    }}>
                        <Icon type="md-camera" size="20"></Icon>
                    </div>
                </Upload>
                <transition name="fade">
                    <div class={[style.cls.mask]} v-show={this.cropperShow}>
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <div style={{ width: '1024px', height: '576px', display: 'inline-block' }}>
                                <VueCropper
                                    ref="cropper"
                                    props={this.cropper}
                                    class={this.shape == 'circle' ? clsPrefix + 'cropper-circle' : ''}
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
                                }}>截取</Button>
                                <Button on-click={() => {
                                    this.pushImg(this.cropper.img);
                                }}>原图</Button>
                            </div>
                        </div>
                    </div>
                </transition>
                <MyImgViewer ref="imgViewer" src={this.showUrl} />
            </div>
        );
    }
}

const MyUploadView = convClass<MyUpload>(MyUpload);
export default MyUploadView;
export interface IMyUpload extends MyUpload { }