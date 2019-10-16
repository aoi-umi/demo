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