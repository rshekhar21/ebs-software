import { advanceQuery, log } from "./help.js";


let db;

function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('stockDatabase', 1);

        request.onupgradeneeded = function (event) {
            db = event.target.result;
            const objectStore = db.createObjectStore('stocks', { keyPath: 'id' });
            objectStore.createIndex('sku', 'sku', { unique: true });
            objectStore.createIndex('ean', 'ean', { unique: false });
            objectStore.createIndex('pcode', 'pcode', { unique: false });
            objectStore.createIndex('product', 'product', { unique: false });

            // Normalized indexes for case-insensitive searches
            objectStore.createIndex('pcode_lowercase', 'pcode_lowercase', { unique: false });
            objectStore.createIndex('product_lowercase', 'product_lowercase', { unique: false });
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = function (event) {
            reject('IndexedDB error:', event.target.errorCode);
        };
    });
}




async function fetchAndStoreStockData() {
    try {
        let res = await advanceQuery({ key: 'loadStockForSearch' });
        // const data = res.data.map(item => ({
        //     ...item,
        //     pcode_lowercase: item.pcode.toLowerCase(),
        //     product_lowercase: item.product.toLowerCase()
        // }));
        let data = res.data;
        const transaction = db.transaction(['stocks'], 'readwrite');
        const objectStore = transaction.objectStore('stocks');
        data.forEach(stock => {
            objectStore.put(stock);
        });
    } catch (error) {
        console.error('Fetch error:', error);
    }
}



async function initializeIndexedDB() {
    try {
        await initIndexedDB();
        // await fetchAndStoreStockData();
        // const data = await listAllStockData();
        // console.log('All stock data:', data);
    } catch (error) {
        console.error(error);
    }
}

// initializeIndexedDB();

export async function loadStokDataInIndexdb() {
    try {
        await initIndexedDB();
        await fetchAndStoreStockData();
    } catch (error) {
        log(error);
    }
}

export async function loadStockDataFromIndexDB() {
    try {
        await initIndexedDB();
        const data = await listAllStockData();
        return data;
    } catch (error) {
        log(error);
    }
}

export async function laodSKUfromIndexDB(sku) {
    try {
        await initIndexedDB();
        const data = await scanSKU(sku);
        return data;
    } catch (error) {
        log(error);
        return false;
    }
}

export async function searchStockFromIndexDB(val) {
    try {
        await initIndexedDB();
        const data = await searchStock(val);
        return data;
    } catch (error) {
        log(error);
        return false;
    }
}

export function getStockData(stockId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stocks'], 'readonly');
        const objectStore = transaction.objectStore('stocks');
        const request = objectStore.get(stockId);

        request.onsuccess = async function (event) {
            if (request.result) {
                resolve(request.result);
            } else {
                try {
                    let res = await advanceQuery({ key: 'stock' });
                    const data = res.data.find(stock => stock.id === stockId);

                    if (data) {
                        // Store fetched data in IndexedDB
                        const tx = db.transaction(['stocks'], 'readwrite');
                        const store = tx.objectStore('stocks');
                        store.put(data);
                        resolve(data);
                    } else {
                        reject('Stock not found');
                    }
                } catch (error) {
                    reject(error);
                }
            }
        };

        request.onerror = function (event) {
            reject('IndexedDB error:', event.target.errorCode);
        };
    });
}

export function listAllStockData() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stocks'], 'readonly');
        const objectStore = transaction.objectStore('stocks');
        const request = objectStore.getAll();

        request.onsuccess = function (event) {
            resolve(request.result);
        };

        request.onerror = function (event) {
            reject('IndexedDB error:', event.target.errorCode);
        };
    });
}

function scanSKU(val) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stocks'], 'readonly');
        const objectStore = transaction.objectStore('stocks');

        let results = [];

        // Using a cursor to match both sku and ean
        const skuIndex = objectStore.index('sku');
        const eanIndex = objectStore.index('ean');

        const skuRequest = skuIndex.openCursor(IDBKeyRange.bound(val, val + '\uffff'));
        const eanRequest = eanIndex.openCursor(IDBKeyRange.bound(val, val + '\uffff'));

        skuRequest.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                results.push(cursor.value);
                cursor.continue();
            }
        };

        eanRequest.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                results.push(cursor.value);
                cursor.continue();
            }
        };

        transaction.oncomplete = function () {
            resolve(results);
        };

        transaction.onerror = function (event) {
            reject('IndexedDB error:', event.target.errorCode);
        };
    });
}

function searchStock(val) {
    val = val.toLowerCase(); // Normalize query value to lowercase

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stocks'], 'readonly');
        const objectStore = transaction.objectStore('stocks');

        let results = [];
        let seenIds = new Set(); // To track unique IDs

        // Using cursors to match sku, pcode, and product using normalized indexes
        const skuIndex = objectStore.index('sku');
        const pcodeIndex = objectStore.index('pcode_lowercase');
        const productIndex = objectStore.index('product_lowercase');

        const skuRequest = skuIndex.openCursor(IDBKeyRange.bound(val, val + '\uffff'));
        const pcodeRequest = pcodeIndex.openCursor(IDBKeyRange.bound(val, val + '\uffff'));
        const productRequest = productIndex.openCursor(IDBKeyRange.bound(val, val + '\uffff'));

        skuRequest.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                if (!seenIds.has(cursor.value.id)) {
                    results.push(cursor.value);
                    seenIds.add(cursor.value.id);
                }
                cursor.continue();
            }
        };

        pcodeRequest.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                if (!seenIds.has(cursor.value.id)) {
                    results.push(cursor.value);
                    seenIds.add(cursor.value.id);
                }
                cursor.continue();
            }
        };

        productRequest.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                if (!seenIds.has(cursor.value.id)) {
                    results.push(cursor.value);
                    seenIds.add(cursor.value.id);
                }
                cursor.continue();
            }
        };

        transaction.oncomplete = function () {
            resolve(results);
        };

        transaction.onerror = function (event) {
            reject('IndexedDB error:', event.target.errorCode);
        };
    });
}





