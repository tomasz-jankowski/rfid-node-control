const MFRC522 = require('mfrc522-rpi');
const SOFTSPI = require('rpi-softspi');
const fetch = require('node-fetch');
const GPIO = require('onoff').Gpio;

const redLED = new GPIO(16, 'out');
const yellowLED = new GPIO(20, 'out');
const greenLED = new GPIO(21, 'out');

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
    url = 'http://192.168.0.34:8080/' + uid.slice(0, 8);

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if(data.owner === 'admin') {
                let blinkInterval = setInterval(() => {
                    if (greenLED.readSync() === 0) {
                        greenLED.writeSync(1);
                    } else {
                        greenLED.writeSync(0);
                    }
                }, 250);
            } else {
                let blinkInterval = setInterval(() => {
                    if (redLED.readSync() === 0) {
                        redLED.writeSync(1);
                    } else {
                        redLED.writeSync(0);
                    }
                }, 250);
            }
        })
        .catch(err => console.log(err));
 
    // Stop
    mfrc522.stopCrypto();
}, 500);