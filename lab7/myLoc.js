let watchId = null;
let map = null;
let currentMarker = null;
let lastPoint = null;
let destMarker = null;
let destCoords = null;
let lastCoords = null;

let ourCoords = {
    latitude: 48.94321,
    longitude: 24.7338
};

document.addEventListener('DOMContentLoaded', init);

function init() {
    initMap();
    getMyLocation();
}

function getMyLocation() {
    const watchButton = document.getElementById('watch');
    const clearWatchButton = document.getElementById('clearWatch');

    watchButton.addEventListener('click', watchLocation);
    clearWatchButton.addEventListener('click', clearWatch);

    document.getElementById('setDestBtn').addEventListener('click', setDestination);
    document.getElementById('goDestBtn').addEventListener('click', goToDestination);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(displayLocation, displayError, geoOptions());
    } else {
        alert('Oops, no geolocation support');
    }
}

function geoOptions() {
    return {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
    };
}

function displayLocation(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const div = document.getElementById('location');
    div.innerHTML = `Ви знаходитесь: широта ${latitude}, довгота ${longitude}`;
    div.innerHTML += ` (точність визначення ${position.coords.accuracy} м)`;

    const km = computeDistance(position.coords, ourCoords);
    const distance = document.getElementById('distance');
    distance.innerHTML = `Відстань до Коледжу: ${km.toFixed(3)} км`;

    lastCoords = position.coords;
    showPositionOnMap(position.coords, position.timestamp);
    updateDestinationInfo();
}

function displayError(error) {
    const errorTypes = {
        0: 'Невідома помилка',
        1: 'Користувач заборонив доступ до геолокації',
        2: 'Позицію визначити неможливо',
        3: 'Час очікування запиту вичерпано'
    };

    let errorMessage = errorTypes[error.code];
    if (error.code === 0 || error.code === 2) {
        errorMessage = errorMessage + ' ' + error.message;
    }

    const div = document.getElementById('location');
    div.innerHTML = errorMessage;
}

function computeDistance(startCoords, destCoordsValue) {
    const startLatRads = degreesToRadians(startCoords.latitude);
    const startLongRads = degreesToRadians(startCoords.longitude);
    const destLatRads = degreesToRadians(destCoordsValue.latitude);
    const destLongRads = degreesToRadians(destCoordsValue.longitude);
    const Radius = 6371;

    const cosine = Math.sin(startLatRads) * Math.sin(destLatRads) +
        Math.cos(startLatRads) * Math.cos(destLatRads) *
        Math.cos(startLongRads - destLongRads);

    const distance = Math.acos(Math.min(1, Math.max(-1, cosine))) * Radius;

    return distance;
}

function degreesToRadians(degrees) {
    const radians = (degrees * Math.PI) / 180;
    return radians;
}

function watchLocation() {
    if (!navigator.geolocation) {
        alert('Oops, no geolocation support');
        return;
    }

    if (watchId !== null) {
        return;
    }

    watchId = navigator.geolocation.watchPosition(displayLocation, displayError, geoOptions());
    document.getElementById('status').textContent = 'Відстеження увімкнено';
}

function clearWatch() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    document.getElementById('status').textContent = 'Відстеження вимкнено';
}

function initMap() {
    const mapBox = document.getElementById('map');

    if (typeof L === 'undefined') {
        mapBox.textContent = 'Не вдалося завантажити бібліотеку карти Leaflet';
        return;
    }

    map = L.map('map').setView([ourCoords.latitude, ourCoords.longitude], 13);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    L.marker([ourCoords.latitude, ourCoords.longitude])
        .addTo(map)
        .bindPopup('Коледж');
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('uk-UA');
}

function showPositionOnMap(coords, timestamp) {
    if (!map) {
        return;
    }

    const point = [coords.latitude, coords.longitude];
    const isFirst = lastPoint === null;

    if (!isFirst && lastPoint[0] === point[0] && lastPoint[1] === point[1]) {
        return;
    }

    const popupText = `Ви тут: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}<br>Час: ${formatTime(timestamp)}`;

    currentMarker = L.marker(point).addTo(map).bindPopup(popupText);

    if (isFirst) {
        map.setView(point, 15);
        currentMarker.openPopup();
    } else {
        map.panTo(point);
    }

    lastPoint = point;
}

function readCoordinate(value, limit) {
    const clean = value.trim().replace(',', '.');
    if (clean === '') {
        return null;
    }

    const number = Number(clean);
    if (isNaN(number) || Math.abs(number) > limit) {
        return null;
    }

    return number;
}

function showDestinationMessage(text) {
    const box = document.getElementById('destInfo');
    box.innerHTML = '';

    const p = document.createElement('p');
    p.className = 'message';
    p.textContent = text;
    box.appendChild(p);
}

function setDestination() {
    const latitude = readCoordinate(document.getElementById('destLat').value, 90);
    const longitude = readCoordinate(document.getElementById('destLng').value, 180);

    if (latitude === null || longitude === null) {
        showDestinationMessage('Введіть коректні координати: широта від -90 до 90, довгота від -180 до 180');
        return;
    }

    destCoords = {
        latitude: latitude,
        longitude: longitude
    };

    if (map) {
        if (destMarker) {
            map.removeLayer(destMarker);
        }

        destMarker = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(`Пункт призначення: ${latitude}, ${longitude}`);
    }

    updateDestinationInfo();
}

function updateDestinationInfo() {
    if (!destCoords) {
        return;
    }

    let text = `Пункт призначення: ${destCoords.latitude}, ${destCoords.longitude}.`;

    if (lastCoords) {
        const km = computeDistance(lastCoords, destCoords);
        text += ` Відстань від вас: ${km.toFixed(3)} км`;
    } else {
        text += ' Ваше місцезнаходження ще не визначено';
    }

    showDestinationMessage(text);
}

function goToDestination() {
    if (!destCoords) {
        showDestinationMessage('Спочатку задайте пункт призначення');
        return;
    }

    if (!map) {
        return;
    }

    map.flyTo([destCoords.latitude, destCoords.longitude], 14);

    if (destMarker) {
        destMarker.openPopup();
    }
}