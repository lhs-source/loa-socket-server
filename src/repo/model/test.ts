export default function TestModel (mongoose : any) { 
    // Set model 
    const Test = mongoose.model(
        'test', 
        mongoose.Schema( { title: String, description: String, published: Boolean }, { timestamps: true } ) 
    ); 
    return Test; 
};

