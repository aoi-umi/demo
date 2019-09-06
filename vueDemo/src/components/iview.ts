import * as iviewTypes from "iview";
const iview = require("iview");

import { convClass } from "../helpers";

export const AutoComplete = convClass<iviewTypes.AutoComplete>(iview.AutoComplete);
export const Avatar = convClass<iviewTypes.Avatar>(iview.Avatar);
export const BackTop = convClass<iviewTypes.BackTop>(iview.BackTop);
export const Badge = convClass<iviewTypes.Badge>(iview.Badge);
export const Button = convClass<iviewTypes.Button>(iview.Button);
export const Card = convClass<iviewTypes.Card>(iview.Card);
export const Carousel = convClass<iviewTypes.Carousel>(iview.Carousel);
export const CarouselItem = convClass<iviewTypes.CarouselItem>(iview.CarouselItem);
export const Checkbox = convClass<iviewTypes.Checkbox>(iview.Checkbox);
export const Content = convClass<iviewTypes.Content>(iview.Content);
export const DatePicker = convClass<iviewTypes.DatePicker>(iview.DatePicker);
export const Drawer = convClass<iviewTypes.Drawer>(iview.Drawer);
export const Divider = convClass<iviewTypes.Divider>(iview.Divider);
export const Form = convClass<iviewTypes.Form>(iview.Form);
export const FormItem = convClass<iviewTypes.FormItem>(iview.FormItem);

export const Row = convClass<iviewTypes.Row>(iview.Row);
export const Col = convClass<iviewTypes.Col>(iview.Col);
export const ColorPicker = convClass<iviewTypes.ColorPicker>(iview.ColorPicker);

export const Header = convClass<iviewTypes.Header>(iview.Header);
export const Icon = convClass<iviewTypes.Icon & { custom: string }>(iview.Icon);
export const Input = convClass<iviewTypes.Input>(iview.Input);
export const Layout = convClass<iviewTypes.Layout>(iview.Layout);
export const Modal = convClass<iviewTypes.Modal>(iview.Modal);

export const Page = convClass<iviewTypes.Page>(iview.Page);
export const Poptip = convClass<iviewTypes.Poptip>(iview.Poptip);
export const Progress = convClass<iviewTypes.Progress>(iview.Progress);

export const Radio = convClass<iviewTypes.Radio>(iview.Radio);
export const RadioGroup = convClass<iviewTypes.RadioGroup>(iview.RadioGroup);

export const Menu = convClass<iviewTypes.Menu>(iview.Menu);
export const MenuGroup = convClass<iviewTypes.MenuGroup>(iview.MenuGroup);
export const MenuItem = convClass<iviewTypes.MenuItem>(iview.MenuItem);
export const MenuSub = convClass<iviewTypes.MenuSub>(iview.MenuSub);
export const Option = convClass<iviewTypes.Option>(iview.Option);
export const Submenu = convClass<any>(iview.Submenu);

export const Select = convClass<iviewTypes.Select>(iview.Select);
export const Sider = convClass<{
    breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    value?: boolean;
    width?: number;
    collapsible?: boolean;
    'collapsed-width'?: number;
    'hide-trigger'?: boolean;
    'default-collapsed'?: boolean;
    'reverse-arrow'?: boolean;
}>(iview.Sider);
export const Spin = convClass<iviewTypes.Spin>(iview.Spin);
export const Split = convClass<iviewTypes.Split>(iview.Split);
export const Switch = convClass<iviewTypes.Switch>(iview.Switch);
export const Table = convClass<iviewTypes.Table>(iview.Table);
export const Tabs = convClass<iviewTypes.Tabs>(iview.Tabs);
export const TabPane = convClass<iviewTypes.TabPane>(iview.TabPane);
export const Tag = convClass<iviewTypes.Tag>(iview.Tag);
export const Time = convClass<iviewTypes.Time>(iview.Time);
export const Tooltip = convClass<iviewTypes.Tooltip>(iview.Tooltip);
export const Transfer = convClass<iviewTypes.Transfer>(iview.Transfer);
export const Upload = convClass<iviewTypes.Upload>(iview.Upload);

