[
    {
        $match: {pop_urbArea: {$gt:0}}
    },
    {$group: {
        _id: {
            pop: '$pop_urbArea',
            degree: '$degree'
        },
        avgClustCoeff: {$avg: '$clustCoeff'},
        amount: {$sum : 1},
    }},
    {$sort:{
        '_id.degree': 1,
    }},
    {$group: {
        _id: {
            pop: '$_id.pop'
        },
        amount: {$sum: '$amount'},
        degrees: {$push: {
            degree: '$_id.degree',
            avgClustCoeff: '$avgClustCoeff',
            amount: '$amount',
        }},
    }},
    {$project:{
        _id: 0,
        pop: '$_id.pop',
        amount: 1, degrees: 1,
    }},
    {$sort:{
        pop: 1,
    }},
]