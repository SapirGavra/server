import { isEmpty, applySorting, filterDataByRange,currentRowsFilters } from './Utils/functions/functions.js';
import Koa from 'koa';
import Router from 'koa-router';
import cors from '@koa/cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const app = new Koa();
const router = new Router();

app.use(cors({
    origin: 'http://localhost:3001',
}));

const rowsLoadFirst = 5;
const numberRowsToLoad = 2;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'Utils/assets/airplanes.json');
const jsonData = fs.readFileSync(filePath, 'utf-8');
const AllData = JSON.parse(jsonData);


let dataToShow = AllData.slice(0, rowsLoadFirst);
let dataToShowFilter = null;
let isCurrentRowsAmountRef = rowsLoadFirst;
let currentSortKey = null;
let currentSortDirection = null;

router.get('/airplanes/initial', (ctx) => {
    ctx.body = {
        isAllRowsAmountRef: AllData.length,
        isAllRowsAmountColumnRef: AllData,
    };
});

router.get('/airplanes', async (ctx) => {
    try {
        const minRange = ctx.query.minSize
        const maxRange = ctx.query.maxSize
        const selectedKey = ctx.query.keySize

        const minSize = parseFloat(minRange);
        const maxSize = parseFloat(maxRange);


        const isSoredRef = ctx.query.isSoredRef === 'true';
        const isLoadingRef = ctx.query.isLoadingRef === 'true';
        const isFilterModeRef = ctx.query.isFilterModeRef === 'true';
        const isFilterModeRangeRef = ctx.query.isFilterModeRangeRef === 'true';

        const filterValues = ctx.query.filterValues ? JSON.parse(ctx.query.filterValues) : {};
        const sortKey = ctx.query.sortKey;
        const sortDirection = ctx.query.sortDirection;



console.log('currentRowsFilters',currentRowsFilters)

        if (sortKey && sortDirection && isSoredRef) {
            currentSortKey = sortKey;
            currentSortDirection = sortDirection;
            applySorting(AllData, sortKey, sortDirection);
            dataToShow = AllData.slice(0, isCurrentRowsAmountRef);

            if (isFilterModeRef) {
                dataToShowFilter = dataToShowFilter.slice(0, isCurrentRowsAmountRef);
                applySorting(dataToShowFilter, sortKey, sortDirection);
            }
        }
        if (isFilterModeRef && !isEmpty(filterValues)) {
            dataToShowFilter = AllData.filter(row => {
                return Object.entries(filterValues).every(([key, values]) => {
                    return values.length === 0 || values.includes(row[key]);
                });
            });

        }

        if (isFilterModeRangeRef && selectedKey === "size" ) {
            dataToShowFilter = filterDataByRange(AllData, minSize, maxSize);

            dataToShowFilter = AllData.filter(row => {
                    const size = parseFloat(row.size);
                    return size >= minSize && size <= maxSize;

                });
        }

        if (currentSortKey && currentSortDirection) {
            applySorting(dataToShowFilter, currentSortKey, currentSortDirection);
        }




        console.log('Filtered data by size:', dataToShowFilter);

        if (!isSoredRef && isLoadingRef && isCurrentRowsAmountRef < AllData.length) {
            const delay = 1000;
            await new Promise(resolve => setTimeout(resolve, delay));

            const newRows = AllData.slice(isCurrentRowsAmountRef, isCurrentRowsAmountRef + numberRowsToLoad);
            dataToShow = [...dataToShow, ...newRows];
            isCurrentRowsAmountRef += numberRowsToLoad;
        }

        ctx.body = {
            data: isFilterModeRef || isFilterModeRangeRef ? dataToShowFilter : dataToShow,
            isCurrentRowsAmountRef: isCurrentRowsAmountRef,
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