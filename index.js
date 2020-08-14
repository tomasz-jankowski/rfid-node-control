const mongoose = require('mongoose');
const MFRC522 = require('mfrc522-rpi');
const SOFTSPI = require('rpi-softspi');

mongoose.connect('mongodb://localhost:27017/rfid', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to DB"))
.catch(err => console.log(err.message));

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
    const uid = response.data;
    console.log(
        "UID: %s %s %s %s",
        uid[0].toString(16),
        uid[1].toString(16),
        uid[2].toString(16),
        uid[3].toString(16)
    );

    // Default auth key
    const key = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff];

    // Authenticate on Block 8 with key and UID
    if(!mfrc522.authenticate(8, key, uid)) {
        console.log("Authentication error!");
        return;
    }

    // Stop
    mfrc522.stopCrypto();
}, 500);