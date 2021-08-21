
import mongoose from 'mongoose';
import AccessaryModel from './model/Accessary';
import LogAccComposition from './model/LogAccComposition';
import LogSocket from './model/LogSocket';

mongoose.Promise = global.Promise;

const db = {
    mongoose: mongoose,
    url: 'mongodb+srv://lhs:asdf1234@loafreetier.xoavn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    accessary: AccessaryModel(mongoose),
    logAccComposition: LogAccComposition(mongoose),
    logSocket: LogSocket(mongoose),
};

export default db;
