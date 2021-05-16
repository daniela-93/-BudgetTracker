let db;
const request = indexedDB.open('budget_tracker',1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;

    db.createObjectStore('budget_tracker', {autoIncrement: true})
}

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        uploadData();
    }
}

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    const transaction = db.transaction(['budget_tracker'], 'readwrite');

    const dataObjectStore = transaction.objectStore('budget_tracker');

    dataObjectStore.add(record)
}


function uploadData() {
    const transaction = db.transaction(['budget_tracker'], 'readwrite');

    const dataObjectStore = transaction.objectStore('budget_tracker');

    const getAll = dataObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(['budget_tracker'], 'readwrite');

                const dataObjectStore = transaction.objectStore('budget_tracker');

                dataObjectStore.clear();

                alert('All saved financial info has been saved');
            })
            .catch(err => {
                console.log(err);
            })
        }
    };
}

window.addEventListener('online', uploadData);
