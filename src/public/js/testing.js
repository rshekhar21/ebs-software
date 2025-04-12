function setupIndexDB_(dbName, storeConfigs, version = 1) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Loop through the store configurations and create object stores
            storeConfigs.forEach((storeConfig) => {
                if (!db.objectStoreNames.contains(storeConfig.store)) {
                    const objectStore = db.createObjectStore(storeConfig.store, storeConfig.options);

                    // Create indexes if provided
                    if (storeConfig.indexes) {
                        storeConfig.indexes.forEach((index) => {
                            objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
                        });
                    }
                }
            });
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function indexdbSetup() {
    try {
        let schema = [
            {
                store: 'users',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'entity',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'party',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                    { name: 'party_id', keyPath: 'party_id', unique: true },
                    { name: 'party_name', keyPath: 'party_name', unique: false },
                    { name: 'contact', keyPath: 'contact', unique: false },
                    { name: 'email', keyPath: 'email', unique: false },
                    { name: 'gst_number', keyPath: 'gst_number', unique: false },
                ]
            },
            {
                store: 'address',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'load_party',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'shipping',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'partners',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'orders',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'purchase',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'stock',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                    { name: 'sku', keyPath: 'sku', unique: true },
                    { name: 'ean', keyPath: 'ean', unique: false },
                    { name: 'pcode', keyPath: 'pcode', unique: false },
                    { name: 'product', keyPath: 'product', unique: false },
                    { name: 'pcode_lowercase', keyPath: 'pcode_lowercase', unique: false },
                    { name: 'product_lowercase', keyPath: 'product_lowercase', unique: false },
                ]
            },
            {
                store: 'defective_stock',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                    { name: 'sku', keyPath: 'sku', unique: true },
                    { name: 'ean', keyPath: 'ean', unique: false },
                    { name: 'pcode', keyPath: 'pcode', unique: false },
                    { name: 'product', keyPath: 'product', unique: false },
                ]
            },
            {
                store: 'sold',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                    { name: 'sku', keyPath: 'sku', unique: true },
                    { name: 'ean', keyPath: 'ean', unique: false },
                    { name: 'pcode', keyPath: 'pcode', unique: false },
                    { name: 'product', keyPath: 'product', unique: false },
                ]
            },
            {
                store: 'stockreturn',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                    { name: 'sku', keyPath: 'sku', unique: true },
                    { name: 'ean', keyPath: 'ean', unique: false },
                    { name: 'pcode', keyPath: 'pcode', unique: false },
                    { name: 'product', keyPath: 'product', unique: false },

                ]
            },
            {
                store: 'offers',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'bank',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'passbook',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'pymt_methods',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'payments',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'employee',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                    { name: 'emp_name', keyPath: 'emp_name', unique: false },
                    { name: 'contact', keyPath: 'contact', unique: false },
                    { name: 'emp_id', keyPath: 'emp_id', unique: true },
                ]
            },
            {
                store: 'emp_advance',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'salary',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'discounts',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'coupons',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'q_empsales',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'expense',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'holds',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }],
            },
            {
                store: 'hold_items',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'hold_id', keyPath: 'hold_id', unique: false }],
            },
            {
                store: 'rewards',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'settings',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'restrictions',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'daybook',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'gst_rates',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'notes',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'pymtfyear',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'stock_view',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'closing',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'recent',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'unpaid',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'sales',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'sales_lm',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'pymts',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'purchase',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'purch_lm',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'empsales',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'partydues',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [{ name: 'id', keyPath: 'id', unique: true }]
            },
            {
                store: 'srch_stock',
                options: {
                    keyPath: 'id', autoIncrement: true
                },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                    { name: 'sku', keyPath: 'sku', unique: true },
                    { name: 'ean', keyPath: 'ean', unique: false },
                    { name: 'pcode', keyPath: 'pcode', unique: false },
                    { name: 'product', keyPath: 'product', unique: false },
                    { name: 'pcode_lowercase', keyPath: 'pcode_lowercase', unique: false },
                    { name: 'product_lowercase', keyPath: 'product_lowercase', unique: false },
                ]
            }
        ];
        let dbname = storeId;
        // setupIndexDB(dbname, schema)
    } catch (error) {
        log(error);
    }
}

function initIndexDB() {
    try {
        // const dbname = myIndexDBName('quickData');
        const config = [
            {
                store: 'closing',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                ]
            },
            {
                store: 'recent',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                ]
            },
            {
                store: 'unpaid',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                ]
            },
            {
                store: 'sales',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true }
                ]
            },
            {
                store: 'sales_lm',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true }
                ]
            },
            {
                store: 'pymts',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true }
                ]
            },
            {
                store: 'party',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                ]
            },
            {
                store: 'shipping',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                ]
            },
            {
                store: 'purchase',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                ]
            },
            {
                store: 'purch_lm',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                ]
            },
            {
                store: 'empsales',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                ]
            },
            {
                store: 'partydues',
                options: { keyPath: 'id', autoIncrement: true },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                ]
            }
        ];
        // setupIndexDB(dbname, config);

        let stock_config = [
            {
                store: 'srch_stock',
                options: {
                    keyPath: 'id', autoIncrement: true
                },
                indexes: [
                    { name: 'id', keyPath: 'id', unique: true },
                    { name: 'sku', keyPath: 'sku', unique: true },
                    { name: 'ean', keyPath: 'ean', unique: false },
                    { name: 'pcode', keyPath: 'pcode', unique: false },
                    { name: 'product', keyPath: 'product', unique: false },
                    { name: 'pcode_lowercase', keyPath: 'pcode_lowercase', unique: false },
                    { name: 'product_lowercase', keyPath: 'product_lowercase', unique: false },
                ]
            }
        ];

        // let stockdb = myIndexDBName('srchStock')
        // setupIndexDB(stockdb, stock_config);

    } catch (error) {
        log(error);
    }
}


// let conf1 = [
//     {
//         store: 'test_1',
//         options: { keyPath: 'id', autoIncrement: true },
//         indexes: [{ name: 'id', keyPath: 'id', unique: true }]
//     },
//     {
//         store: 'test_2',
//         options: { keyPath: 'id', autoIncrement: true },
//         indexes: [{ name: 'id', keyPath: 'id', unique: true }]
//     },
// ]
// let conf2 = [
//     {
//         store: 'test_3',
//         options: { keyPath: 'id', autoIncrement: true },
//         indexes: [{ name: 'id', keyPath: 'id', unique: true }]
//     },
//     {
//         store: 'test_4',
//         options: { keyPath: 'id', autoIncrement: true },
//         indexes: [{ name: 'id', keyPath: 'id', unique: true }]
//     },
// ]
// let conf3 = [
//     {
//         store: 'test_5',
//         options: { keyPath: 'id', autoIncrement: true },
//         indexes: [{ name: 'id', keyPath: 'id', unique: true }]
//     },
//     {
//         store: 'test_6',
//         options: { keyPath: 'id', autoIncrement: true },
//         indexes: [{ name: 'id', keyPath: 'id', unique: true }]
//     },
// ]

// setupIndexDB('testDB', conf1)
// setupIndexDB('testDB', conf2)
// setupIndexDB('testDB', conf3)




// const data = [
//     { "mnth": 2, "short_month": "Feb", "current_fy": "0.00", "last_fy": "1454394.00" },
//     { "mnth": 3, "short_month": "Mar", "current_fy": "0.00", "last_fy": "2660476.25" },
//     { "mnth": 4, "short_month": "Apr", "current_fy": "5777226.50", "last_fy": "3289118.50" },
//     { "mnth": 5, "short_month": "May", "current_fy": "3580678.00", "last_fy": "3246402.25" },
//     { "mnth": 6, "short_month": "Jun", "current_fy": "2649235.00", "last_fy": "2854056.40" },
//     { "mnth": 7, "short_month": "Jul", "current_fy": "2338505.50", "last_fy": "2846445.50" },
//     { "mnth": 8, "short_month": "Aug", "current_fy": "904195.00", "last_fy": "2349468.00" },
//     { "mnth": 9, "short_month": "Sep", "current_fy": "0.00", "last_fy": "2580692.00" },
//     { "mnth": 10, "short_month": "Oct", "current_fy": "0.00", "last_fy": "3454612.00" },
//     { "mnth": 11, "short_month": "Nov", "current_fy": "0.00", "last_fy": "3899958.00" },
//     { "mnth": 12, "short_month": "Dec", "current_fy": "0.00", "last_fy": "3343918.00" },
//     { "mnth": 1, "short_month": "Jan", "current_fy": "0.00", "last_fy": "2884225.00" }
// ];

// const order = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

// data.sort((a, b) => order.indexOf(a.mnth) - order.indexOf(b.mnth));

// console.log(data);