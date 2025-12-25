# Scratch Card & Prize Pool System - Technical Documentation (Tamil/English)

Intha document-la nammo create panna **Scratch Card**, **Prize Pool**, and **Coupon System** epdi line-by-line work aaguthunu clear-ah explain panni iruken.

---

## 1. Prize Pool Model (`src/models/PrizePool.js`)
Ithu thaan rewards-oda storage and rules set pandra idham.

*   **`totalQuantity`**: Mothama yevlo per win panna mudiyum (eg: 20 rewards).
*   **`usedQuantity`**: Ipo varaikum yevlo per win panni irukaanga nu track pannum.
*   **`winProbability`**: Random winner select panna help pannum (0.1 na 10% chance).
*   **`allocatePrize(poolId)`**: 
    *   Ithu oru **Atomic Operation**. Orarae நேரத்துல 100 per scratch pannaalum, `usedQuantity` correct-ah accurate-ah calculate aagum.
    *   `$inc: { usedQuantity: 1 }` - Win pannathum counter-ra 1 ethum.
    *   `$lt: ['$usedQuantity', '$totalQuantity']` - Counter maximum limit-ta reach pannucha nu check pannum.

---

## 2. Scratch Card Controller (`src/controllers/scratchCardController.js`)
Ithu thaan "The Brain" of the system. Inga thaan logic ellam iruku.

### `generateScratchCard` Function:
1.  **Order Check**: User oru order potta odane intha function run aagum. Mudhal-la antha order-ku already card create aaiducha nu check pannum (Double card prevent panna).
2.  **Won Pool Exclusion**: 
    ```javascript
    const wonPoolIds = await ScratchCard.find({ userId, isWinning: true }).distinct('prizePoolId');
    ```
    *   User munnadiye yentha prize-pool-la win panni irukaaro athai find pannum.
    *   Example: Pool A-la win pannitaar na, ippo Pool B-la mattum thaan win panna chance irukum.
3.  **Find Pool**: 
    ```javascript
    const availablePool = await PrizePool.findAvailablePool(wonPoolIds);
    ```
    *   User win pannatha, ippo active-ah iruka prize pool-la system thedum.
4.  **Probability Logic**: 
    ```javascript
    const isRandomWinner = Math.random() < winProbability;
    ```
    *   Ippo user-ku luck iruka nu oru random pulse check nadakkum. Probability pass aana thaan win.
5.  **Card Creation**: 
    *   Win aana `isWinning: true` pottu card save aagum.
    *   Thothutta (Loss) `isWinning: false` pottu "Better luck next time"nu card save aagum.

---

## 3. Order Logic (`src/controllers/orderController.js`)
Order-kum scratch card-kum ulla connectivity.

### `placeOrder`:
*   Order place aagum pothu system coupon-na validate pannum.
*   Reward coupon-na iruntha, user truly win panni irukaara nu `UserCoupon` table-la check pannum.

### `updateOrderStatus` (Cancellation Rule):
```javascript
if (status === 'cancelled') {
    const scratchCard = await ScratchCard.findOne({ orderId: id });
    if (scratchCard) {
        scratchCard.status = 'EXPIRED';
        await scratchCard.save();
        await UserCoupon.deleteOne({ scratchCardId: scratchCard._id, isUsed: false });
    }
}
```
*   Oru user order panni scratch card-la win pannitu, apparam order-ra **cancel** pannitaar na, antha reward-da system **thirumba eduthukum**.

---

## 4. Frontend Component (`src/components/ScratchCard.jsx`)
Intha code thaan user-ku screen-la mela layer scratch aagura maari kaatum.

*   **Canvas Drawing**: Javascript Canvas use panni mela `#0e4d65` color layer paint pannuvom.
*   **Eraser Mode**: User mouse-ala move pannum pothu `globalCompositeOperation = 'destination-out'` lines draw pannuvom, ithu thaan antha mela iruka layer-ra erasure (scratch) pannum.
*   **Revealed Event**: 50% mela scratch aaiducha nu monitor panni, backend-ku `reveal` update anupuvom.

---

## Summary of Rules Implemented:
1. ✅ **Random Winners**: Luck base-la rewards kidaikum.
2. ✅ **One Win Per Pool**: Pool A-la win pannita pool B-la fresh chance.
3. ✅ **No Reuse**: Use panna coupon-na thirumba use panna mudiyaathu.
4. ✅ **Cancellation Guard**: Order cancel aana prize gaali.
5. ✅ **Expiry Date**: Correct-ah 7 days-la reward expire aaidum.

Intha documents-la ulla logic thaan unga app-oda full flow-va handle pannuthu!
