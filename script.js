let clickCount = 0;

function changeGreeting() {
    clickCount++;
    const greeting = document.getElementById('greeting');
    const message = document.getElementById('message');

    const greetings = [
        'Hello World!',
        'Welcome!',
        'Nice to meet you!',
        'You\'re awesome!',
        'Keep clicking!'
    ];

    const index = clickCount % greetings.length;
    greeting.textContent = greetings[index];
    message.textContent = `Button clicked ${clickCount} time${clickCount !== 1 ? 's' : ''}`;
}
