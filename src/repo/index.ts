
import mongoose from 'mongoose';
import Test from './model/test';

mongoose.Promise = global.Promise;

const db = {
    mongoose: mongoose,
    url: 'mongodb://localhost:27017/?gssapiServiceName=mongodb&authSource=admin',
    test: Test(mongoose),
};

export default db;
