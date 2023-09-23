// ordavid israelov 209271774
// binyamin haimov 314750704
class idb {
    constructor(db) {
        this.db = db;
    }
    static openCostsDB(dbname, version) {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(dbname, version);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('costs')) {
                    const objectStore = db.createObjectStore('costs', {keyPath: 'id', autoIncrement: true});
                    objectStore.createIndex('date', 'date', {unique: false}); // Create the 'date' index
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                resolve(new idb(db)); // Create an instance of idb with the opened database.
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

// Function to add a new cost to the IndexedDB
    addCost(cost) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['costs'], 'readwrite');
            const store = transaction.objectStore('costs');

            const request = store.add(cost);

            request.onsuccess = () => {
                resolve('Cost added!');
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    getCostsByDate(searchDate) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['costs'], 'readonly');
                const store = transaction.objectStore('costs');
                const index = store.index('date'); // Use the 'date' index
                const costs = [];

                // Define a lower and upper bound for the key range to filter by month.
                const [year, month] = searchDate.split('-');
                const intYear = parseInt(year);
                const intMonth = parseInt(month);
                // Open a cursor on the index with a key range for the specific year and month.
                const keyRangeStart = `${intYear}-${intMonth.toString().padStart(2, '0')}-01`;
                const nextMonth = intMonth === 12 ? 1 : intMonth + 1;
                const nextYear = intMonth === 12 ? intYear + 1 : intYear;
                const keyRangeEnd = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;

                const cursorRequest = index.openCursor(IDBKeyRange.bound(keyRangeStart, keyRangeEnd, false, true));


                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const rowData = cursor.value;
                        costs.push(rowData);

                        // Move to the next row.
                        cursor.continue();
                    } else {
                        // No more rows, resolve with the filtered rows.
                        resolve(costs);
                    }
                };

                cursorRequest.onerror = (event) => {
                    console.log(event);
                    reject(event.target.error);
                };
            });
        }
}



