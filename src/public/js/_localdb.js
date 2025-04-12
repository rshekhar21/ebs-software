import { log, storeId } from "./help.js";

// stores
let stores = [
    {
        store: 'party',
        options: { keyPath: 'id', autoIncrement: false },
        indexes: []
    },
    {
        store: 'partys',
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
        store: 'supplier',
        options: { keyPath: 'id', autoIncrement: false },
        indexes: [
            { name: 'id', keyPath: 'id', unique: true },
            { name: 'sup_id', keyPath: 'sup_id', unique: true },
            { name: 'supplier', keyPath: 'supplier', unique: false },
            { name: 'contact', keyPath: 'contact', unique: false },
            { name: 'gst_number', keyPath: 'gst_number', unique: false },
        ]
    },
    {
        store: 'stock',
        options: { keyPath: 'id', autoIncrement: true },
        indexes: [
            { name: 'id', keyPath: 'id', unique: true },
            { name: 'sku', keyPath: 'sku', unique: true },
            { name: 'pcode', keyPath: 'pcode', unique: false },
            { name: 'product', keyPath: 'product', unique: false },
            { name: 'mrp', keyPath: 'mrp', unique: false },
            { name: 'price', keyPath: 'price', unique: false },
            { name: 'brand', keyPath: 'brand', unique: false },
            { name: 'label', keyPath: 'label', unique: false },
            { name: 'colour', keyPath: 'colour', unique: false },
            { name: 'season', keyPath: 'season', unique: false },
            { name: 'section', keyPath: 'section', unique: false },
            { name: 'category', keyPath: 'category', unique: false },
            { name: 'supplier', keyPath: 'supplier', unique: false },
            { name: 'purch_id', keyPath: 'purch_id', unique: false },
            { name: 'unit', keyPath: 'unit', unique: false },
            { name: 'hsn', keyPath: 'hsn', unique: false },
            { name: 'upc', keyPath: 'upc', unique: false },
            { name: 'ean', keyPath: 'ean', unique: false },
        ]
    },
    {
        store: 'sold',
        options: { keyPath: 'id', autoIncrement: true },
        indexes: [
            { name: 'id', keyPath: 'id', unique: true },
            { name: 'sku', keyPath: 'sku', unique: false },
            { name: 'hsn', keyPath: 'hsn', unique: false },
            { name: 'pcode', keyPath: 'pcode', unique: false },
            { name: 'product', keyPath: 'product', unique: false },
            { name: 'category', keyPath: 'category', unique: false },
            { name: 'order_id', keyPath: 'order_id', unique: false },
        ]
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
        store: 'sales_lm',
        options: { keyPath: 'id', autoIncrement: true },
        indexes: [{ name: 'id', keyPath: 'id', unique: true }]
    },
    {
        store: 'holds',
        options: { keyPath: 'id', autoIncrement: true },
        indexes: [{ name: 'id', keyPath: 'id', unique: true }]
    },
    {
        store: 'purch_hold',
        options: { keyPath: 'id', autoIncrement: true },
        indexes: [{ name: 'id', keyPath: 'id', unique: true }]
    },
    {
        store: 'orders',
        options: { keyPath: 'id', autoIncrement: true },
        indexes: [
            { name: 'id', keyPath: 'id', unique: true },
            { name: 'year', keyPath: 'year', unique: false },
            { name: 'month', keyPath: 'month', unique: false },
            { name: 'dated', keyPath: 'dated', unique: false },
            { name: 'party', keyPath: 'party', unique: false },
            { name: 'biller', keyPath: 'biller', unique: false },
            { name: 'fin_year', keyPath: 'fin_year', unique: false },
            { name: 'party_name', keyPath: 'party_name', unique: false },
        ]
    },
    {
        store: 'purchase',
        options: { keyPath: 'id', autoIncrement: true },
        indexes: [
            { name: 'id', keyPath: 'id', unique: true },
            { name: 'dated', keyPath: 'dated', unique: false },
            { name: 'supid', keyPath: 'supid', unique: false },
            { name: 'supplier', keyPath: 'supplier', unique: false },
        ]
    },
    {
        store: 'daily_sales',
        options: { keyPath: 'id', autoIncrement: true },
        indexes: [
            { name: 'id', keyPath: 'id', unique: true },
            { name: 'fyear', keyPath: 'fyear', unique: false }
        ]
    },
    {
        store: 'sales',
        options: { keyPath: 'id', autoIncrement: true },
        indexes: [
            { name: 'id', keyPath: 'id', unique: true },
            { name: 'month', keyPath: 'month', unique: false },
            { name: 'year', keyPath: 'year', unique: false },
            { name: 'fyear', keyPath: 'fyear', unique: false },
            { name: 'dated', keyPath: 'dated', unique: false },
        ]
    },
    {
        store: 'employees',
        options: { keyPath: 'id', autoIncrement: true },
        indexes: [
            { name: 'id', keyPath: 'id', unique: true },
            { name: 'emp_id', keyPath: 'emp_id', unique: false },
            { name: 'emp_name', keyPath: 'emp_name', unique: false },
        ]
    },
    {
        store: 'emp_sales',
        options: { keyPath: 'id', autoIncrement: true },
        indexes: [
            { name: 'id', keyPath: 'id', unique: true },
            { name: 'employee', keyPath: 'employee', unique: false }
        ]
    },
    {
        store: 'payments',
        options: { keyPath: 'id', autoIncrement: true },
        indexes: [
            { name: 'id', keyPath: 'id', unique: true },
            { name: 'party', keyPath: 'party', unique: false },
            { name: 'order_id', keyPath: 'order_id', unique: false },
            { name: 'purch_id', keyPath: 'purch_id', unique: false }
        ]
    }
]


export function initLocaldb() { setupIndexDB(stores) }


export function deleteIndexDBStore(dbName, storeName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const existingStores = Array.from(db.objectStoreNames);
            const exist = existingStores.some(store => store === storeName);

            if (exist) {
                const newVersion = db.version + 1;
                db.close();

                const upgradeRequest = indexedDB.open(dbName, newVersion);
                upgradeRequest.onupgradeneeded = (upgradeEvent) => {
                    const upgradeDb = upgradeEvent.target.result;
                    if (upgradeDb.objectStoreNames.contains(storeName)) {
                        upgradeDb.deleteObjectStore(storeName);
                        console.log(`Object store "${storeName}" will be deleted.`);
                    }
                };

                upgradeRequest.onsuccess = (upgradeEvent) => {
                    const upgradedDb = upgradeEvent.target.result;
                    upgradedDb.close();
                    console.log('deleted successfully');
                    resolve('deleted successfully');
                };

                upgradeRequest.onerror = (upgradeEvent) => {
                    log(event.target.error);
                    reject(upgradeEvent.target.error);
                };
            } else {
                console.log(`Store "${storeName}" does not exist.`);
                resolve('Store does not exist'); // Resolve with a message
            }
        };

        request.onerror = (event) => {
            log(event.target.error);
            reject(event.target.error);
        };
    });
}

export function setupIndexDB(storeConfigs = [], dbName = storeId) {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(dbName);

        request.onsuccess = (event) => {
            const db = event.target.result;

            // Check if new stores need to be added
            const existingStores = Array.from(db.objectStoreNames);
            const newStores = storeConfigs.filter(
                (storeConfig) => !existingStores.includes(storeConfig.store)
            );

            if (newStores.length > 0) {
                log('settign new stores')
                // Close the database and reopen with incremented version
                const newVersion = db.version + 1; 
                db.close();

                const upgradeRequest = indexedDB.open(dbName, newVersion);

                upgradeRequest.onupgradeneeded = (upgradeEvent) => {
                    const upgradeDb = upgradeEvent.target.result;

                    newStores.forEach((storeConfig) => {
                        if (!upgradeDb.objectStoreNames.contains(storeConfig.store)) {
                            const objectStore = upgradeDb.createObjectStore(storeConfig.store, storeConfig.options);

                            if (storeConfig.indexes) {
                                storeConfig.indexes.forEach((index) => {
                                    objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
                                });
                            }
                        }
                    });
                };

                upgradeRequest.onsuccess = (upgradeEvent) => {
                    const upgradedDb = upgradeEvent.target.result;
                    upgradedDb.close(); // Close the database after upgrade
                    resolve(); // Resolve without passing the db object
                    // resolve(upgradeEvent.target.result);
                };

                upgradeRequest.onerror = (upgradeEvent) => {
                    reject(upgradeEvent.target.error);
                };
            } else {
                db.close()
                resolve();
            }
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            storeConfigs.forEach((storeConfig) => {
                if (!db.objectStoreNames.contains(storeConfig.store)) {
                    const objectStore = db.createObjectStore(storeConfig.store, storeConfig.options);

                    if (storeConfig.indexes) {
                        storeConfig.indexes.forEach((index) => {
                            objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
                        });
                    }
                }
            });
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export async function deleteIndexDB(dbName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbName);

        request.onsuccess = () => {
            console.log(`Database "${dbName}" deleted successfully.`);
            resolve(`Database "${dbName}" deleted successfully.`);
        };

        request.onerror = (event) => {
            console.error(`Error deleting database: ${event.target.errorCode}`);
            reject(event.target.errorCode);
        };

        request.onblocked = () => {
            console.warn(`Database "${dbName}" deletion blocked.`);
            reject("Database deletion blocked. Close all other connections to the database.");
        };
    });
}

export async function _deleteIndexDBStore(dbName, storeName) {
    return new Promise((resolve, reject) => {

        // Open the database with a new version
        const request = indexedDB.open(dbName, Date.now()); // Use a timestamp to increment the version

        request.onsuccess = (event) => {
            console.log(`Object store "${storeName}" deleted successfully.`);
            resolve(`Object store "${storeName}" deleted successfully.`);
        };

        request.onerror = (event) => {
            console.error(`Error opening IndexedDB: ${event.target.errorCode}`);
            reject(event.target.errorCode);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (db.objectStoreNames.contains(storeName)) {
                log(storeName);
                db.deleteObjectStore(storeName);
                console.log(`Object store "${storeName}" will be deleted.`);
            } else {
                console.warn(`Object store "${storeName}" does not exist.`);
            }
        };
    });
}

/**
 * Updates indexes on existing object stores in an IndexedDB database.
 *
 * @param {string} dbName - The name of the IndexedDB database.
 * @param {Array} storeUpdates - An array of store update configurations.
 *   Each configuration should have the following structure:
 *   {
 *     store: 'storeName', // Name of the object store to update
 *     addIndexes: [       // (Optional) Array of indexes to add
 *       {
 *         name: 'indexName',       // Name of the index
 *         keyPath: 'keyPath',      // Key path for the index
 *         unique: false             // Whether the index is unique
 *       },
 *       // ... more indexes to add
 *     ],
 *     deleteIndexes: ['indexName1', 'indexName2'] // (Optional) Array of index names to delete
 *   }
 *
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */

export function updateIndexDB(dbName, storeUpdates = []) {
    return new Promise((resolve, reject) => {
        // Step 1: Open the database to get the current version
        const openRequest = indexedDB.open(dbName);

        openRequest.onsuccess = (event) => {
            const db = event.target.result;
            const currentVersion = db.version;
            db.close(); // Close the current connection

            const newVersion = currentVersion + 1; // Increment the version number

            // Step 2: Open the database with the new version to trigger onupgradeneeded
            const upgradeRequest = indexedDB.open(dbName, newVersion);

            upgradeRequest.onupgradeneeded = (upgradeEvent) => {
                const upgradeDb = upgradeEvent.target.result;
                const transaction = upgradeEvent.target.transaction;

                storeUpdates.forEach((update) => {
                    const { store, addIndexes = [], deleteIndexes = [] } = update;

                    if (!upgradeDb.objectStoreNames.contains(store)) {
                        console.error(`Store "${store}" does not exist.`);
                        return;
                    }

                    const objectStore = transaction.objectStore(store);

                    // Delete specified indexes
                    deleteIndexes.forEach((indexName) => {
                        if (objectStore.indexNames.contains(indexName)) {
                            objectStore.deleteIndex(indexName);
                            console.log(`Deleted index "${indexName}" from store "${store}".`);
                        } else {
                            console.warn(`Index "${indexName}" does not exist on store "${store}".`);
                        }
                    });

                    // Add specified indexes
                    addIndexes.forEach((index) => {
                        if (!objectStore.indexNames.contains(index.name)) {
                            objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
                            console.log(`Added index "${index.name}" to store "${store}".`);
                        } else {
                            console.warn(`Index "${index.name}" already exists on store "${store}".`);
                        }
                    });
                });
            };

            upgradeRequest.onsuccess = () => {
                const upgradedDb = upgradeRequest.result;
                upgradedDb.close();
                console.log('Database upgrade successful.');
                resolve();
            };

            upgradeRequest.onerror = (event) => {
                console.error('Error during database upgrade:', event.target.error);
                reject(event.target.error);
            };
        };

        openRequest.onerror = (event) => {
            console.error('Error opening database:', event.target.error);
            reject(event.target.error);
        };
    });
}


export function verifyIndex(dbName, storeName, indexName) {
    const request = indexedDB.open(dbName);

    request.onsuccess = (event) => {
        const db = event.target.result;

        if (db.objectStoreNames.contains(storeName)) {
            const transaction = db.transaction(storeName, 'readonly');
            const objectStore = transaction.objectStore(storeName);

            if (objectStore.indexNames.contains(indexName)) {
                console.log(`Index "${indexName}" exists on store "${storeName}".`);
            } else {
                console.warn(`Index "${indexName}" does NOT exist on store "${storeName}".`);
            }
        } else {
            console.error(`Store "${storeName}" does not exist in the database.`);
        }

        db.close();
    };

    request.onerror = (event) => {
        console.error('Error opening database for verification:', event.target.error);
    };
}

// Usage
// verifyIndex(dbName, 'sales', 'year');


const storeUpdates = [
    {
        store: 'sold',
        addIndexes: [
            {
                name: 'hsn',
                keyPath: 'hsn',
                unique: false
            },
            {
                name: 'category',
                keyPath: 'category',
                unique: false
            }
        ],
        deleteIndexes: [] // No indexes to delete
    }
];
// log(storeId);
// updateIndexDB(storeId, storeUpdates);
