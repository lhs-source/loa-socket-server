
export default function AccessaryModel (mongoose : any) { 
    // Set model 
    const Accessary = mongoose.model(
        'accessary', 
        mongoose.Schema( {
            grade: Number,
            socket1: {
                name: String,
                number: Number,
                code: Number,
            },
            socket2: {
                name: String,
                number: Number,
                code: Number,
            },
            itemtrail: [
                {
                    grade: Number,
                    socket1: {
                        name: String,
                        number: Number,
                        code: Number,
                    },
                    socket2: {
                        name: String,
                        number: Number,
                        code: Number,
                    },
                    penalty: {
                        name: String,
                        number: Number,
                        code: Number,
                    },
                    critical: Number,
                    fast: Number,
                    price: Number,
                    timestamp: Date,
                }
            ]
        }, { 
            timestamps: true 
        } ) 
    ); 
    return Accessary; 
};
