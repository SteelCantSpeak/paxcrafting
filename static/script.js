import materials from '../resources/materials.json' with { type: 'json' };
import weapons from '../resources/weapons.json' with { type: 'json' };

const metals = materials.metals;

const selectweaponElement = document.getElementById("weaponSelect");
const selectmaterialCategoryElement = document.getElementById("materialCategorySelect");
const selectmaterialElement = document.getElementById("materialSelect");

const itemDropdown = document.getElementById("itemDetails");

let weapon = null;
let material = null;

weapons.forEach(weapon => {
    let option = document.createElement("option");
    option.value = weapon.name;
    option.textContent = weapon.name;
    selectweaponElement.appendChild(option);
});

materials.forEach(item => {
    let option = document.createElement("option");
    option.value = item.name;
    option.textContent = item.name;
    selectmaterialCategoryElement.appendChild(option);
});

document.getElementById("materialCategorySelect").addEventListener('change', function () {
    const selectedMaterialCategory = selectmaterialCategoryElement.value;
    let materialcategory = materials.find(w => w.name === selectedMaterialCategory);

    selectmaterialElement.innerHTML = '<option value="">-- Choose a Material --</option>';

    materialcategory.contents.forEach(item => {
        let option = document.createElement("option");
        option.value = item.name;
        option.textContent = item.name;
        selectmaterialElement.appendChild(option);
    });
});

document.getElementById("weaponSelect").addEventListener('change', function () {
    const selectedWeapon = selectweaponElement.value;
    weapon = weapons.find(w => w.name === selectedWeapon);
    UpdateCalc();
});

document.getElementById("materialSelect").addEventListener('change', function () {
    const selectedMaterial = selectmaterialElement.value;
    material = metals.find(w => w.name === selectedMaterial);
    UpdateCalc();
});

function UpdateCalc() {
    if (weapon == null) {
        itemDropdown.innerHTML = "";
    } else {
        let item = itemResults(weapon, material);
        itemDropdown.innerHTML = `
            <h3>${item.name}</h3>
            <p><strong>Crafting:</strong> DC${item.crafting_dc} (${item.crafting_tools}).</p>
            <p><strong>Cost:</strong> ${item.cost} gp.</p>
            <p><strong>Weight:</strong> ${item.weight}</p>
            <p><strong>Damage:</strong> ${item.damage} ${item.damage_type}</p>
            <p><strong>Properties:</strong> ${weapon.type}, ${item.weapon_properties}</p>
            <p><strong>Notes:</strong> ${item.misc_properties}</p>
        `;
    }
}

function CostToPercent(value) {
    return value;
}

function convertToCoin(cost) {
    cost = cost.replace(" (sell only)", "")
    if (cost.substr(-3, 1) == "k") {
        return cost.slice(0, -3) * 100;
    } else {
        return cost.slice(0, -2) * 1;
    }
}

function weight(lbs) {
    lbs = lbs.replace(" lb.", "");
    return lbs * 1;
}

function itemCost(_weapon, _material) {
    let cost = _weapon.cost;
    //item tier affect
    cost *= tierCost(_weapon)["cost"]
    //material cost (Requires 75% of new material)
    cost += (convertToCoin(_material.cost_per_pound) * weight(_weapon.weight) * 0.75);
    //crafting material mod
    cost *= 1 + _material.crafting_cost_modifier / 100;
    return cost;
}

function tierCost(item) {
    let results = {
        "dc": 12,
        "cost": 1
    }
    switch (item.tier) {
        case 1:
            results["dc"] -= 1;
            results["cost"] /= 3;
            break;
        case 2:
            results["cost"] /= 2;
            break;
        case 3:
            results["dc"] -= 1;
            results["cost"] *= 2 / 3;
            break;
        default:
            break;
    }
    return results;
}

function itemResults(_weapon, _material) {
    if (_material == null) {
        _material = {
            "name": "",
            "crafting_dc_modifier": "",
            "crafting_cost_modifier": "0",
            "weapon_effect": "",
            "description": "",
            "cost_per_pound": "0gp",
            "tools_used": "smithing tools"
        };
    }

    let item = {
        "name": `${_material.name} ${_weapon.name}`,
        "cost": `${Math.round(itemCost(_weapon, _material) * 100) / 100}`,
        "crafting_dc": `${tierCost(_weapon)["dc"] + _material.crafting_dc_modifier}`,
        "crafting_tools": `${_material.tools_used}`,
        "weight": `${weight(_weapon.weight) * (_material.weapon_effect.half_weight ? 0.5 : 1)} lbs.`,
        "damage": `${_weapon.damage}`,
        "damage_type": `${(_material.weapon_effect.replace_dmg) ? _material.weapon_effect.replace_dmg : _weapon.damage_type}`,
        "weapon_properties": `${_weapon.properties}`,
        "misc_properties": `${_material.weapon_effect.base}`,
    };

    if (_material.weapon_effect.half_weight) {
        let newProperties = _weapon.properties;
        for (let index = 0; index < newProperties.length; index++) {
            if (newProperties[index] == "heavy") {
                newProperties.splice(index, 1);
                item.weapon_properties = newProperties;
                return item;
            } else if (newProperties[index] == "light") {
                item.weapon_properties = newProperties;
                return item;
            }
        }
        newProperties.push("light");
        item.weapon_properties = newProperties;
    }

    return item;
}