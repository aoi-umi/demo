
import * as React from "react";
import { ReactNode } from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';

import { observer } from 'mobx-react';

import { Model } from "../Base";

type MyFormProps = {
    fieldKey: string;
    model: Model<any>;
    renderChild: (key: string) => ReactNode;
}

type InnerProps = MyFormProps & {

};

@observer
export default class MyForm extends React.Component<MyFormProps> {
    private get innerProps() {
        return this.props as InnerProps;
    }

    render() {
        let { renderChild, fieldKey, model } = this.innerProps;
        let msg = (model.fieldErr[fieldKey] && model.fieldErr[fieldKey].msg) || '';
        return (
            <FormControl error={true} fullWidth>
                {renderChild(fieldKey)}
                <FormHelperText>{msg}</FormHelperText>
            </FormControl>
        )
    }
}