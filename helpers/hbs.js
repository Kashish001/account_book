module.exports = {
    indexing: (index) => {
        return Number(index) + 1;
    },
    total: (transactions, key) => {
        let totalSum = 0;
        for(let transaction of transactions) {
            totalSum = totalSum + parseInt(transaction[key])
        }
        return totalSum;
    },
    ifCond: (value, options) => {
        if(parseInt(value) === 0) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },
    json: (data) => {
        return JSON.stringify(data);
    },
}