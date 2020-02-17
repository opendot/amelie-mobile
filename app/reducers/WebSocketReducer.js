import {
    WS
} from '../actions/ActionTypes';
const ObjectID = require("bson-objectid");// Generate a unique Hex String of 24 characters (12 bytes https://docs.mongodb.com/manual/reference/bson-types/#objectid)

const initialState = {
    socketServer: null,
    socketEyeTracker: null,
    tree: generateNewTree(),
    currpage: generateNewPage( ObjectID.generate() ),
    cards:[],
    cardlist:[],
    gaze:[0,0],
    connected:false,
    session: generateNewSession(),
    duration:600,
    route:"",
    gazeOn: true,               //  Eyetracker enabled
    alignEyetrackerOn: false,   //  Line to align eyetracker visible
    ip:"10.0.2.2:4000",
};

export default function (state = initialState, action = {}) {
    switch (action.type) {

        case WS.SETSOCKETSERVER:
            return {
                ...state,
                socketServer:action.payload,
            };

        case WS.SETSOCKETEYETRACKER:
            return {
                ...state,
                socketEyeTracker:action.payload,
            };

        case WS.SETTREE:

            return {
                ...state,
                tree:action.payload.tree,
            };

        case WS.NEWPAGE:
            let newid = ObjectID.generate();
           // console.log("my payload", action.payload);
            let newtree = { ...state.tree };
            newtree.pages = state.tree.pages.map(function(e,i){
                //console.log(e.id,action.payload.page);
                if(e.id == action.payload.page){

                    // Add the link to the card
                    e.cards[action.payload.pos].next_page_id = newid;

                }
                return e;
            })
            //console.log("my new tree", newtree);
            return {
                ...state,
                tree: newtree,
                currpage: generateNewPage( newid, action.payload.level ),
                cards:[],
            };
        
        case WS.SETPAGE:
            // Updates the properties of the current page
            return {
                ...state,
                currpage: {...state.currpage, ...action.page}
            }

        case WS.ADDPAGETOCURRENTTREE:
            // Create a page by merging currpage and cards
            let oldpage = {...state.currpage,cards:state.cards};
            // Add the new page to the existing tree
            let newTree = { ...state.tree};
            newTree.pages.push(oldpage);
            return {
                ...state,
                tree: newTree,
                currpage: generateNewPage( ObjectID.generate() ),
                cards:[],
                cardlist:[]
            };

        case WS.SETPAGEAT:
            
            let currTree = state.tree.pages.slice();
            if(currTree.length==0 || currTree.length <= action.payload.index || action.payload.index < 0 ) {
                currTree.push(action.payload.page);
            }
            else currTree[action.payload.index] = action.payload.page;
            return {
                ...state,
                tree: {
                    ...state.tree,
                    pages: currTree,
                }
            };

        case WS.SETSESSION:

            return {
                ...state,
                session: {
                    ...state.session,
                    current:action.payload,
                }
            };

        case WS.NEWSESSION:
            return {
                ...state,
                session: {
                    ...generateNewSession(),// Reset session
                    current:action.payload,
                }
            };

        case WS.SETDISPLAYPAGE:
            // In a session the displayPage belongs to the tree on top of my stack
            let tempPage = JSON.parse(JSON.stringify(action.payload));
            let newTreeList = state.session.treeList;
            if( tempPage ){
                if( state.session.treeStack.length > 0 ) {
                    // Add the tree information to the page, the id of the tree holding the page
                    let originTree = state.session.treeStack[state.session.treeStack.length -1];
                    tempPage.treeId = originTree.id;
                    tempPage.treeUID = originTree.uid;
                    // The full tree is kept into treeList, to prevent duplicates
                    newTreeList = addTreeToList( state.session.treeList, originTree);
                }
                else {
                    // This happens when the app was killed during the session and
                    // I'm showing a page after a CURRENT_PAGE event
                    console.error("ERROR WebSocketReducer SETDISPLAYPAGE empty treeStack, this should never happen", state.session);
                }
            }
            // tempPage can be null, if it's null don't add it to history
            return {
                ...state,
                session: {
                    ...state.session,
                    displayPage: tempPage,
                    pageHistory: tempPage ? [...state.session.pageHistory, tempPage] : state.session.pageHistory,
                    treeList: newTreeList,
                },
            };
        
        case WS.SETCARDVIDEOPLAYING:
            // Flag used to know if a video is playing
            return {
                ...state,
                session: {
                    ...state.session,
                    cardVideoPlaying: action.payload,
                },
            };

        case WS.SETFLAGBACKSHUFFLEEVENT:
            // Flag used to generate a shuffle event after a back event
            return {
                ...state,
                session: {
                    ...state.session,
                    flagBackShuffleEvent: action.payload,
                },
            };

        case WS.NEWROUTE:
            return {
                ...state,
                route: action.payload
            };

        case WS.NEWTREE:
            return {
                ...state,
                tree: generateNewTree(),
                currpage: generateNewPage( ObjectID.generate() ),
                cards:[],
                cardlist:[],
            }

        case WS.SETCARDS:
            return {
                ...state,
                cards: action.payload
            };

        case WS.UPDATECARDLIST:
            return {
                ...state,
                cardlist: action.payload
            };

        case WS.SETCARDAT:

            let currcards = state.cards.slice();
            if(currcards.length==0 || currcards.length < action.payload.index) {
                currcards.push(action.payload.card)
            }
            else currcards[action.payload.index] = action.payload.card;
            return {
                ...state,
                cards: currcards
            };

        case WS.GOBACKHISTORY:
            return {
                ...state,
                session: {
                    ...state.session,
                    pageHistory: state.session.pageHistory.slice(0, -action.payload),
                },
            };

        case WS.CLEARHISTORY:
            return {
                ...state,
                session: {
                    ...state.session,
                    pageHistory: [],
                },
            };

        case WS.ADDTREETOSTACK:
            let newTreeStack = JSON.parse(JSON.stringify(state.session.treeStack));
            if( action.payload.prevTreeCurrentPage && newTreeStack.length > 0) {
                // Add info about the current page of the tree that will be hidden
                let prevTree = newTreeStack[newTreeStack.length -1];
                prevTree.currentPageId = action.payload.prevTreeCurrentPage.id;
            }
            let newUniqueTree = {id: action.payload.tree.id};//JSON.parse(JSON.stringify(action.payload.tree));
            // Add a new unique id to the tree, to handle case when the same tree is added many times
            newUniqueTree.uid = action.payload.tree.uid || ObjectID.generate();

            // Add the new tree on top of the stack
            newTreeStack.push(newUniqueTree);
            
            return {
                ...state,
                session: {
                    ...state.session,
                    treeStack: newTreeStack,
                    treeList: addTreeToList( state.session.treeList, action.payload.tree),
                },
            };

        case WS.REMOVETREEFROMSTACK:
            return {
                ...state,
                session: {
                    ...state.session,
                    treeStack: state.session.treeStack.slice(0, -action.payload),
                },
            };

        case WS.UPDATEGAZE:
            return {
                ...state,
                gaze: action.payload
            };

        case WS.CONNECTED:
            return {
                ...state,
                connected: action.payload
            };

        case WS.CHANGEIP:
            return {
                ...state,
                ip: action.payload
            };

        case WS.GAZEON:
            return {
                ...state,
                gazeOn: true
            };

        case WS.GAZEOFF:
            return {
                ...state,
                gazeOn: false
            };

        case WS.ALIGNEYETRACKER:
            return {
                ...state,
                alignEyetrackerOn: action.payload
            };


        case WS.SELECTEDCARD:
            return {
                ...state,
                cards: state.cards.map(
                    (c, i) => c.text === action.payload ? {...c, selected: true}
                        : c
                )
            };
        default:
            return state;
    }
}

function generateNewTree() {
    return {
        id: undefined,  // This will be created just before sending to the server
        name: null,
        patient_id: null,
        favourite: false,
        pages: [],
    };
}

function generateNewPage( newId, level = 0) {
    return {
        id: newId,
        name: null,
        page_tags: [],
        level: level,
        background_color: 'black'
    };
}

function generateNewSession() {
    return {
        current: null, // the current active session
        displayPage:null, // Page shown in the liveview, shows what's happening in the desktop app
        pageHistory: [], //  History of the displayed page pf a session, used for the BackEvent
        treeStack: [],  // stack of tree shown in the session, used to allow quick shown of favourite trees
        treeList: {},   // list of all the trees shown in the session
        cardVideoPlaying: null, // card which video content is reproduced at the moment
    };
}

/** Add the tree to the treeList if it's not already inside */
function addTreeToList( treeList, newTree ) {
    let newTreeList = JSON.parse(JSON.stringify(treeList));
    if( newTree && !newTreeList[newTree.id]) {
        newTreeList[newTree.id] = JSON.parse(JSON.stringify(newTree));
    }
    return newTreeList;
}