import * as mongoose from 'mongoose';
import { DocumentQuery } from 'mongoose';
import { Typegoose, InstanceType, instanceMethod, staticMethod, pre, post, Ref, plugin } from 'typegoose';
import { Model, getModelForClass, ModelType, connect, DocType, prop, model, arrayProp } from './mongo';


(async () => {
    connect('mongodb://localhost:27017/test', { mongooseOption: { useNewUrlParser: true } });

    function lastModifiedPlugin(schema: mongoose.Schema, options) {
        schema.add({ lastMod: Date });
        schema.pre('save', function (this: mongoose.Document & { lastMod: Date }, next) {
            this.lastMod = new Date();
            next();
        });
    }

    @model()
    @pre<BaseUser>('save', function (this: InstanceType<User>, next) {
        this.name += 'base';
        next();
    })
    @plugin(lastModifiedPlugin)
    class BaseUser extends Model<BaseUser> {
        @prop()
        name?: string;
        @instanceMethod
        a() {
            return 'a, base';
        }
    }


    type UserInstance = InstanceType<User>;
    type UserModel = ModelType<User, typeof User>;
    type UserDoc = DocType<UserInstance>;
    @model()
    class User extends BaseUser {
        @prop({
            required: true,
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

    const UserModel = getModelForClass<User, typeof User>(User, {
        schemaOptions: {
            timestamps: true,
            collection: 'userTest1',
            toObject: {
                virtuals: true
            }
        }
    });

    type User2Instance = InstanceType<User2>;
    type User2Model = ModelType<User2, typeof User2>;
    type User2Doc = DocType<User2Instance>;
    @model()
    class User2 extends BaseUser {
        @staticMethod
        static c(this: User2Model, conditions?: any, projection?: any | null, options?: any | null,
            callback?: (err: any, res: User2Instance | null) => void): DocumentQuery<User2Instance | null, User2Instance> {
            return this.findOne.apply(this, arguments);
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
            if (this.child)
                console.log(1);
            return 'b, user 2';
        }
    }

    const UserModel2 = getModelForClass<User2, typeof User2>(User2, {
        schemaOptions: {
            timestamps: true,
            toObject: {
                virtuals: true,
                transform: (doc: User2Doc, ret) => {
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
    });
    let u = new UserModel({ name: '123' });
    u.myName = u.name;
    await u.save();

    let child = new UserModel();
    child.name = 'child';

    let u2 = new UserModel2({
        num: parseFloat('1'),
        child: child,
        childId: child._id,
        childList: [child],
        testList: [new Date()]
    });
    await u2.save();
    let u11 = await UserModel.findOne({}).sort({ _id: -1 });
    if (u11 != null) {
        console.log(u11.a());
        console.log(u11);
    }

    let u22 = await UserModel2.findOne({}).sort({ _id: -1 });
    if (u22 != null)
        console.log(`${u22.a()}; ${u22.b()}; ${u22.createdAt}`);

    UserModel2.c().sort({ _id: -1 }).then(t => {
        console.log(t.toJSON());
    });

})().then(() => {
    console.log(1);
}).catch(e => {
    console.log(e);
});

