/*!
 * Warthunder MFD
 * Copyright (c) 2025 vavaquin
 * Licensed under the MIT License
 */

let zoomScale = 400;
let bombing = false;
let AF = false;

let currentData = {
    mach: 0,
    altitude_10k: 0,
    fuel: 0,
    weapon4: 0,
    fuel_consume: 0,
    fuel_consume1: 0,
    type: "",
    nozzle_angle: 0,
    compass: 0,
    compass1: 0,
    gears: 0,
    gear_c_indicator: 0,
    ias: 0,
    tas: 0,
    blister1: 0,
    airbrake_lever: 0,
    gear_lamp_down: 0,
    aoa: 0,
    g_meter: 0,
    ammo_counter1: 0,
    fuel_mass: 0,
    fuel_mass_0: 0
};

let targetData = {
    mach: 0,
    altitude_10k: 0,
    fuel: 0,
    weapon4: 0,
    fuel_consume: 0,
    fuel_consume1: 0,
    type: "",
    nozzle_angle: 0,
    compass: 0,
    compass1: 0,
    gears: 0,
    gear_c_indicator: 0,
    ias: 0,
    tas: 0,
    blister1: 0,
    airbrake_lever: 0,
    gear_lamp_down: 0,
    aoa: 0,
    g_meter: 0,
    ammo_counter1: 0,
    fuel_mass: 0,
    fuel_mass_0: 0
};

let lastCompassRaw = 0;
let compassRotation = 0;


let stopLoop = false;
let abortController = new AbortController();

function interpolate(current, target, alpha) {
    return current + (target - current) * alpha;
}
function interpolateAngle(current, target, alpha) {
    let delta = ((target - current + 540) % 360) - 180;
    return (current + delta * alpha + 360) % 360;
}
function updateDisplay() {
    let lastCompassAngle = 0;
    const alpha = 0.06; 

    currentData.mach = interpolate(currentData.mach, targetData.mach, alpha);
    currentData.altitude_10k = interpolate(currentData.altitude_10k, targetData.altitude_10k, alpha);
    currentData.fuel = interpolate(currentData.fuel, targetData.fuel, alpha);
    currentData.weapon4 = interpolate(currentData.weapon4, targetData.weapon4, alpha);
    currentData.fuel_consume = interpolate(currentData.fuel_consume, targetData.fuel_consume, alpha);
    currentData.fuel_consume1 = interpolate(currentData.fuel_consume1, targetData.fuel_consume1, alpha);
    currentData.nozzle_angle = interpolate(currentData.nozzle_angle, targetData.nozzle_angle, alpha);
    currentData.throttle = interpolate(currentData.throttle1, targetData.throttle, alpha);
    currentData.compass = interpolate(currentData.compass, targetData.compass, alpha);
    currentData.compass1 = interpolate(currentData.compass1, targetData.compass1, alpha);
    currentData.gears = interpolate(currentData.gears, targetData.gears, alpha);
    currentData.gear_lamp_down = interpolate(currentData.gear_lamp_down, targetData.gear_lamp_down, alpha);
    currentData.gear_c_indicator = interpolate(currentData.gear_c_indicator, targetData.gear_c_indicator, alpha);
    currentData.blister1 = interpolate(currentData.blister1, targetData.blister1, alpha);
    currentData.airbrake_lever = interpolate(currentData.airbrake_lever, targetData.airbrake_lever, alpha);
    currentData.aoa = interpolate(currentData.aoa, targetData.aoa, alpha);
    currentData.g_meter = interpolate(currentData.g_meter, targetData.g_meter, alpha);
    currentData.ammo_counter1 = interpolate(currentData.ammo_counter1, targetData.ammo_counter1, alpha);
    currentData.fuel_mass = interpolate(currentData.fuel_mass, targetData.fuel_mass, alpha);
    currentData.fuel_mass_0 = interpolate(currentData.fuel_mass_0, targetData.fuel_mass_0, alpha);
    currentData.ias = interpolate(currentData.ias, targetData.ias, alpha);
    currentData.tas = interpolate(currentData.tas, targetData.tas, alpha);
    currentData.type = targetData.type; 

    document.getElementById('speed').innerText = `MACH: ${currentData.mach.toFixed(2)}`;
    document.getElementById('alt').innerText = `ALT: ${currentData.altitude_10k.toFixed(0)}`;
    document.getElementById('fuel').innerText = `IAS: ${currentData.ias.toFixed(0)}km/h  TAS: ${currentData.tas.toFixed(0)}km/h`;
    document.getElementById('type').innerText = `MODEL: ${currentData.type}`;
    // document.getElementById('cfuel').innerText = `FUEL: ${currentData.fuel.toFixed(0)}`;
    document.getElementById('ammo').innerText = `CURRENT: ${currentData.fuel_mass.toFixed(0)}KG  TOTAL:${currentData.fuel_mass_0.toFixed(0)}KG`;

    // mostradores

    const arrow = document.getElementById('arrow');
    arrow.style.transform = `rotate(${targetData.nozzle_angle}deg)`;

    const arrow2 = document.getElementById('arrow2');
    arrow2.style.transform = `rotate(${targetData.throttle * 90}deg)`;
    const arrowe = document.getElementById('enginearrow2');
    arrowe.style.transform = `rotate(${targetData.throttle * 90}deg)`;

    const wings = document.getElementById('wings')
    wings.style.transform = `rotate(${targetData.wing_sweep_indicator * -90}deg)`;

    // const compass = document.getElementById('compass');
    // compass.style.transform = `rotate(${currentData.compass * -1}deg)`;

    const alavanca = document.getElementById('alavanca');
    alavanca.style.top = `${currentData.gears * 35}px`;

    const aoa = document.getElementById('aoa');
    aoa.style.height = `${targetData.aoa * 2}px`;

    const g_meter = document.getElementById('g_meter');
    g_meter.style.height = `${targetData.g_meter * 8}px`;

    const led1 = document.getElementById('led1');
    if (targetData.gears_c_indicator >= 1.0 || targetData.gear_lamp_down >= 1.0) {
        led1.classList.add('led-active');
        led1.classList.remove('led-inactive');
    } else {
        led1.classList.add('led-inactive');
        led1.classList.remove('led-active');
    }

    const led2 = document.getElementById('led2');
    if (targetData.blister1 >= 1.0) {
        led2.classList.add('led-active1');
        led2.classList.remove('led-inactive1');
    } else {
        led2.classList.add('led-inactive1');
        led2.classList.remove('led-active1');
    }

    const led3 = document.getElementById('led3');
    if (targetData.airbrake_lever >= 1.0) {
        led3.classList.add('led-active2');
        led3.classList.remove('led-inactive2');
    } else {
        led3.classList.add('led-inactive2');
        led3.classList.remove('led-active2');
    }
    

    // calculo de combustivel restante
    let allfuelconsume = currentData.fuel_consume;

    if (currentData.fuel_consume1) {
        allfuelconsume += currentData.fuel_consume1;
    }

    if (allfuelconsume > 0) {
        const remainingMinutes = currentData.fuel / allfuelconsume;
        const minutes = Math.floor(remainingMinutes);
        const seconds = Math.floor((remainingMinutes - minutes) * 60)
        document.getElementById('time').innerText = `TIME:[${minutes}:${seconds.toString().padStart(2, '0')}]`;
    } else {
        document.getElementById('time').innerText = "";
    }
}



async function fetchSpeed() {
    try {
        const [indicatorsRes, stateRes, mapRes] = await Promise.all([
            fetch('http://localhost:8111/indicators', { signal: abortController.signal }),
            fetch('http://localhost:8111/state', { signal: abortController.signal }),
            fetch('http://localhost:8111/map_obj.json', { signal: abortController.signal })
        ]);

        // const data = await indicatorsRes.json();
        // const state = await stateRes.json();
        // const mapObjects = await mapRes.json();
        // renderMap(mapObjects);

        const data = await indicatorsRes.json();
        const state = await stateRes.json();
        const mapObjects = await mapRes.json();
        const typeToLetter = {
            "airfield": "T",
            "aircraft": "A",  
            "ground_model": "G", 
            "bombing_point": "B",
            "defending_point": "B",
            "capture_zone": "C" 
        };
        renderMap(mapObjects , typeToLetter);

        const newCompass = data.compass;
        let delta = newCompass - lastCompassRaw;

 
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        compassRotation += delta;
        lastCompassRaw = newCompass;

        targetData.compass = compassRotation;

        targetData.mach = data.mach;
        targetData.ias = state["IAS, km/h"];
        targetData.tas = state["TAS, km/h"];
        targetData.altitude_10k = data.altitude_10k;
        targetData.fuel = data.fuel;
        targetData.weapon4 = data.weapon4;
        targetData.fuel_consume = data["fuel_consume"];
        targetData.type = data.type;
        targetData.valid = data.valid;
        targetData.nozzle_angle = data.nozzle_angle;
        targetData.throttle = data.throttle;
        targetData.wing_sweep_indicator = data.wing_sweep_indicator;
        targetData.gears = data.gears;
        targetData.gear_c_indicator = data.gear_c_indicator;
        targetData.gear_lamp_down = data.gear_lamp_down;
        targetData.blister1 = data.blister1;
        targetData.airbrake_lever = data.airbrake_lever;
        targetData.aoa = data.aoa;
        targetData.g_meter = data.g_meter;
        targetData.ammo_counter1 = data.ammo_counter1;
        targetData.fuel_consume1 = data.fuel_consume1;
        targetData.fuel_mass = state["Mfuel, kg"];
        targetData.fuel_mass_0 = state["Mfuel0, kg"];



        handleValidState(data.valid);


    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error fetching speed data:', error);
        }
    }
}


// async function fetchSpeed() {
//     try {
//         const response = await fetch('http://localhost:8111/indicators', { signal: abortController.signal });
//         const data = await response.json();

//         const newCompass = data.compass;
//         let delta = newCompass - lastCompassRaw;

//         // Corrigir saltos de 359 -> 0 ou 0 -> 359
//         if (delta > 180) delta -= 360;
//         if (delta < -180) delta += 360;

//         compassRotation += delta;
//         lastCompassRaw = newCompass;

//         targetData.compass = compassRotation;

//         targetData.mach = data.mach;
//         targetData.altitude_10k = data.altitude_10k;
//         targetData.fuel = data.fuel;
//         targetData.weapon4 = data.weapon4;
//         targetData.fuel_consume = data["fuel_consume"];
//         targetData.type = data.type;
//         targetData.valid = data.valid
//         targetData.nozzle_angle = data.nozzle_angle;
//         targetData.throttle = data.throttle;
//         targetData.wing_sweep_indicator = data.wing_sweep_indicator;
//         targetData.gears = data.gears;
//         targetData.gear_c_indicator = data.gear_c_indicator;
//         targetData.gear_lamp_down = data.gear_lamp_down;
//         targetData.blister1 = data.blister1;
//         targetData.airbrake_lever = data.airbrake_lever;
//         targetData.aoa = data.aoa;
//         targetData.g_meter = data.g_meter;
//         targetData.ammo_counter1 = data.ammo_counter1;
//         targetData.fuel_consume1 = data.fuel_consume1;

//         handleValidState(data.valid);


//     } catch (error) {
//         if (error.name !== 'AbortError') {
//             console.error('Error fetching speed data:', error);
//         }
//     }
// }


function handleValidState(valid) {
    if (valid && !hasReceivedTrue) {
        resetScript();
        hasReceivedTrue = true;
    } else if (!valid) {
        hasReceivedTrue = false;
    }
}


async function updateSpeedLoop() {
    stopLoop = false;
    while (!stopLoop) {
        await fetchSpeed();
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

function animationLoop() {
    if (stopLoop) return;
    updateDisplay();
    requestAnimationFrame(animationLoop);
    afstage();

}

function resetScript() {


    abortController = new AbortController();
    currentData = {
        mach: 0,
        altitude_10k: 0,
        fuel: 0,
        weapon4: 0,
        fuel_consume: 0,
        fuel_consume1: 0,
        type: "",
        ias: 0,
        tas: 0,
        nozzle_angle: 0,
        compass: 0,
        compass1: 0,
        gears: 0,
        gear_c_indicator: 0,
        blister1: 0,
        airbrake_lever: 0,
        aoa: 0,
        g_meter: 0,
        ammo_counter1: 0,
        fuel_mass: 0,
        fuel_mass_0: 0
    };
    // Restart loops
    reRenderMap();

}



window.onload = () => {
    updateSpeedLoop();
    animationLoop();

    // document.getElementById('sync').addEventListener('click', () => {
    //     location.reload();
    // });
    document.getElementById('synctrue').addEventListener('click', () => {
        resetScript();
    });
};




//map

function renderMap (objects, typeToLetter) {
    const canvas = document.getElementById("mapCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const player = objects.find(obj => obj.icon === "Player");
    if (!player) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 1.2;

    drawDistanceCircles(ctx, centerX, centerY);

    
    

    for (const obj of objects) {
        console.log(obj);
        const pos = getRelativePosition(obj, player);
        const screenX = centerX + pos.x;
        const screenY = centerY + pos.y;

        const dangerTypes = ["airfield", "bombing_point"]; 
        if (dangerTypes.includes(obj.type)) {
            const dangerRadius = 0.08 * zoomScale;
            let circleColor = obj.color;
            // console.log("TYPE:", obj.type);
            

            ctx.beginPath();
            ctx.arc(screenX, screenY, dangerRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = circleColor;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            // console.log("testecirculo")
        }

        // console.log(`Object type: ${obj.type}, color: ${obj.color}`);

        ctx.fillStyle = "#181319";
        ctx.beginPath();
        ctx.arc(screenX, screenY, obj.icon === "Player" ? 8 : 4, 0, 2 * Math.PI);
        ctx.fill();
        if (obj.type && typeToLetter[obj.type]) {
            const letter = typeToLetter[obj.type];
            
            ctx.fillStyle = obj.color || "#FFFFFF";  
            ctx.font = "12px Arial";    
            ctx.fillText(letter, screenX - 5, screenY + 5); 
        }
    }

    //test

    if (bombing) {
        const bombingPoints = objects.filter(obj => obj.type === "bombing_point");

        bombingPoints.sort((a, b) => {
            const da = Math.hypot(a.x - player.x, a.y - player.y);
            const db = Math.hypot(b.x - player.x, b.y - player.y);
            return da - db;
        });


        const closestBombings = bombingPoints.slice(0, 2);

        ctx.strokeStyle = "#FF0000"; 
        ctx.lineWidth = 1;

        for (const bomb of closestBombings) {
            const pos = getRelativePosition(bomb, player);
            const bombX = centerX + pos.x;
            const bombY = centerY + pos.y;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(bombX, bombY);
            ctx.stroke();
        }
    }

        if (AF) {
        const AFpoints = objects.filter(obj => obj.type === "airfield" && obj.color === "#174DFF");

        AFpoints.sort((a, b) => {
            const da = Math.hypot(a.x - player.x, a.y - player.y);
            const db = Math.hypot(b.x - player.x, b.y - player.y);
            return da - db;
        });


        const closesAFpoints = AFpoints.slice(0, 2);

        ctx.strokeStyle = "#174DFF"; 
        ctx.lineWidth = 1;

        for (const AFF of AFpoints) {
            const pos = getRelativePosition(AFF, player);
            const AFFX = centerX + pos.x;
            const AFFY = centerY + pos.y;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(AFFX, AFFY);
            ctx.stroke();
        }
    }
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.fillStyle = "#00FF00";
    ctx.strokeStyle = "#16cf20";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -10); 
    ctx.lineTo(5, 5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function drawDistanceCircles(ctx, centerX, centerY) {

    const baseRadii = [0.2, 0.4, 0.6];
    const radii = baseRadii.map(r => r * zoomScale);
    radii.forEach(radius => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "#FF00FF"; 
        ctx.lineWidth = 1.5;  
        ctx.stroke(); 
    });
}

// function getRelativePosition(obj, player) {
//     const scale = 500;
//     const dx = obj.x - player.x;
//     const dy = obj.y - player.y;

//     const angle = -targetData.compass * (Math.PI / 180);

//     const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
//     const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

//     return {
//         x: rotatedX * zoomScale,
//         y: rotatedY * zoomScale
//     };
// }

function getRelativePosition(obj, player) {
    const scale = 500;

    let ox, oy;

    if (obj.type === "airfield" && obj.sx !== undefined && obj.sy !== undefined) {
        ox = (obj.sx + obj.ex) / 2;
        oy = (obj.sy + obj.ey) / 2;
    } else {
        ox = obj.x;
        oy = obj.y;
    }

    // const dx = obj.x - player.x;
    // const dy = obj.y - player.y;

    const dx = ox - player.x;
    const dy = oy - player.y;

    const angle = -targetData.compass * (Math.PI / 180);

    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

    return {
        x: rotatedX * zoomScale,
        y: rotatedY * zoomScale
    };
}


function reRenderMap() {
    fetch('http://localhost:8111/map_obj.json')
        .then(response => response.json())
        .then(mapObjects => {
            const typeToLetter = {
                "airfield": "T",
                "aircraft": "A",  
                "ground_model": "G", 
                "bombing_point": "B",
                "defending_point": "B",
                "capture_zone": "C" 
            };
            renderMap(mapObjects, typeToLetter);
        })
    .catch(error => console.error("Erro ao redesenhar o mapa:", error));
}

function zoomIn() {
    zoomScale *= 1.2;  
    reRenderMap();     
}

function zoomOut() {
    zoomScale /= 1.2;  
    reRenderMap();     
}

function afstage() {
    const throttle = targetData.throttle;
    const status = document.getElementById('stage');

    if (throttle >= 1.1) {
        status.textContent = "AB Stage 5";
        status.style.color = "#ff4800";
    } else if (throttle >= 1.09) {
        status.textContent = "AB Stage 4";
        status.style.color = "#ff7b00";
    } else if (throttle >= 1.07) {
        status.textContent = "AB Stage 3";
        status.style.color = "#ffbb00";
    } else if (throttle >= 1.05) {
        status.textContent = "AB Stage 2";
        status.style.color = "#0f0";
    } else if (throttle >= 1.02) {
        status.textContent = "AB Stage 1";
        status.style.color = "#0f0";
    } else if (throttle >= 0.90) {
        status.textContent = "Mil Stage";
        status.style.color = "#ffffff"; 
    } else if (throttle >= 0.70) {
        status.textContent = "Cruize Stage";
        status.style.color = "#ffffff"; 
    } else if (throttle >= 0.40) {
        status.textContent = "Eco Stage";
        status.style.color = "#ffffff"; 
    } else if (throttle >= 0.20) {
        status.textContent = "S.Eco Stage";
        status.style.color = "#ffffff"; 
    } else {
        status.textContent = "Idle Stage";
        status.style.color = "#ffffff";
        // console.log(throttle);
    }

}


function parseColorTags(text) {
    return text.replace(/<color=([^>]+)>(.*?)<\/color>/g, (match, color, content) => {
        return `<span style="color:${color}">${content}</span>`;
    });
}

let lastId = 0;

async function fetchchat() {
    try {
        const res = await fetch(`http://localhost:8111/gamechat?lastId=0`);
        if (!res.ok) return;
        const messages = await res.json();

        const chatDiv = document.getElementById('game-chat');
        chatDiv.innerHTML = ''; 

        const lastMessages = messages.slice(-5);

        lastMessages.forEach(msg => {
            const msgEl = document.createElement('div');

            const senderspan = document.createElement('span');
            senderspan.textContent = `${msg.sender}: `;
            if (msg.sender.toLowerCase() === 'vavaquin') {
                senderspan.textContent += "[⭐]:";
            }
            senderspan.style.color = msg.enemy ? 'red' : 'green';
            senderspan.style.fontWeight = 'bold';

            const msgspan = document.createElement('span');
            msgspan.innerHTML = parseColorTags(msg.msg)
            msgspan.style.color = 'white';

            msgEl.appendChild(senderspan);
            msgEl.appendChild(msgspan);
            chatDiv.appendChild(msgEl);
        });
    } catch (err) {
        console.error('Erro ao buscar o chat:', err);
    }
}

setInterval(fetchchat, 2000);


function fuel() {

  const canvas = document.getElementById("fuelCanvas");
  const ctx = canvas.getContext("2d");

  function drawFuelBar() {
    const fuel_mass = targetData.fuel_mass;
    const fuel_mass_0 = targetData.fuel_mass_0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = 280;
    const barHeight = 100;
    const x = (canvas.width - barWidth) / 2;
    const y = canvas.height - barHeight - 20;

    const fuelPercent = fuel_mass_0 > 0 ? fuel_mass / fuel_mass_0 : 0;
    const filledHeight = barHeight * fuelPercent;

    const bingoPercent = 0.3;
    const bingoY = y + barHeight - (barHeight * bingoPercent);


    ctx.strokeStyle = "#008d07";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);


    ctx.fillStyle = fuelPercent < bingoPercent ? "#ff3b3b" : "#3bff6e";
    ctx.fillRect(x, y + (barHeight - filledHeight), barWidth, filledHeight);

    // Linha do Bingo
    ctx.beginPath();
    ctx.moveTo(x, bingoY);
    ctx.lineTo(x + barWidth, bingoY);
    ctx.strokeStyle = "#ffa500";
    ctx.lineWidth = 2;
    ctx.stroke();

  }

  drawFuelBar();
}

setInterval(fuel, 2000);

function toggleBombing() {
    bombing = !bombing;
    reRenderMap();
}

function toggleAF() {
    AF = !AF;
    reRenderMap();
}