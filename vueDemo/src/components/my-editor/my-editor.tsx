import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { MyInputBase } from '../my-input/my-input';
import { convClass } from '../utils';


@Component
class MyEditor extends MyInputBase {

    @Prop({
        default: () => {
            return [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],

                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction

                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['link', 'image']//'formula','video'
            ];
        }
    })
    toolbar?: any[][];

    $refs: { quillEditor: any };

    private toolbarTips = [
        { Choice: '.ql-bold', title: '加粗' },
        { Choice: '.ql-italic', title: '倾斜' },
        { Choice: '.ql-underline', title: '下划线' },
        { Choice: '.ql-header', title: '段落格式' },
        { Choice: '.ql-strike', title: '删除线' },
        { Choice: '.ql-blockquote', title: '块引用' },
        { Choice: '.ql-code-block', title: '插入代码段' },
        { Choice: '.ql-size', title: '字体大小' },
        { Choice: '.ql-header[value="1"]', title: 'h1' },
        { Choice: '.ql-header[value="2"]', title: 'h2' },
        { Choice: '.ql-list[value="ordered"]', title: '编号列表' },
        { Choice: '.ql-list[value="bullet"]', title: '项目列表' },
        { Choice: '.ql-script[value="sub"]', title: '下标' },
        { Choice: '.ql-script[value="super"]', title: '上标' },
        { Choice: '.ql-align', title: '对齐方式' },
        { Choice: '.ql-color', title: '字体颜色' },
        { Choice: '.ql-background', title: '背景颜色' },
        { Choice: '.ql-font', title: '字体' },
        { Choice: '.ql-image', title: '图像' },
        { Choice: '.ql-video', title: '视频' },
        { Choice: '.ql-link', title: '添加链接' },
        { Choice: '.ql-formula', title: '插入公式' },
        { Choice: '.ql-clean', title: '清除格式' },
        { Choice: '.ql-indent[value="-1"]', title: '向左缩进' },
        { Choice: '.ql-indent[value="+1"]', title: '向右缩进' },
        { Choice: '.ql-direction', title: 'rtl' },
        { Choice: '.ql-header .ql-picker-label', title: '标题大小' },
        { Choice: '.ql-header .ql-picker-item[data-value="1"]', title: '标题一' },
        { Choice: '.ql-header .ql-picker-item[data-value="2"]', title: '标题二' },
        { Choice: '.ql-header .ql-picker-item[data-value="3"]', title: '标题三' },
        { Choice: '.ql-header .ql-picker-item[data-value="4"]', title: '标题四' },
        { Choice: '.ql-header .ql-picker-item[data-value="5"]', title: '标题五' },
        { Choice: '.ql-header .ql-picker-item[data-value="6"]', title: '标题六' },
        { Choice: '.ql-header .ql-picker-item:last-child', title: '标准' },
        { Choice: '.ql-size .ql-picker-item[data-value="small"]', title: '小号' },
        { Choice: '.ql-size .ql-picker-item[data-value="large"]', title: '大号' },
        { Choice: '.ql-size .ql-picker-item[data-value="huge"]', title: '超大号' },
        { Choice: '.ql-size .ql-picker-item:nth-child(2)', title: '标准' },
        { Choice: '.ql-align .ql-picker-item:first-child', title: '居左对齐' },
        { Choice: '.ql-align .ql-picker-item[data-value="center"]', title: '居中对齐' },
        { Choice: '.ql-align .ql-picker-item[data-value="right"]', title: '居右对齐' },
        { Choice: '.ql-align .ql-picker-item[data-value="justify"]', title: '两端对齐' }
    ];

    protected mounted() {
        let el: HTMLElement = this.$refs.quillEditor.$el;
        for (let ele of this.toolbarTips) {
            let elm = el.querySelector('.quill-editor ' + ele.Choice);
            if (!elm)
                continue;
            elm.setAttribute('title', ele.title);
        }
    }

    insertEmbed(type, data) {
        let quill = this.$refs.quillEditor.quill;
        let index = quill.selection.savedRange.index;
        quill.insertEmbed(index, type, data);
        quill.setSelection(index + 1);
    }

    private handleImg(toolbar) {
        let fileInput = toolbar.container.querySelector('input.ql-image[type=file]');
        if (fileInput == null) {
            fileInput = document.createElement('input');
            fileInput.setAttribute('type', 'file');
            fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
            fileInput.classList.add('ql-image');
            fileInput.addEventListener('change', () => {
                if (fileInput.files != null && fileInput.files[0] != null) {
                    this.$emit('img-change', fileInput.files[0]);
                    fileInput.value = '';
                }
            });
            toolbar.container.appendChild(fileInput);
        }
        fileInput.click();
    }

    render() {
        let self = this;
        return (
            <quill-editor style={{ background: '#fff' }} ref="quillEditor" v-model={this.currentValue} options={{
                placeholder: this.placeholder,
                modules: {
                    toolbar: {
                        container: this.toolbar,
                        handlers: {
                            image: function () {
                                self.handleImg(this);
                            }
                        }
                    },
                }
            }
            }></quill-editor>
        );
    }
}

export interface IMyEditor extends MyEditor { }
const MyEditorView = convClass<MyEditor>(MyEditor);
export default MyEditorView;