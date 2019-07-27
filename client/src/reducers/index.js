import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import cartReducer from './cart_reducer';
import ordersReducer from './orders_reducer';
import productReducer from './products_reducer';
import userReducer from './user_reducer';

const rootReducer = combineReducers({
    form: formReducer,
    cart: cartReducer,
    orders: ordersReducer,
    products: productReducer,
    user: userReducer
});

export default rootReducer;
