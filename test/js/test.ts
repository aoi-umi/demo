import * as mongoose from 'mongoose';
import { DocumentQuery } from 'mongoose';
import { Typegoose, InstanceType, prop, instanceMethod, staticMethod, pre, post, Ref, plugin } from 'typegoose';
import { Model, getModelForClass, ModelType, connect } from './mongo';

(async () => {
    connect('mongodb://localhost:27017/test', { mongooseOption: { useNewUrlParser: true } });

    function lastModifiedPlugin(schema: mongoose.Schema, options) {
        schema.add({ lastMod: Date });
        schema.pre('save', function (this: mongoose.Document & { lastMod: Date }, next) {
            this.lastMod = new Date();
            next();
        });

        // if (options && options.index) {
        //     schema.path('lastMod').index(options.index);
        // }
    }

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
    class User extends BaseUser {
        @prop({
            required: true,
        })
        name?: string;
        @instanceMethod
        a(this: InstanceType<User>) {
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

    type InstanceTypeUser2 = InstanceType<User2>;
    type ModelTypeUser2 = ModelType<User2, typeof User2>;
    class User2 extends BaseUser {
        @staticMethod
        static c(this: ModelTypeUser2, conditions?: any, projection?: any | null, options?: any | null,
            callback?: (err: any, res: InstanceTypeUser2 | null) => void): DocumentQuery<InstanceTypeUser2 | null, InstanceTypeUser2> {
            return this.findOne.apply(this, arguments);
        }

        @prop()
        num?: number;

        @prop()
        child: User;
        @prop({ ref: User, required: false })
        childId: Ref<User>;

        @instanceMethod
        b(this: InstanceTypeUser2) {
            return 'b, user 2';
        }
    }

    const UserModel2 = getModelForClass<User2, typeof User2>(User2, {
        schemaOptions: {
            timestamps: true,
        }
    });
    let u = new UserModel({ name: '123' });
    u.myName = u.name;
    await u.save();

    // let child = new UserModel();
    // child.name = 'child';

    // let u2 = new UserModel2({
    //     num: parseFloat('1'),
    //     child: child,
    //     childId: child._id,
    // });
    // await u2.save();
    let u11 = await UserModel.findOne({}).sort({ _id: -1 });
    if (u11 != null) {
        console.log(u11.a());
        console.log(u11);
    }

    let u22 = await UserModel2.findOne({}).sort({ _id: -1 });
    if (u22 != null)
        console.log(`${u22.a()}; ${u22.b()}; ${u22.createdAt}`);

    UserModel2.c().then(t => {
        console.log(t);
    });

})().then(() => {
    console.log(1);
}).catch(e => {
    console.log(e);
});

