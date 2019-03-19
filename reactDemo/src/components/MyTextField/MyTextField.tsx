
import * as React from "react";

import TextField, { TextFieldProps } from "@material-ui/core/TextField";

import MyForm, { MyFormProps } from '../MyForm';
import { Model } from "../Base";
type Props = {
    fieldKey: string;
    model: Model<any>;
} & TextFieldProps;
type InnerProps = Props;
export default class MyTextField extends React.Component<Props> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    render() {
        let { fieldKey, model, ...restProps } = this.innerProps;
        return (
            <MyForm style={{ marginTop: 15 }} fieldKey={fieldKey} model={model} renderChild={(key) => {
                return (
                    <TextField
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={model.field[key] || ''}
                        onChange={(e) => {
                            model.changeValue(key, e.target.value);
                        }}
                        {...restProps as any}
                    >
                    </TextField>
                );
            }}>
            </MyForm>
        );
    }
}