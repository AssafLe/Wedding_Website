let clickCount = 0;

function changeGreeting() {
    clickCount++;
    const greeting = document.getElementById('greeting');
    const message = document.getElementById('message');

    const greetings = [
        'Wedding Website',
        'Assaf & Ilana',
        'CouscouSaul!',
        'Keep clicking!'
    ];

    const index = clickCount % greetings.length;
    greeting.textContent = greetings[index];
    message.textContent = `Button clicked ${clickCount} time${clickCount !== 1 ? 's' : ''}`;
}
