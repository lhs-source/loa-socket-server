
import mongoose from 'mongoose';
import TestModel from './model/test';
import AccessaryModel from './model/Accessary';

mongoose.Promise = global.Promise;

const db = {
    mongoose: mongoose,
    url: 'mongodb://localhost:27017/Lostark?gssapiServiceName=mongodb&authSource=admin',
    test: TestModel(mongoose),
    accessary: AccessaryModel(mongoose),
};

export default db;
