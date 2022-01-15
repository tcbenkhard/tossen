export const gdc = (a: number, b: number): number => {
    if (!b) {
        return a;
    }

    return gdc(b, a % b);
}

export const isCoPrime = (a: number, b: number) => {
    if(gdc(a, b) === 1) return true;
    return false;
}

export const smallestCoprime = (a: number, min = 1): number => {
    for(let i = min; i < a; i++) {
        if(isCoPrime(i, a))
            return i;
    }
    return 1;
}