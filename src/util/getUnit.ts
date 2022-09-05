import units from "../data/units.json" assert { type: "json" };

export function getUnit(key: string) {
    return units.find((unit) => unit.key === key);
}
