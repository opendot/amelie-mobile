import { LIVEWIEW } from './ActionTypes';

export function setOpen() {
    return {
        type: LIVEWIEW.OPEN,
    };
}

export function setClose() {
    return {
        type: LIVEWIEW.CLOSE,
    };
}