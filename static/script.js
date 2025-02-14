fetch('https://github.com/SteelCantSpeak/paxcrafting/blob/main/resources/materials.json')
    .then((response) => response.json())
    .then((json) => console.log(json));