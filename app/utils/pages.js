/**
 * List of utility functions used for pages and cards
 */

import pageTheme from "../themes/page-theme";

/**
 * Apply to a card the default positions based on its index
 * and the total amount of cards in the page
 * @param {any} card
 * @param {number} index position of the card in the array of cards
 * @param {number} count total number of cards, we expect that it is less than pageTheme.maxCards
 * @param {number} rowsCount total number of rows in the page, supported values are 1 or 2
 * @param {number} cardBaseWidth normalized width of the card, 1 is the width of the page
 * @param {number} cardBaseHeight normalized height of the card, 1 is the height of the page
 * @param {number} cardScale scale to apply to the card
 */
export function calculateCardNormalizedPosition(card, index, count, rowsCount, cardBaseWidth, cardBaseHeight, cardScale) {
    let rowNumber = index < count/2 || rowsCount==1 ? 1 : 2;
    let columnNumber = rowsCount == 1 ? index+1 : (index%Math.round(count/2))+1;
    // Calculate position based on index
    let top = rowsCount >= 2 ?
        cardBaseHeight*(rowNumber-1) + rowNumber*(1-rowsCount*cardBaseHeight)/(rowsCount+1)
        : (1-cardBaseHeight)/2;
    
    let columnsOnThisRow = count%2 == 0 ?
        (rowsCount == 1 ? count : count/2)
        : (rowNumber == 1 ? Math.floor((count+1)/2) : Math.floor((count)/2));
    let marginSpace = Math.max( (1 -cardBaseWidth*columnsOnThisRow)/(columnsOnThisRow+1), 0.05);
    let left = columnNumber*marginSpace +(columnNumber-1)*cardBaseWidth;
    // console.log(`calculateCardNormalizedPosition Card ${index}/${count} table:[${rowNumber},${columnNumber}] columnsOnThisRow=${columnsOnThisRow} position: {t:${top}, l:${left}}`);
    card.x_pos = left;
    card.y_pos = top;
    card.scale = cardScale;
}

/**
 * Set the default positions to all the cards of the page
 * Position are normalized values between 0 and 1, and are relative to the top left corner
 * @param {any} page the page containing the cards
 * @param {any[]} page.cards the list of cards
 * @return the received page, all its cards have the default positions and scale assigned
 */
export function calculateDefaultCardsPosition( page ){
   const count = page.cards.length;

   const maxCards = pageTheme.maxCards;
   const maxRows = 2, maxColumns = pageTheme.maxCards/maxRows;
   let cardBaseWidth = pageTheme.cardBaseWidth/pageTheme.width, cardBaseHeight = pageTheme.cardBaseHeight/pageTheme.height;
   let cardScale = pageTheme.cardBaseScale;
   let rowsCount = count > 2 ? 2 : 1;
   // Change width and height to make all cards visible on 1 page
   if( rowsCount > 1){
       // Show cards on 2 lines
       cardBaseWidth /= 2;
       cardBaseHeight /= 2;
       cardScale /= 2;
   }

   // Calculate the normalized position for all cards
   page.cards.forEach( (card, index) => {
       calculateCardNormalizedPosition(card, index, count, rowsCount, cardBaseWidth, cardBaseHeight, cardScale);
   });
   return page;
}

/** 
 * For all cards of the given page, if a card doesn't have a position or scale,
 * assign the default position and scale
 * @param {any} page the page containing the cards
 * @param {any[]} page.cards the list of cards
 * @return the received page, all its cards have the default positions and scale assigned
 */
export function calculateDefaultCardsPositionWhenUndefined( page ){
    /* Calculate all the cards positions */
    const count = page.cards.length;
    const rowsCount = count > 2 ? 2 : 1;
    let cardBaseWidth = pageTheme.cardBaseWidth/pageTheme.width, cardBaseHeight = pageTheme.cardBaseHeight/pageTheme.height;
    let cardScale = pageTheme.cardBaseScale;
    // Change width and height to make all cards visible on 1 page
    if( rowsCount > 1){
        // Show cards on 2 lines
        cardBaseWidth /= 2;
        cardBaseHeight /= 2;
        cardScale /= 2;
    }
    page.cards.forEach( (card, index, cards) => {
        if( !card.x_pos || !card.y_pos || !card.scale){
            calculateCardNormalizedPosition(card, index, count, rowsCount, cardBaseWidth, cardBaseHeight, cardScale);
        }
    });
    return page;       
}