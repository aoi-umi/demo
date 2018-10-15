import { DocumentQuery, Schema, Document } from 'mongoose';
import {
    Model, getModelForClass, ModelType, connect, DocType, InstanceType, Ref,
    setSchema, prop, arrayProp, setMethod as instanceMethod, setStatic as staticMethod,
    setPre as pre, setPost as post, setPlugin as plugin
} from './mongo';


(async () => {
    connect('mongodb://localhost:27017/test', { mongooseOption: { useNewUrlParser: true } });

    type BaseUserInstanceType = InstanceType<BaseUser>;
    function lastModifiedPlugin(schema: Schema) {
        schema.add({ lastMod: Date });
        schema.pre('save', function (this: Document & { lastMod: Date }, next) {
            this.lastMod = new Date();
            next();
        });
    }

    @setSchema()
    @pre<BaseUserInstanceType>('save', function (this, next) {
        this.name += '_preBase';
        next();
    })
    @plugin(lastModifiedPlugin)
    class BaseUser extends Model<BaseUser> {
        @prop({
            test: 'just a test'
        })
        name?: string;

        @prop()
        name2?: string;
        @instanceMethod
        a() {
            return 'a, base';
        }
    }


    type UserInstanceType = InstanceType<User>;
    type UserModelType = ModelType<User, typeof User>;
    type UserDocType = DocType<UserInstanceType>;
    @setSchema({
        schemaOptions: {
            timestamps: true,
            collection: 'userTest1',
            toObject: {
                virtuals: true
            }
        }
    })
    @pre<BaseUser>('save', function (this, next) {
        this.name += '_preUser';
        next();
    })
    class User extends BaseUser {
        @prop({
            required: true
        })
        name?: string;
        @instanceMethod
        a() {
            return 'a, user 1';
        }
        @prop()
        get myName() {
            return 'my name is ' + this.name;
        }
        set myName(val) {
            this.name = val + Date.now();
        }
    }

    const UserModel = getModelForClass<User, typeof User>(User);

    type User2InstanceType = InstanceType<User2>;
    type User2ModelType = ModelType<User2, typeof User2>;
    type User2DocType = DocType<User2InstanceType>;
    @setSchema({
        schemaOptions: {
            timestamps: true,
            toObject: {
                virtuals: true,
                transform: (doc: User2DocType, ret) => {
                    ret.num = 100;
                    return ret;
                }
            },
            toJSON: {
                virtuals: true,
                transform: (doc, ret) => {
                    for (let key in ret) {
                        let value = ret[key];
                        if (value !== null && value !== undefined)
                            ret[key] = value.toString();
                    }
                    return ret;
                }
            }
        }
    })
    @pre<BaseUser>('save', function (this, next) {
        this.name += '_preUser2';
        next();
    })
    class User2 extends BaseUser {
        @staticMethod
        static c(conditions?: any, projection?: any | null, options?: any | null,
            callback?: (err: any, res: User2InstanceType | null) => void): DocumentQuery<User2InstanceType | null, User2InstanceType> {
            let self = this as User2ModelType;
            return self.findOne.apply(this, arguments).skip(1).sort({ _id: -1 }).populate('childId');
        }

        @prop()
        num?: number;

        @prop()
        get virtualNum() {
            return (this.num || 0) + 10;
        }

        @prop()
        child: User;
        @prop({ ref: User, required: false })
        childId: Ref<User>;

        @arrayProp({
            items: User
        })
        childList: User[];


        @arrayProp({
            items: Date
        })
        testList: Date[];

        @instanceMethod
        b() {
            return 'b, user 2';
        }
    }

    const User2Model = getModelForClass<User2, typeof User2>(User2);
    let u = new UserModel({ name: '123' });

    u.myName = u.name;
    await u.save();

    u.name = 'child';
    let u2 = new User2Model({
        name: 'user2',
        num: parseFloat('1'),
        child: u,
        childId: u._id,
        childList: [u],
        testList: [new Date()]
    });

    await u2.save();
    let u11 = await UserModel.findOne({}).sort({ _id: -1 });
    if (u11 != null) {
        console.log(u11.a());
        console.log(u11);
    }

    let u22 = await User2Model.findOne({}).sort({ _id: -1 });
    if (u22 != null)
        console.log(`${u22.a()}; ${u22.b()}; ${u22.createdAt}`);

    User2Model.c().sort({ _id: -1 }).then(t => {
        console.log(t.toJSON());
    });

})().then(() => {
    console.log(1);
}).catch(e => {
    console.log(e);
});

