/**
 * * 각인 검색 로그
 * @param mongoose 
 */
export default function LogSocketModel (mongoose : any) { 
    // Set model 
    const LogSocket = mongoose.model(
        'logSocket', 
        mongoose.Schema( {
            socket: [
                {
                    name: String,
                    number: Number,
                    id: Number,
                }
            ],
        }, { 
            timestamps: true 
        } ) 
    ); 
    return LogSocket; 
};
