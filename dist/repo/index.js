"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var test_1 = __importDefault(require("./model/test"));
mongoose_1.default.Promise = global.Promise;
var db = {
    mongoose: mongoose_1.default,
    url: 'mongodb://localhost:27017/?gssapiServiceName=mongodb&authSource=admin',
    test: test_1.default(mongoose_1.default),
};
exports.default = db;
