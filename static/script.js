import materials from '../resources/materials.json' with { type: 'json' };
import weapons from '../resources/weapons.json' with { type: 'json' };

const metals = materials.metals;

const selectweaponElement = document.getElementById("weaponSelect");
const selectmaterialElement = document.getElementById("materialSelect");

const materialdropdown = document.getElementById("materialDetails");
const weapondropdown = document.getElementById("weaponDetails");
const itemDropdown = document.getElementById("itemDetails");

let weapon = null;
let material = null;

metals.forEach(item =>{
    let option = document.createElement("option");
    option.value = item.name;
    option.textContent = item.name;
    selectmaterialElement.appendChild(option);
});

weapons.forEach(weapon => {
    let option = document.createElement("option");
    option.value = weapon.name;
    option.textContent = weapon.name;
    selectweaponElement.appendChild(option);
});


document.getElementById("weaponSelect").addEventListener('change', function (){
    const selectedWeapon = selectweaponElement.value;
    weapon = weapons.find(w => w.name === selectedWeapon);
    
    if (weapon) {
        weapondropdown.innerHTML = `
            <h3>${weapon.name}</h3>
            <p><strong>Cost:</strong> ${weapon.cost} gp</p>
            <p><strong>Weight:</strong> ${weapon.weight}</p>
            <p><strong>Damage:</strong> ${weapon.damage} ${weapon.damage_type}</p>
            <p><strong>Properties:</strong> ${weapon.type}, ${weapon.properties}</p>
        `;
    } else {
        weapondropdown.innerHTML = "";
        weapon = null;
    }
    UpdateCalc();
});

document.getElementById("materialSelect").addEventListener('change', function (){
    const selectedMaterial = selectmaterialElement.value;
    material = metals.find(w => w.name === selectedMaterial);
    
    if (material) {
        materialdropdown.innerHTML = `
            <h3>${material.name}</h3>
            <p><strong>Cost:</strong> ${material.cost_per_pound} per lb.</p>
            <p><strong>Crafting DC Modifier:</strong> ${material.crafting_dc_modifier}</p>
            <p><strong>Crafting Cost Modifier:</strong> ${CostToPercent(material.crafting_cost_modifier)}%</p>
            <p><strong>Properties:</strong> ${material.weapon_effect}</p>
        `;
    } else {
        materialdropdown.innerHTML = "";
        material = null;
    }
    UpdateCalc();
});

function CostToPercent(value){
    return value;
}

function UpdateCalc(){
    if (material == null || weapon == null) {
        itemDropdown.innerHTML="";
    } else {
        itemDropdown.innerHTML=`
            <h3>${material.name} ${weapon.name}</h3>
            <p><strong>Crafting:</strong> DC${tierCost()["dc"]+material.crafting_dc_modifier} (${material.tools_used}).</p>
            <p><strong>Cost:</strong> ${Math.round(itemCost(weapon, material)* 100) / 100} gp.</p>
            <p><strong>Weight:</strong> ${weapon.weight}</p>
            <p><strong>Damage:</strong> ${weapon.damage} ${weapon.damage_type}</p>
            <p><strong>Properties:</strong> ${weapon.type}, ${weapon.properties}</p>
            <p><strong>Notes:</strong> ${material.weapon_effect}</p>
        `;
    }
}

function convertToCoin(cost){
    cost = cost.replace(" (sell only)", "")
console.log(cost.substr(-3,1));
if (cost.substr(-3,1) == "k") {
    return cost.slice(0,-3) *100;   
} else {
    return cost.slice(0,-2) *1;   
}
}

function weight(lbs){
    lbs = lbs.replace(" lb.", "");

    console.log(lbs);
    return lbs *1;
}

function itemCost(weapon, material){
    let cost = weapon.cost;
    //item tier affect
    cost *= tierCost()["cost"]
    //material cost (Requires 75% of new material)
    cost += (convertToCoin(material.cost_per_pound)*weight(weapon.weight)*0.75);
    //crafting material mod
    cost *= 1+material.crafting_cost_modifier /100;
    return cost;
}

function tierCost(){
    let results = {
        "dc": 12,
        "cost": 1
    }
switch(weapon.tier){
    case 1:
        results["dc"] -= 1;
        results["cost"] /= 3;
        break;
    case 2:
        results["cost"] /= 2;
        break;
    case 3:
        results["dc"] -= 1;
        results["cost"] *= 2/3;
        break;
    default:
        break;
}
return results;
}