import { stringify } from "querystring";

/**
 * * 악세서리 조합의 결과 로그
 * 가격 등
 * @param mongoose 
 */
export default function LogAccCompositionModel (mongoose : any) { 
    // Set model 
    const LogAccComposition = mongoose.model(
        'logAccComposition', 
        mongoose.Schema( {
            grade: Number,
            socket: [
                {
                    name: String,
                    number: Number,
                    id: Number,
                }
            ],
            property: [
                {
                    id: Number,
                    name: String,
                    number: Number,
                }
            ],
            price: Number,
        }, { 
            timestamps: true 
        } ) 
    ); 
    return LogAccComposition; 
};
