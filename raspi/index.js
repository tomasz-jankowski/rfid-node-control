const MFRC522 = require('mfrc522-rpi');
const SOFTSPI = require('rpi-softspi');
const { default: Axios } = require('axios');

console.log("Ready to scan");

// Set used RPi pins
const softSPI = new SOFTSPI({
    clock: 23,
    mosi: 19,
    miso: 21,
    client: 24
});

// Set reset and buzzer pins
const mfrc522 = new MFRC522(softSPI).setResetPin(22).setBuzzerPin(18);

// Main program to continuously scan cards
setInterval(() => {
    // Reset card
    mfrc522.reset();

    // Scan for card
    let response = mfrc522.findCard();
    if (!response.status)
        return;

    // Card detected, try to get UID
    console.log("Card detected");
    response = mfrc522.getUid();
    if(!response.status) {
        console.log("Scan error");
        return;
    }

    // UID obtained, log it
    const data = response.data;

    let uid = '';
    response.data.forEach(u => {
        uid += u.toString(16);
    });
    uid.slice(0, 8);

    Axios.get('192.168.0.34/8080', {
        params: {
            uid: uid
        }
    })
    .then(res => console.log(res))
    .catch(err => console.log(err));

    // Stop
    mfrc522.stopCrypto();
}, 500);