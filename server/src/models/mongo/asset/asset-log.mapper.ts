import { AssetLogModel } from "./asset-log";

export class AssetLogMapper {
    static lookupPipeline(opt?: {
        assetLogIdKey?: string;
        asName?: string;
        match?: object;
    }) {
        opt = {
            ...opt
        };
        let asName = opt.asName || 'assetLog';
        return [
            {
                $lookup: {
                    from: AssetLogModel.collection.collectionName,
                    let: { assetLogId: '$' + (opt.assetLogIdKey || 'assetLogId') },
                    pipeline: [{
                        $match: {
                            ...opt.match,
                            $expr: { $eq: ['$$assetLogId', '$_id'] }
                        }
                    }],
                    as: asName
                }
            },
            { $unwind: '$' + asName },
        ];
    }
}