const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const fs = require('fs');
const path = require('path');

const app = new Koa();
const router = new Router();

function applySorting(data, sortKey, sortDirection) {
    data.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) {
            return sortDirection === 'asc' ? -1 : 1;
        }
        if (a[sortKey] > b[sortKey]) {
            return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:3001', // Allow only requests from this origin
}));

const rowsLoadFirst = 5;
const numberRowsToLoad = 2;
const filePath = path.join(__dirname, 'airplanes.json');
const jsonData = fs.readFileSync(filePath, 'utf-8');
const AllData = JSON.parse(jsonData);

let dataToShow = AllData.slice(0, rowsLoadFirst);
let dataToShowFilter = []

let currentIndex = rowsLoadFirst; // Initialize currentIndex after initial load
let currentSortKey = null; // To store the current sort key
let currentSortDirection = null; // To store the current sort direction

router.get('/airplanes/initial', (ctx) => {
    ctx.body = {
        AllDataLength: AllData.length,
        allRows: AllData,
    };
});

router.get('/airplanes', async (ctx) => {
    try {
        const sortLabelRef = ctx.query.sortLabelRef === 'true';
        const loadingRef = ctx.query.loadingRef === 'true';
        const isFilterModeRef = ctx.query.isFilterModeRef === 'true';
        const filterValues = JSON.parse(ctx.query.filterValues || '{}'); // Ensure filterValues is parsed correctly
        const sortKey = ctx.query.sortKey;
        const sortDirection = ctx.query.sortDirection;

        // If new sorting is applied, update the sort state
        console.log('sortLabelRef1',sortLabelRef)
        if (sortKey && sortDirection && sortLabelRef) {
            currentSortKey = sortKey;
            currentSortDirection = sortDirection;
            if(isFilterModeRef){
                applySorting(dataToShowFilter, sortKey, sortDirection)
            }
            else {
                applySorting(dataToShow, sortKey, sortDirection)
            }
        }

        // If filter mode is enabled, filter the data
        if (isFilterModeRef) {
            dataToShowFilter = [...dataToShowFilter]
            console.log('dataToShowFilter0',dataToShowFilter)
            dataToShowFilter = AllData.filter(row => {
                return Object.entries(filterValues).every(([key, values]) => {
                    return values.length === 0 || values.includes(row[key]);
                });
            });

            // Apply sorting to the filtered data if sorting is specified
            if (currentSortKey && currentSortDirection && sortLabelRef) {
                applySorting(dataToShowFilter, currentSortKey, currentSortDirection)
                console.log('dataToShowFilter1',dataToShowFilter)

            }
            console.log('dataToShowFilter2',dataToShowFilter)

        } else {
            // If loading more rows (scrolling) and not in filter mode
            if (loadingRef && currentIndex <= AllData.length) {
                const delay = 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                const newRows = AllData.slice(currentIndex, currentIndex + numberRowsToLoad);
                dataToShow = [...dataToShow, ...newRows];
                currentIndex += numberRowsToLoad; // Update the index for the next load

                // Apply sorting to the loaded data if sorting is specified
                if (currentSortKey && currentSortDirection) {
                    applySorting(dataToShow, currentSortKey, currentSortDirection)
                }
            }
        }
        if (isFilterModeRef) {
            ctx.body = {
                data: dataToShowFilter,
                currentIndex: currentIndex,
            };
        } else {
            ctx.body = {
                data: dataToShow,
                currentIndex: currentIndex,
            };
        }


    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: 'Failed to read data',
        };
    }
});

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
