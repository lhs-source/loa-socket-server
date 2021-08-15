
import mongoose from 'mongoose';
import AccessaryModel from './model/Accessary';
import LogAccComposition from './model/LogAccComposition';
import LogSocket from './model/LogSocket';

mongoose.Promise = global.Promise;

const db = {
    mongoose: mongoose,
    url: 'mongodb://localhost:27017/Lostark?gssapiServiceName=mongodb&authSource=admin',
    accessary: AccessaryModel(mongoose),
    logAccComposition: LogAccComposition(mongoose),
    logSocket: LogSocket(mongoose),
};

export default db;
