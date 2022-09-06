import units from "../data/units.json" assert { type: "json" };

export function getUnit(key: string) {
    const found = units.find((unit) => unit.key === key);
    if (found) {
        return found;
    }
    return {
        key,
        name: key.replace(/^Char_/, "").replace(/_N$/, ""),
        emoji: "❓",
    };
}
