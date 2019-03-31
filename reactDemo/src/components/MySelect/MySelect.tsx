import * as React from 'react';
import classNames from 'classnames';
import Select from 'react-select';
import { Props as SelectProps } from 'react-select/lib/Select';
import { Theme, WithStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import { emphasize } from '@material-ui/core/styles/colorManipulator';


import { GroupedOptionsType, OptionsType } from 'react-select/lib/types';
import { observable } from 'mobx';
import { withRouterDeco, withStylesDeco } from '../../helpers/util';
import { observer } from 'mobx-react';

const styles = (theme: Theme) => ({
    root: {
        flexGrow: 1,
    },
    input: {
        display: 'flex' as any,
        padding: 0,
    },
    valueContainer: {
        display: 'flex' as any,
        flexWrap: 'wrap' as any,
        flex: 1,
        alignItems: 'center' as any,
        overflow: 'hidden' as any,
    },
    chip: {
        margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
    },
    chipFocused: {
        backgroundColor: emphasize(
            theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
            0.08,
        ),
    },
    noOptionsMessage: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    singleValue: {
        fontSize: 16,
    },
    placeholder: {
        position: 'absolute' as any,
        left: 2,
        fontSize: 16,
    },
    paper: {
        position: 'absolute' as any,
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0,
    },
    divider: {
        height: theme.spacing.unit * 2,
    },
});

function NoOptionsMessage(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.noOptionsMessage}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function inputComponent({ inputRef, ...props }) {
    return <div ref={inputRef} {...props} />;
}

function Control(props) {
    return (
        <TextField
            fullWidth
            InputProps={{
                inputComponent,
                inputProps: {
                    className: props.selectProps.classes.input,
                    inputRef: props.innerRef,
                    children: props.children,
                    ...props.innerProps,
                },
            }}
            {...props.selectProps.textFieldProps}
        />
    );
}

function Option(props) {
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            component="div"
            style={{
                fontWeight: props.isSelected ? 500 : 400,
            }}
            {...props.innerProps}
        >
            {props.children}
        </MenuItem>
    );
}

function Placeholder(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.placeholder}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function SingleValue(props) {
    return (
        <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function ValueContainer(props) {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function MultiValue(props) {
    return (
        <Chip
            tabIndex={-1}
            label={props.children}
            className={classNames(props.selectProps.classes.chip, {
                [props.selectProps.classes.chipFocused]: props.isFocused,
            })}
            onDelete={props.removeProps.onClick}
            deleteIcon={<CancelIcon {...props.removeProps} />}
        />
    );
}

function Menu(props) {
    return (
        <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
            {props.children}
        </Paper>
    );
}

const components = {
    Control,
    Menu,
    MultiValue,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
};
type MyOptionType = { label: string; value: any };
type SelectOptionsType<OptionType = MyOptionType> = GroupedOptionsType<OptionType> | OptionsType<OptionType>;
type Props = SelectProps<MyOptionType> & {
    label?: string,
    isAsync?: boolean;
    asyncGetOptions?: (val: string) => Promise<SelectOptionsType>;
};
type InnerProps = WithStyles<typeof styles, true> & Props;
@withStylesDeco(styles, { withTheme: true })
@observer
export default class MySelect extends React.Component<Props>{
    private get innerProps() {
        return this.props as InnerProps;
    }

    @observable
    options: SelectOptionsType;

    @observable
    isLoading = false;

    queryKey: string = null;

    constructor(props) {
        super(props);
        this.options = this.innerProps.options;
    }
    onLoad = async (event: string) => {
        const {
            isAsync, asyncGetOptions,
        } = this.innerProps;
        try {
            let key = event && event.trim();
            if (((this.queryKey === null && !this.options)
                || (this.queryKey !== key))
                && isAsync && asyncGetOptions) {
                this.queryKey = key;
                this.isLoading = true;
                this.options = await asyncGetOptions(key);
            }
        } finally {
            this.isLoading = false;
        }
    }
    render() {
        const {
            classes, theme, label,
            isAsync, asyncGetOptions,
            ...restProps
        } = this.innerProps;

        const selectStyles = {
            input: base => ({
                ...base,
                color: theme.palette.text.primary,
                '& input': {
                    font: 'inherit',
                },
            }),
        };

        return (
            <div className={classes.root}>
                <NoSsr>
                    <Select
                        classes={classes}
                        styles={selectStyles}
                        components={components}
                        textFieldProps={{
                            label,
                            InputLabelProps: {
                                shrink: true,
                            },
                        }}
                        onFocus={() => {
                            this.onLoad(this.queryKey);
                        }}
                        onInputChange={(event) => {
                            this.onLoad(event);
                        }}
                        isClearable={true}
                        options={this.options}
                        isLoading={this.isLoading}
                        {...restProps}
                    />
                </NoSsr>
            </div>
        );
    }
}