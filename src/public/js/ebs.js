import { doc, log, jq, getSettings } from './help.js';

jq(document).ready(function () {
    let inactivityTimer;
    let settings = getSettings().general;
    let screenSaverWait = settings?.screenSaverWait; //log(screenSaverWait);
    if (screenSaverWait === 'Never') return;

    let swt = screenSaverWait || 5; //log(swt)
    let idleTimeout = Number(swt) * 60 * 1000; // 5 minutes in milliseconds

    // Function to show the clock
    function showClock() {
        $('#clock').removeClass('d-none')
        setInterval(() => {
            jq('div.clock').text(moment().format('h:mm'))
        }, 1000);
    }

    // Function to hide the clock
    function hideClock() {
        $('#clock').addClass('d-none')
    }

    // Reset inactivity timer
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        hideClock();
        inactivityTimer = setTimeout(() => {
            showClock();
        }, idleTimeout);
    }

    // Monitor user activity
    // $(document).on('mousemove keydown', resetInactivityTimer);
    jq(document).on('keydown click', resetInactivityTimer);

    // Initialize the inactivity timer
    resetInactivityTimer();
});