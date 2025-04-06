
// ORIGINAL CLASS
class IndexedDB {
    constructor(dbName, storeName, storeConfig = { options: { keyPath: 'id', autoIncrement: true }, indexes: [] }) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.storeConfig = storeConfig;
        this.db = null;
        this.dbReady = this.initDB();
    }

    async initDB() {
        try {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName);

                request.onerror = (event) => {
                    console.error("Error opening IndexedDB:", event.target.errorCode);
                    reject(event.target.errorCode);
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    if (this.db.objectStoreNames.contains(this.storeName)) {
                        resolve(this.db);
                    } else {
                        this.db.close();
                        this.upgradeDB(resolve, reject);
                    }
                };

                request.onupgradeneeded = (event) => {
                    this.db = event.target.result;
                    this.upgradeDB(resolve, reject);
                };
            });
        } catch (error) {
            console.error("Error initializing IndexedDB:", error);
        }
    }

    async upgradeDB(resolve, reject) {
        // const version = this.db.version ? parseInt(this.db.version, 10) + 1 : 1;
        const version = this.db.version + 1; //console.log(version);
        const request = indexedDB.open(this.dbName, version);

        request.onerror = (event) => {
            console.error("Error upgrading IndexedDB:", event.target.errorCode);
            reject(event.target.errorCode);
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log("IndexedDB upgraded successfully:", this.dbName);
            resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
            this.db = event.target.result;
            if (!this.db.objectStoreNames.contains(this.storeName)) {
                console.log(`Creating object store "${this.storeName}"`);
                const objectStore = this.db.createObjectStore(this.storeName, this.storeConfig.options);

                // Create indexes
                this.storeConfig.indexes.forEach(index => {
                    objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
                });
            }
        };
    }

    async add(data) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);

                let request;
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        request = store.add(item);
                        request.onsuccess = () => console.log(`Added item with id: ${item.id}`);
                        request.onerror = (event) => {
                            console.error(`Error adding item: ${event.target.errorCode}`);
                            reject(event.target.errorCode);
                        };
                    });
                } else {
                    request = store.add(data);
                    request.onsuccess = () => console.log(`Added item with id: ${data.id}`);
                    request.onerror = (event) => {
                        console.error(`Error adding item: ${event.target.errorCode}`);
                        reject(event.target.errorCode);
                    };
                }

                transaction.oncomplete = () => {
                    resolve('Transaction completed: all data added.');
                };

                transaction.onerror = (event) => {
                    console.error(`Transaction error: ${event.target.errorCode}`);
                    reject(event.target.errorCode);
                };
            });
        } catch (error) {
            console.error("Error adding data:", error);
        }
    }

    async delete(id) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);

                const request = store.delete(id);
                request.onsuccess = () => {
                    console.log(`Item with id ${id} deleted successfully.`);
                    resolve(`Item with id ${id} deleted successfully.`);
                };

                request.onerror = (event) => {
                    console.error(`Error deleting item: ${event.target.errorCode}`);
                    reject(`Error deleting item: ${event.target.errorCode}`);
                };
            });
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    }

    async put(data) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);

                let request;
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        request = store.put(item);
                        // request.onsuccess = () => console.log(`Updated item with id: ${item.id}`);
                        request.onerror = (event) => {
                            console.error(`Error updating item: ${event.target.errorCode}`);
                            reject(event.target.errorCode);
                        };
                    });
                } else {
                    request = store.put(data);
                    request.onsuccess = () => console.log(`Updated item with id: ${data.id}`);
                    request.onerror = (event) => {
                        console.error(`Error updating item: ${event.target.errorCode}`);
                        reject(event.target.errorCode);
                    };
                }

                transaction.oncomplete = () => {
                    resolve('Transaction completed: all data updated.');
                };

                transaction.onerror = (event) => {
                    console.error(`Transaction error: ${event.target.errorCode}`);
                    reject(event.target.errorCode);
                };
            });
        } catch (error) {
            console.error("Error putting data:", error);
        }
    }

    async get(id) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);

                const request = store.get(id);
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };

                request.onerror = (event) => {
                    console.error(`Error getting data: ${event.target.errorCode}`);
                    reject(event.target.errorCode);
                };
            });
        } catch (error) {
            console.error("Error getting data:", error);
        }
    }

    async search(indexName, key) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const index = store.index(indexName);
                const request = index.get(key);
                let result = [];
                request.onsuccess = (event) => {
                    if (event.target.result) result.push(event.target.result);
                    resolve(result);
                };

                request.onerror = (event) => {
                    reject(event.target.errorCode);
                };
            });
        } catch (error) {
            log(error);
        }
    }

    async searchByKey(key, indexes) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const results = [];
                const uniqueIds = new Set();

                let pendingIndexes = indexes.length;
                indexes.forEach((indexName) => {
                    const index = store.index(indexName);
                    const request = index.openCursor();

                    request.onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor) {
                            const value = cursor.value[indexName].toString();
                            // if (value.includes(key)) {
                            //     results.push(cursor.value);
                            // }
                            if (value.includes(key) && !uniqueIds.has(cursor.value.id)) {
                                results.push(cursor.value);
                                uniqueIds.add(cursor.value.id);
                            }
                            cursor.continue();
                        } else {
                            pendingIndexes--;
                            if (pendingIndexes === 0) {
                                resolve(results);
                            }
                        }
                    };

                    request.onerror = (event) => {
                        reject(event.target.errorCode);
                    };
                });
            });
        } catch (error) {
            log(error);
        }
    }

    async maxId() {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);

                // Check if the 'id' index exists
                console.log(store.indexNames);
                if (!store.indexNames.contains('id')) {
                    console.log(`Index 'id' does not exist.`);
                    resolve(null);
                    return;
                }

                const index = store.index('id');
                const request = index.openCursor(null, 'prev'); // Open cursor in reverse order

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        resolve(cursor.value.id); // Return the ID of the last item
                    } else {
                        resolve(null); // No data in the store
                    }
                };

                request.onerror = (event) => {
                    console.error(`Error getting max ID: ${event.target.errorCode}`);
                    reject(event.target.errorCode);
                };
            });
        } catch (error) {
            console.error("Error getting max ID:", error);
            return null; // Ensure that null is returned on error
        }
    }

    async all() {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);

                const request = store.getAll();
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };

                request.onerror = (event) => {
                    console.error(`Error getting all data: ${event.target.errorCode}`);
                    reject(event.target.errorCode);
                };
            });
        } catch (error) {
            console.error("Error getting all data:", error);
        }
    }

    async getDataByColumns(columns, where = {}) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);

                let results = [];

                store.openCursor().onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        let match = true;
                        for (const [key, value] of Object.entries(where)) {
                            if (cursor.value[key] !== value) {
                                match = false;
                                break;
                            }
                        }
                        if (match) {
                            let result = {};
                            for (const column of columns) {
                                result[column] = cursor.value[column];
                            }
                            results.push(result);
                        }
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };

                store.openCursor().onerror = (event) => {
                    reject(event.target.errorCode);
                };
            });
        } catch (error) {
            console.error("Error getting data by columns:", error);
        }
    }

    // const columns = ['id', 'product', 'sku'];
    // const where = {
    //     pcode: 'pcode1',
    //     ean: 'ean1'
    // };

    async clear() {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);

                const request = store.clear();
                request.onsuccess = () => {
                    console.log("All data cleared.");
                    resolve('All data cleared.');
                };

                request.onerror = (event) => {
                    console.error(`Error clearing data: ${event.target.errorCode}`);
                    reject(event.target.errorCode);
                };
            });
        } catch (error) {
            console.error("Error clearing data:", error);
        }
    }

    async closeConnection() {
        if (this.db) {
            this.db.close();
            console.log(`Connection to database "${this.dbName}" closed.`);
        } else {
            console.log(`No open connection to database "${this.dbName}" found.`);
        }
    }

    async deleteStore() {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.db.version + 1); // Increment version for upgrade

                request.onerror = (event) => {
                    console.error("Error opening IndexedDB for deletion:", event.target.errorCode);
                    reject(event.target.errorCode);
                };

                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(['storeName'], 'readwrite');

                    // Check if the store exists
                    if (db.objectStoreNames.contains(this.storeName)) {
                        db.deleteObjectStore(this.storeName); // Delete the store
                        transaction.oncomplete = () => {
                            console.log(`Object store "${this.storeName}" deleted successfully.`);
                            resolve(`Object store "${this.storeName}" deleted successfully.`);
                        };

                        transaction.onerror = (event) => {
                            console.error(`Transaction error while deleting store: ${event.target.errorCode}`);
                            reject(event.target.errorCode);
                        };
                    } else {
                        console.warn(`Object store "${this.storeName}" does not exist.`);
                        resolve(`Object store "${this.storeName}" does not exist.`);
                    }
                };

                request.onupgradeneeded = (event) => {
                    // Upgrade needed event: this will be triggered if a new version is detected
                    const db = event.target.result;
                    if (db.objectStoreNames.contains(this.storeName)) {
                        db.deleteObjectStore(this.storeName); // Delete the store
                    }
                };
            });
        } catch (error) {
            console.error("Error deleting store:", error);
        }
    }

    static async deleteStore(dbName, storeName) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (db.objectStoreNames.contains(storeName)) {
                    db.deleteObjectStore(storeName);
                    console.log(`Object store "${storeName}" deleted successfully.`);
                }
            };

            request.onsuccess = (event) => {
                event.target.result.close();
                resolve(`Object store "${storeName}" deleted successfully.`);
            };

            request.onerror = (event) => {
                reject(`Error deleting object store "${storeName}": ${event.target.errorCode}`);
            };
        });
    }
}

// // Example usage to add MySQL data to IndexedDB:
// (async () => {
//     try {
//         const db = new IndexedDB('localdata', 'stock', {
//             options: { keyPath: 'id', autoIncrement: true },
//             indexes: [
//                 { name: 'sku', keyPath: 'sku', unique: true },
//                 { name: 'ean', keyPath: 'ean', unique: false },
//                 { name: 'product', keyPath: 'product', unique: false },
//                 { name: 'pcode', keyPath: 'pcode', unique: false }
//             ]
//         });

//         await db.dbReady;

//         // Assuming res.data is an array of stock items fetched from MySQL
//         const res = {
//             data: [
//                 { id: 1, sku: 'sku1', ean: 'ean1', product: 'product1', pcode: 'pcode1' },
//                 // Add more items as needed
//             ]
//         };

//         await db.addData(res.data);
//         console.log('MySQL data added to IndexedDB successfully');
//     } catch (error) {
//         console.error('Error:', error);
//     }
// })();

export default IndexedDB;
