import units from "../data/units.json" assert { type: "json" };

function createKeys(key: string) {
    return {
        /** @example Char_DS_Charlotte_N */
        key,
        /** @example DS_Charlotte */
        key2: key.replace(/^Char_/, "").replace(/_N$/, ""),
        /** @example Charlotte */
        key3: key.replace(/^Char_.+?_/, "").replace(/_N$/, ""),
    };
}

export function getUnit(key: string) {
    const found = units.find((unit) => unit.key === key);

    if (found) {
        return {
            ...found,
            ...createKeys(found.key),
        };
    } else {
        const unknownUnitKeys = createKeys(key);

        return {
            name: unknownUnitKeys.key2,
            emoji: "❓",
            ...unknownUnitKeys,
        };
    }
}

export function getUnits() {
    return units.map((unit) => ({
        ...unit,
        ...createKeys(unit.key),
    }));
}
