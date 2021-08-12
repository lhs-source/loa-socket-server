
export default function AccessaryModel (mongoose : any) { 
    // Set model 
    const Accessary = mongoose.model(
        'accessary', 
        mongoose.Schema( {
            grade: Number,
            accType: Number,
            socket1: {
                name: String,
                number: Number,
                id: Number,
            },
            socket2: {
                name: String,
                number: Number,
                id: Number,
            },
            itemtrail: [
                {
                    timestamp: Date,
                    list: [
                        {
                            name: String,
                            count: String,
                            grade: Number,
                            acctype: Number,
                            socket1: {
                                name: String,
                                number: Number,
                            },
                            socket2:{
                                name: String,
                                number: Number,
                            },
                            badSocket1: {
                                name: String,
                                number: Number,
                            },
                            property1: {
                                name: String,
                                number: Number,
                            },
                            property2: {
                                name: String,
                                number: Number,
                            },
                            price: Number,
                            
                        }
                    ]
                }
            ]
        }, { 
            timestamps: true 
        } ) 
    ); 
    return Accessary; 
};
