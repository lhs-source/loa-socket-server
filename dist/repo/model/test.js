"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function TestModel(mongoose) {
    // Set model 
    var Test = mongoose.model('test', mongoose.Schema({ title: String, description: String, published: Boolean }, { timestamps: true }));
    return Test;
}
exports.default = TestModel;
;
