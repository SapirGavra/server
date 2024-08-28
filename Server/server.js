const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const fs = require('fs');
const path = require('path');

const app = new Koa();
const router = new Router();

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

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

app.use(cors({
    origin: 'http://localhost:3001',
}));

const rowsLoadFirst = 5;
const numberRowsToLoad = 2;
const filePath = path.join(__dirname, 'airplanes.json');
const jsonData = fs.readFileSync(filePath, 'utf-8');
const AllData = JSON.parse(jsonData);

let dataToShow = AllData.slice(0, rowsLoadFirst);
let dataToShowFilter = [];

let currentIndex = rowsLoadFirst;
let currentSortKey = null;
let currentSortDirection = null;

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
        const filterValues = JSON.parse(ctx.query.filterValues || '{}');
        const sortKey = ctx.query.sortKey;
        const sortDirection = ctx.query.sortDirection;

        if (sortKey && sortDirection && sortLabelRef) {
            currentSortKey = sortKey;
            currentSortDirection = sortDirection;
            if (isFilterModeRef) {
                applySorting(dataToShowFilter, sortKey, sortDirection);
            } else {
                applySorting(dataToShow, sortKey, sortDirection);
            }
        }

        if (isFilterModeRef) {
            if (!isEmpty(filterValues)) {
                dataToShowFilter = AllData.filter(row => {
                    return Object.entries(filterValues).every(([key, values]) => {
                        return values.length === 0 || values.includes(row[key]);
                    });
                });

                // Apply sorting to the filtered data after filtering
                if (currentSortKey && currentSortDirection) {
                    applySorting(dataToShowFilter, currentSortKey, currentSortDirection);
                }
            }

        } else {
            if (loadingRef && currentIndex <= AllData.length) {
                const delay = 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                const newRows = AllData.slice(currentIndex, currentIndex + numberRowsToLoad);
                dataToShow = [...dataToShow, ...newRows];
                currentIndex += numberRowsToLoad;

                if (currentSortKey && currentSortDirection) {
                    applySorting(dataToShow, currentSortKey, currentSortDirection);
                }
            }
        }

        ctx.body = {
            data: isFilterModeRef ? dataToShowFilter : dataToShow,
            currentIndex: currentIndex,
        };

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
