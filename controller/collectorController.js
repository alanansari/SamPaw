const { ErrorHandler } = require('../middleware/errors');
const {Item} = require('../models');
const drops = ['BH1','BH2','BH3','GH1','GH2','GH3','AKG']

const getApprovedItemsList = async (req,res,next) => {
    try {

        const user = req.user;

        if(user.role!='COLLECTOR')
            return next(new ErrorHandler(400,'Access Denied'));

        let page = parseInt(req.query.page) || 1;
        let limit  = parseInt(req.query.limit) || 10;

        if(page<=0) page = 1;
        page = page - 1;
        if(limit<0) limit = 0;

        const itemsList = await Item.find({status:'APPROVED'})
                                    .skip(page*limit)
                                    .limit(limit)
                                    .populate('user',{password:0,items:0});

        return res.status(200).json({success:true,itemsList});

    } catch (err) {
        return next(err);
    }
}

const changeStatusToCollected = async (req,res,next) => {
    try {
        const user = req.user;

        if(user.role!='COLLECTOR')
            return next(new ErrorHandler(400,'Access Denied'));
        
        const {itemId} = req.params;
        const {dropPlace} = req.body;
        
        if(!dropPlace||!drops.includes(dropPlace))
            return next(new ErrorHandler(400,'dropPlace invalid'));

        const item = await Item.findById(itemId);

        if(!item)
            return next(new ErrorHandler(400,'Item not found'));

        if(item.status!='APPROVED'&&(!drops.includes(item.status.split('_')[1])))
            return next(new ErrorHandler(400,'Item status not approved or collected'));
        
        item.status = 'COLLECTED_'+dropPlace;
        await item.save();
        
        return res.status(200).json({success:true,msg:`Changed Item status to COLLECTED_${dropPlace}`})

    } catch (err) {
        return next(err)
    }
}

module.exports = {
    getApprovedItemsList,
    changeStatusToCollected,
}