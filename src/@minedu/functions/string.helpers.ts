export const arrayToString = (arr): string => {
    let str = "";
    if (arr != null) {
        arr.forEach((i, index) => {
            str += i;
            if (index != arr.length - 1) {
                str += ",";
            }
        });
    }
    return str;
};
