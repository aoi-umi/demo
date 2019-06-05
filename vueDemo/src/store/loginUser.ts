
import {
    Module,
    VuexModule,
    Mutation,
    Action,
    MutationAction,
    getModule
} from 'vuex-module-decorators';
import { LoginUserType, LoginUser } from '@/model/user';

@Module({ name: 'user' })
export default class LoginUserStore extends VuexModule {
    user: LoginUserType = null;

    @Mutation
    setUser(user) {
        this.user = user && LoginUser.create(user);
    }
}