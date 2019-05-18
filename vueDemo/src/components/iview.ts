import * as iviewTypes from 'iview';
const iview = require('iview');

import { convertToClass } from '../utils';

export const Button = convertToClass<iviewTypes.Button>(iview.Button);
export const Drawer = convertToClass<iviewTypes.Drawer>(iview.Drawer);
export const Icon = convertToClass<iviewTypes.Icon>(iview.Icon);
export const Input = convertToClass<iviewTypes.Input>(iview.Input);
export const Menu = convertToClass<iviewTypes.Menu>(iview.Menu);
export const MenuGroup = convertToClass<iviewTypes.MenuGroup>(iview.MenuGroup);
export const MenuItem = convertToClass<iviewTypes.MenuItem>(iview.MenuItem);
export const MenuSub = convertToClass<iviewTypes.MenuSub>(iview.MenuSub);
export const Submenu = convertToClass<any>(iview.Submenu);