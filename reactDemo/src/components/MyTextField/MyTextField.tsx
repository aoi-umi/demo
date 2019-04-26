
import * as React from "react";
import { GroupedOptionsType, OptionsType, Theme } from 'react-select/lib/types';

import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import Fade from "@material-ui/core/Fade";
import Paper from "@material-ui/core/Paper";
import CircularProgress from '@material-ui/core/CircularProgress';

import MyForm, { MyFormProps } from '../MyForm';
import { Model } from "../Base";
import { withStylesDeco } from "../../helpers";
import { WithStyles } from "@material-ui/core";

type MyOptionType = { label: string; value: any };
type SelectOptionsType<OptionType = MyOptionType> = GroupedOptionsType<OptionType> | OptionsType<OptionType>;

type Props = {
    fieldKey: string;
    model: Model<any>;
    myAutoComplete?: {
        options?: SelectOptionsType
        isAsync?: boolean;
        asyncGetOptions?: (val: string) => Promise<SelectOptionsType>;
        onChange?: (e: MyOptionType) => any;
    };
} & TextFieldProps;

const styles = () => ({
    progress: {
        width: '100%',
        textAlign: 'center' as any
    }
});
type InnerProps = Props & WithStyles<typeof styles>;
@withStylesDeco(styles)
export default class MyTextField extends React.Component<Props> {
    private get innerProps() {
        return this.props as InnerProps;
    }
    state = {
        anchorEl: null,
        open: false,
        isLoading: true,
        options: []
    };
    queryKey: string = null;
    autoComplete = async (val) => {
        let { myAutoComplete } = this.innerProps;
        this.setState({
            open: true,
        });
        let queryKey = val && val.trim();
        try {
            if (this.queryKey !== queryKey) {
                this.queryKey = queryKey;
                let options;
                if (myAutoComplete && myAutoComplete.asyncGetOptions) {
                    this.setState({ isLoading: true });
                    options = await myAutoComplete.asyncGetOptions(queryKey);
                }
                this.setState({ options: options || [] });
            }
        } catch (e) {

        } finally {
            this.setState({ isLoading: false });
        }
    }
    render() {
        let { fieldKey, model, myAutoComplete, classes, fullWidth, ...restProps } = this.innerProps;
        let { anchorEl } = this.state;
        return (
            <MyForm style={{ marginTop: 15 }} fieldKey={fieldKey} model={model} fullWidth={fullWidth}
                renderChild={(key) => {
                    let val = model.getValue(key);
                    if (![0, false].includes(val) && !val)
                        val = '';
                    return (
                        <TextField
                            variant="outlined"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth={fullWidth}
                            value={val}
                            onChange={(e) => {
                                let val = e.target.value;
                                model.changeValue(key, val);
                                this.setState({
                                    anchorEl: e.currentTarget,
                                });
                                this.autoComplete(val);
                            }}
                            onFocus={(e) => {
                                this.setState({
                                    anchorEl: e.currentTarget,
                                });
                                this.autoComplete(this.queryKey || '');
                            }}
                            onBlur={() => {
                                this.setState({
                                    open: false,
                                });
                            }}
                            {...restProps as any}
                        >
                        </TextField>
                    );
                }}>
                {myAutoComplete &&
                    <Popper style={{
                        zIndex: 1400,
                        paddingTop: 5,
                        paddingBottom: 5,
                        width: anchorEl ? anchorEl.clientWidth : null
                    }} open={this.state.open} anchorEl={anchorEl} transition>
                        {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={350}>
                                <Paper square>
                                    {this.state.isLoading ?
                                        <div className={classes.progress}>
                                            <CircularProgress size={24} />
                                        </div> :
                                        this.state.options.map((ele, idx) => {
                                            return <MenuItem key={idx} onClick={() => {
                                                if (myAutoComplete.onChange)
                                                    myAutoComplete.onChange(ele);
                                                else {
                                                    model.changeValue(fieldKey, ele.label);
                                                }
                                            }}>{ele.label}</MenuItem>
                                        })
                                    }
                                </Paper>
                            </Fade>
                        )}
                    </Popper>
                }
            </MyForm >
        );
    }
}