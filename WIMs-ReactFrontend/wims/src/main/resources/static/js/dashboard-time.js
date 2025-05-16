function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = ('0' + now.getMinutes()).slice(-2);
    const seconds = ('0' + now.getSeconds()).slice(-2);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;

    document.getElementById('time').textContent = `${hour12}:${minutes}:${seconds}`;
    document.getElementById('ampm').textContent = ampm;
    document.getElementById('date').textContent = now.toLocaleDateString();
}

setInterval(updateClock, 1000);
updateClock();
