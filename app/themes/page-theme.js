import I18n from "../i18n/i18n";

/**
 * Constants related to pages and cards
 */
export default {

width: 128,
height: 72,
ratio: 16/9, // = 128/72 = 1,777777777

cardBaseWidth: 50,
cardBaseHeight: 60,
cardBaseScale: 1.0,

maxCards: 8,    // Max number of cards per page
contentMaxSize: 50*1024*1024,  // Max size of a Content imported into a card

carouselBackground: "#293234",  // bg color of CardCarousel component

AVAILABLE_LEVELS: [I18n.t("cardLevel.l1"), I18n.t("cardLevel.l2"), I18n.t("cardLevel.l3"), I18n.t("cardLevel.l4"), I18n.t("cardLevel.l5")]
}