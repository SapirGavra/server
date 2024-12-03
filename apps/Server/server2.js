import {
    filterDataByRange,loadMoreRows,
    filterDataByValue, applySorting
} from './Utils/functions/functions.js';
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

let currentData = AllData.slice(0, rowsLoadFirst);
let isCurrentRowsAmount = rowsLoadFirst;


router.get('/airplanes/initial', (ctx) => {
    ctx.body = {
        isAllRowsAmountRef: AllData.length,
        isAllRowsAmountColumnRef: AllData,
    };
});

router.get('/airplanes', async (ctx) => {
    try {
        const sortKey = ctx.query.sortKey;
        const sortDirection = ctx.query.sortDirection;
        const isLoadingRef = ctx.query.isLoadingRef === 'true';
        const filterValuesCheckBox = ctx.query.filterValues ? JSON.parse(ctx.query.filterValues) : {};
        const minRange = ctx.query.minSize
        const maxRange = ctx.query.maxSize

        if (sortKey) {
            applySorting(AllData, sortKey, sortDirection);
            currentData = AllData.slice(0, rowsLoadFirst);
        }

        if (isLoadingRef ) {
            if (isCurrentRowsAmount < AllData.length) {
                const result = await loadMoreRows(numberRowsToLoad, AllData, isCurrentRowsAmount, currentData);
                currentData = result.currentData;
                isCurrentRowsAmount = result.isCurrentRowsAmount;
            }
        }


        if(minRange){
            currentData = filterDataByRange(AllData, minRange, maxRange);
            if (sortKey) {
                applySorting(currentData, sortKey, sortDirection);
            }
            if (Object.keys(filterValuesCheckBox).length > 0 ) {
                currentData = filterDataByValue(currentData, filterValuesCheckBox);
            }
        }
        if (Object.keys(filterValuesCheckBox).length > 0 && !minRange && !isLoadingRef) {
            currentData = AllData.slice(0, isCurrentRowsAmount);
        }

        if (Object.keys(filterValuesCheckBox).length > 0 ) {
            currentData = filterDataByValue(AllData, filterValuesCheckBox);
            if (sortKey) {
                applySorting(currentData, sortKey, sortDirection);
            }
            if(minRange) {
                currentData = filterDataByRange(currentData, minRange, maxRange);
            }

        }
        if (Object.keys(filterValuesCheckBox).length === 0 && !minRange && !isLoadingRef){
            currentData = AllData.slice(0, isCurrentRowsAmount);
        }

        ctx.body = {
            data: currentData,
            isCurrentRowsAmount: isCurrentRowsAmount,
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


