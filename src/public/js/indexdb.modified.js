// MODIFIED CLASS
class IndexedDB1 {
    constructor(dbName, storeName = null, storeConfig = []) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.storeConfig = storeConfig;
        this.db = null;
        this.dbReady = this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName);

            request.onerror = (event) => {
                console.log("Error opening IndexedDB:", event.target.errorCode);
                reject(event.target.errorCode);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                if (this.db.objectStoreNames.contains(this.storeName)) {
                    resolve(this.db);
                } else {
                    resolve(this.db);
                }
            };

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
            };
        });
    }

    async add(data, table = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);

                let request;
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        request = store.add(item);
                        // request.onsuccess = () => console.log(`Added item with id: ${item.id}`);
                        request.onerror = (event) => {
                            console.error(`Error adding item: ${event.target.errorCode}`);
                            reject(event.target.errorCode);
                        };
                    });
                } else {
                    request = store.add(data);
                    // request.onsuccess = () => console.log(`Data Added Successfully`);
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

    async delete(id, table = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);

                const request = store.delete(Number(id));
                request.onsuccess = () => {
                    // console.log(`Item with id ${id} deleted successfully.`);
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
    
    async deleteByIndexKey(indexKey, indexName, table = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) {
                    return reject(`Store ${storeName} does not exist.`);
                }
                
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const index = store.index(indexName);
    
                const cursorRequest = index.openCursor(IDBKeyRange.only(Number(indexKey)));
    
                let deletedCount = 0;
    
                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        cursor.delete();  // Delete the record pointed to by the cursor
                        deletedCount++;
                        cursor.continue();  // Continue to the next matching record
                    } else {
                        resolve(`Deleted ${deletedCount} records with ${indexName} = ${indexKey}.`);
                    }
                };
    
                cursorRequest.onerror = (event) => {
                    console.error(`Error deleting items: ${event.target.errorCode}`);
                    reject(`Error deleting items: ${event.target.errorCode}`);
                };
            });
        } catch (error) {
            console.error("Error deleting data by index key:", error);
        }
    }
    // this functin can check with index key type numerb/string
    async deleteByIndexKeySmartCheck(indexKey, indexName, table = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) {
                    return reject(`Store ${storeName} does not exist.`);
                }
                
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const index = store.index(indexName);
    
                // Convert to Number if it's a numeric string, otherwise keep it as is
                const processedKey = isNaN(Number(indexKey)) ? indexKey : Number(indexKey);
    
                const cursorRequest = index.openCursor(IDBKeyRange.only(processedKey));
    
                let deletedCount = 0;
    
                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        cursor.delete();  // Delete the record pointed to by the cursor
                        deletedCount++;
                        cursor.continue();  // Continue to the next matching record
                    } else {
                        resolve(`Deleted ${deletedCount} records with ${indexName} = ${processedKey}.`);
                    }
                };
    
                cursorRequest.onerror = (event) => {
                    console.error(`Error deleting items: ${event.target.errorCode}`);
                    reject(`Error deleting items: ${event.target.errorCode}`);
                };
            });
        } catch (error) {
            console.error("Error deleting data by index key:", error);
        }
    } 
    
    async put(data, table = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);

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
                    // request.onsuccess = () => {console.log(`Updated item with id: ${data.id}`);}
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

    async get(id, table = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                let result = []
                const request = store.get(Number(id));
                request.onsuccess = (event) => {
                    result.push(event.target.result);
                    resolve(result);
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
    // New method to get the maximum ID
    async getMaxId(table = null) {
        await this.dbReady;
        try {
          return new Promise((resolve, reject) => {
            let storeName = table || this.storeName;
            if (!this.db.objectStoreNames.contains(storeName)) return;
    
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
    
            // Check if the id index exists (assuming 'id' is your primary key)
            const indexExists = store.indexNames.contains('id');
    
            if (indexExists) {
              const index = store.index('id');
              const keyRange = IDBKeyRange.upperBound(Number.MAX_SAFE_INTEGER);
              const cursorRequest = index.openCursor(keyRange, 'prev');
    
              cursorRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                  const maxId = cursor.key;
                  resolve(maxId);
                } else {
                  resolve(null); // No data in the store
                }
              };
    
              cursorRequest.onerror = (event) => {
                console.error('Error retrieving maximum ID:', event.target.error);
                reject(event.target.error);
              };
            } else {
              console.warn('No index on "id" field. Retrieving max ID might be slow.');
              // If no index exists, iterate through all records (potentially slow)
              const getAllRequest = store.getAll();
              let maxId = null;
              getAllRequest.onsuccess = (event) => {
                const result = event.target.result;
                for (const item of result) {
                  if (maxId === null || item.id > maxId) {
                    maxId = item.id;
                  }
                }
                resolve(maxId);
              };
    
              getAllRequest.onerror = (event) => {
                console.error('Error retrieving data:', event.target.error);
                reject(event.target.error);
              };
            }
          });
        } catch (error) {
          console.error("Error getting max ID:", error);
        }
    }

    async getLastObj(table = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
            let storeName = table || this.storeName;
            if (!this.db.objectStoreNames.contains(storeName)) return;

            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);

            const keyRange = IDBKeyRange.upperBound(Number.MAX_SAFE_INTEGER);
            const cursorRequest = store.openCursor(keyRange, 'prev');

            cursorRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                resolve(cursor.value);
                } else {
                resolve(null); // No data in the store
                }
            };

            cursorRequest.onerror = (event) => {
                console.error('Error retrieving last object:', event.target.error);
                reject(event.target.error);
            };
            });
        } catch (error) {
            console.error("Error getting last object:", error);
        }
    }

    async search(indexName, key, table = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
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

    async searchByKey_(key, indexes, table = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
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

    async searchByKey({ key, indexes, table = null, limit = 50 }) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const results = [];
                const uniqueIds = new Set();
                const maxResults = limit;  // Set the limit to 50 records

                let pendingIndexes = indexes.length;
                indexes.forEach((indexName) => {
                    const index = store.index(indexName);
                    const request = index.openCursor();

                    request.onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor && results.length < maxResults) {
                            const value = cursor.value[indexName].toString().toLowerCase(); //console.log(value);
                            if (value.includes(key.toLowerCase()) && !uniqueIds.has(cursor.value.id)) {
                                results.push(cursor.value);
                                uniqueIds.add(cursor.value.id);
                            }
                            cursor.continue();
                        } else {
                            pendingIndexes--;
                            if (pendingIndexes === 0 || results.length >= maxResults) {
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

    async maxId(table = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);

                // Check if the 'id' index exists
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

    async all(table = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);

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
   
    // rename: { 'payments': 'pymts' }
    async getColumns({
        table = null,
        key = null,
        indexes = [],
        columns = [],
        rename = {},
        limit = null,
        sortby = null,
        sortOrder = 'asc',
        where = {},
        hidecols = []
    } = {}) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;
    
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
    
                const results = [];
                const uniqueIds = new Set();
                let pendingIndexes = indexes.length;
    
                const matchesWhere = (record) => {
                    return Object.entries(where).every(([field, value]) => {
                        const recordValue = record[field];
                    
                        // Convert string numeric values to numbers for comparison
                        if (typeof recordValue === 'number') {
                            return Number(value) === recordValue;
                        }
                    
                        // Convert number values to strings for comparison
                        if (typeof recordValue === 'string' && !isNaN(value)) {
                            return String(value) === recordValue;
                        }
                    
                        return value === recordValue;
                    });
                };
    
                const includeAllColumns = columns.length === 0; // Flag to include all columns if `columns` is empty
    
                if (indexes.length > 0 && key !== null) {
                    indexes.forEach(indexName => {
                        const index = store.index(indexName);
                        const request = index.openCursor();
    
                        request.onsuccess = (event) => {
                            const cursor = event.target.result;
    
                            if (cursor && results.length < limit) {
                                const value = cursor.value[indexName].toString().toLowerCase();
                                key = String(key);
                                if (value.includes(key.toLowerCase()) && !uniqueIds.has(cursor.value.id)) {
                                    let record = cursor.value;
    
                                    if (matchesWhere(record)) {
                                        if (includeAllColumns) {
                                            // Include all columns except those in hidecols
                                            record = Object.keys(record).reduce((obj, col) => {
                                                if (!hidecols.includes(col)) {
                                                    const newColName = rename[col] || col;
                                                    obj[newColName] = record[col];
                                                }
                                                return obj;
                                            }, {});
                                        } else {
                                            // Include only specified columns, excluding those in hidecols
                                            record = columns.reduce((obj, col) => {
                                                if (record[col] !== undefined && !hidecols.includes(col)) {
                                                    const newColName = rename[col] || col;
                                                    obj[newColName] = record[col];
                                                }
                                                return obj;
                                            }, {});
                                        }
    
                                        results.push(record);
                                        uniqueIds.add(cursor.value.id);
                                    }
                                }
                                cursor.continue();
                            } else {
                                pendingIndexes--;
                                if (pendingIndexes === 0 || results.length >= limit) {
                                    resolve(results);
                                }
                            }
                        };
    
                        request.onerror = (event) => {
                            console.error(`Error getting data from index ${indexName}: ${event.target.errorCode}`);
                            reject(event.target.errorCode);
                        };
                    });
                } else {
                    let request;
                    if (sortby) {
                        const index = store.index(sortby);
                        request = index.openCursor(null, sortOrder === 'asc' ? 'next' : 'prev');
                    } else {
                        request = store.openCursor();
                    }
    
                    request.onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor) {
                            let record = cursor.value;
    
                            if (matchesWhere(record)) {
                                if (includeAllColumns) {
                                    // Include all columns except those in hidecols
                                    record = Object.keys(record).reduce((obj, col) => {
                                        if (!hidecols.includes(col)) {
                                            const newColName = rename[col] || col;
                                            obj[newColName] = record[col];
                                        }
                                        return obj;
                                    }, {});
                                } else {
                                    // Include only specified columns, excluding those in hidecols
                                    record = columns.reduce((obj, col) => {
                                        if (record[col] !== undefined && !hidecols.includes(col)) {
                                            const newColName = rename[col] || col;
                                            obj[newColName] = record[col];
                                        }
                                        return obj;
                                    }, {});
                                }
    
                                results.push(record);
    
                                if (limit && results.length >= limit) {
                                    resolve(results);
                                    return;
                                }
                            }
    
                            cursor.continue();
                        } else {
                            resolve(results);
                        }
                    };
    
                    request.onerror = (event) => {
                        console.error(`Error getting data: ${event.target.errorCode}`);
                        reject(event.target.errorCode);
                    };
                }
            });
        } catch (error) {
            console.error("Error getting data:", error);
        }
    }    
    
    async powerAll({ table = null, limit = 10, sortField = null, sortOrder = 'asc' }) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;

                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);

                let request;
                if (sortField) {
                    const index = store.index(sortField);
                    request = index.openCursor(null, sortOrder === 'asc' ? 'next' : 'prev');
                } else {
                    request = store.openCursor(null, sortOrder === 'asc' ? 'next' : 'prev');
                }

                const result = [];
                let count = 0;

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        result.push(cursor.value);
                        count++;
                        if (limit && count >= limit) {
                            resolve(result);
                            return;
                        }
                        cursor.continue();
                    } else {
                        resolve(result);
                    }
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

    async getDataByColumns(columns, table = null, where = {}) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);

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

    async clear(table = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = table || this.storeName; //console.log(storeName);
                if (!this.db.objectStoreNames.contains(storeName)) return;
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);

                const request = store.clear();
                request.onsuccess = () => {
                    // console.log("All data cleared.");
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

    async clearAll(tables = []) {
        await this.dbReady;
        if (!tables.length) return;
        try {
            return new Promise((resolve, reject) => {
                tables.forEach(tbl => {
                    if (this.db.objectStoreNames.contains(tbl)) {
                        const transaction = this.db.transaction([tbl], 'readwrite');
                        const store = transaction.objectStore(tbl);

                        const request = store.clear();
                        request.onsuccess = () => {
                            // console.log(`${tbl} data cleared`);
                        };

                        request.onerror = (event) => {
                            console.error(`Error clearing data: ${event.target.errorCode}`);
                            reject(event.target.errorCode);
                        };
                    }
                });
                resolve('All data cleared.');
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

    async deleteStore(store = null) {
        await this.dbReady;
        try {
            return new Promise((resolve, reject) => {
                let storeName = store || this.storeName;
                if (!this.db.objectStoreNames.contains(storeName)) return;
                const request = indexedDB.open(this.dbName, this.db.version + 1); // Increment version for upgrade

                request.onerror = (event) => {
                    console.error("Error opening IndexedDB for deletion:", event.target.errorCode);
                    reject(event.target.errorCode);
                };

                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(['storeName'], 'readwrite');

                    // Check if the store exists
                    if (db.objectStoreNames.contains(storeName)) {
                        db.deleteObjectStore(storeName); // Delete the store
                        transaction.oncomplete = () => {
                            // console.log(`Object store "${storeName}" deleted successfully.`);
                            resolve(`Object store "${storeName}" deleted successfully.`);
                        };

                        transaction.onerror = (event) => {
                            console.error(`Transaction error while deleting store: ${event.target.errorCode}`);
                            reject(event.target.errorCode);
                        };
                    } else {
                        console.warn(`Object store "${storeName}" does not exist.`);
                        resolve(`Object store "${storeName}" does not exist.`);
                    }
                };

                request.onupgradeneeded = (event) => {
                    // Upgrade needed event: this will be triggered if a new version is detected
                    const db = event.target.result;
                    if (db.objectStoreNames.contains(storeName)) {
                        db.deleteObjectStore(storeName); // Delete the store
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
                if (this.db.objectStoreNames.contains(storeName)) {
                    db.deleteObjectStore(storeName);
                    // console.log(`Object store "${storeName}" deleted successfully.`);
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

export default IndexedDB1


   // const columns = ['id', 'product', 'sku'];
    // const where = {
    //     pcode: 'pcode1',
    //     ean: 'ean1'
    // };



    // class MyIndexedDB {
    //     constructor(dbName, storeName) {
    //       this.dbName = dbName;
    //       this.storeName = storeName;
    //       this.dbReady = new Promise((resolve, reject) => {
    //         const request = indexedDB.open(this.dbName, 1);
      
    //         request.onerror = (event) => {
    //           console.error('Error opening IndexedDB:', event.target.error);
    //           reject(event.target.error);
    //         };
      
    //         request.onsuccess = (event) => {
    //           this.db = event.target.result;
    //           resolve();
    //         };
    //       });
    //     }
      
    //     async get(id, table = null) {
    //       await this.dbReady;
    //       try {
    //         return new Promise((resolve, reject) => {
    //           let storeName = table || this.storeName;
    //           if (!this.db.objectStoreNames.contains(storeName)) return;
      
    //           const transaction = this.db.transaction([storeName], 'readonly');
    //           const store = transaction.objectStore(storeName);
    //           let result = [];
    //           const request = store.get(Number(id));
      
    //           request.onsuccess = (event) => {
    //             result.push(event.target.result);
    //             resolve(result);
    //           };
      
    //           request.onerror = (event) => {
    //             console.error(`Error getting data: ${event.target.errorCode}`);
    //             reject(event.target.errorCode);
    //           };
    //         });
    //       } catch (error) {
    //         console.error("Error getting data:", error);
    //       }
    //     }
      
    //     // New method to get the maximum ID
    //     async getMaxId(table = null) {
    //       await this.dbReady;
    //       try {
    //         return new Promise((resolve, reject) => {
    //           let storeName = table || this.storeName;
    //           if (!this.db.objectStoreNames.contains(storeName)) return;
      
    //           const transaction = this.db.transaction([storeName], 'readonly');
    //           const store = transaction.objectStore(storeName);
      
    //           // Check if the id index exists (assuming 'id' is your primary key)
    //           const indexExists = store.indexNames.contains('id');
      
    //           if (indexExists) {
    //             const index = store.index('id');
    //             const keyRange = IDBKeyRange.upperBound(Number.MAX_SAFE_INTEGER);
    //             const cursorRequest = index.openCursor(keyRange, 'prev');
      
    //             cursorRequest.onsuccess = (event) => {
    //               const cursor = event.target.result;
    //               if (cursor) {
    //                 const maxId = cursor.key;
    //                 resolve(maxId);
    //               } else {
    //                 resolve(null); // No data in the store
    //               }
    //             };
      
    //             cursorRequest.onerror = (event) => {
    //               console.error('Error retrieving maximum ID:', event.target.error);
    //               reject(event.target.error);
    //             };
    //           } else {
    //             console.warn('No index on "id" field. Retrieving max ID might be slow.');
    //             // If no index exists, iterate through all records (potentially slow)
    //             const getAllRequest = store.getAll();
    //             let maxId = null;
    //             getAllRequest.onsuccess = (event) => {
    //               const result = event.target.result;
    //               for (const item of result) {
    //                 if (maxId === null || item.id > maxId) {
    //                   maxId = item.id;
    //                 }
    //               }
    //               resolve(maxId);
    //             };
      
    //             getAllRequest.onerror = (event) => {
    //               console.error('Error retrieving data:', event.target.error);
    //               reject(event.target.error);
    //             };
    //           }
    //         });
    //       } catch (error) {
    //         console.error("Error getting max ID:", error);
    //       }
    //     }
    //   }