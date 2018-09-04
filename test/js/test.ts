import * as mongoose from 'mongoose';
import { DocumentQuery } from 'mongoose';
import { Typegoose, InstanceType, prop, instanceMethod, staticMethod, pre, Ref } from 'typegoose';
import { Model, getModelForClass, ModelType, connect } from './mongo';

(async () => {
    connect('mongodb://localhost:27017/test', { mongooseOption: { useNewUrlParser: true } });

    class BaseUser extends Model<BaseUser> {
        @prop()
        name?: string;
        @instanceMethod
        a() {
            console.log('a, base');
        }
    }
    class User extends BaseUser {
        @prop({
            required: true,
        })
        name?: string;
        @instanceMethod
        a(this: InstanceType<User>) {
            console.log('a, user 1');
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
            console.log('b, user 2');
        }
    }

    const UserModel2 = getModelForClass<User2, typeof User2>(User2, {
        schemaOptions: {
            timestamps: true,
        }
    });
    let u = new UserModel({ name: '123' });
    await u.save();

    let child = new UserModel();
    child.name = 'child';

    let u2 = new UserModel2({
        num: parseFloat('1'),
        child: child,
        childId: child._id,
    });
    await u2.save();
    let u11 = await UserModel.findOne({});
    if (u11 != null) {
        u11.a();
        console.log(u11._doc);
    }

    let u22 = await UserModel2.findOne({ _id: u2.id });
    if (u22 != null)
        u22.a(), u22.b(), console.log(u22.createdAt);

    UserModel2.c().then(t => {
        console.log(t);
    });

})().then(() => {
    console.log(1);
}).catch(e => {
    console.log(e);
});

