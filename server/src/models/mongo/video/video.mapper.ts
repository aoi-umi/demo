import { Types } from 'mongoose';

import * as config from '@/config';
import { myEnum } from '@/config';
import * as VaildSchema from '@/vaild-schema/class-valid';
import { error, escapeRegExp } from '@/_system/common';
import { Auth } from '@/_system/auth';
import { transaction } from '@/_system/dbMongo';

import { LoginUser } from '../../login-user';
import { BaseMapper } from '../_base';
import { UserModel, UserMapper } from '../user';
import { FileMapper } from '../file';
import { FollowMapper } from '../follow';
import { VoteModel, VoteMapper } from '../vote';
import { VideoInstanceType, VideoModel, VideoDocType } from "./video";

export class VideoMapper {
}