/****
 * Returns the current date/time in Europe/Berlin, accounting for DST and browser compatibility.
 */
function getBerlinDate() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Berlin',
        hour12: false,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    }).formatToParts(now).reduce((acc, part) => {
        if (part.type !== 'literal') acc[part.type] = parseInt(part.value, 10);
        return acc;
    }, {});
    return new Date(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
        0
    );
}

document.addEventListener('DOMContentLoaded', function () {
    // check if we're running via file://
    if (window.location.protocol === 'file:') {
        console.error('Cannot load components when running via file://. Please use a local server.');
        return;
    }
    includeHTML('header', 'components/header.html');
    includeHTML('footer', 'components/footer.html');
    // add waiver modal logic
    addFloatingButtons();
});

function includeHTML(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            if (elementId === 'header') setActiveNavLink();
        })
        .catch(error => console.error('Error loading ' + filePath, error));
}

function setActiveNavLink() {
    const links = document.querySelectorAll('.nav-links a');
    const path = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(link => {
        if (link.getAttribute('href') === path) link.classList.add('active');
    });
}

function addFloatingButtons() {
    const fab = document.createElement('div');
    fab.className = 'floating-action-buttons';
    fab.innerHTML = `
        <a href='https://app.cleverwaiver.com/render/templateByRefId/68540f9a25ba08d4d3e0ae56' class='fab-btn' target='_blank' title='Sign Waiver'>
            <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 2l7 4v5c0 5.25-3.5 10-7 11-3.5-1-7-5.75-7-11V6z'/></svg>
        </a>
        <a href='https://instagram.com/nobsjj' class='fab-btn' target='_blank' title='Message us on Instagram'>
            <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='2' width='20' height='20' rx='5' ry='5'/><path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'/><line x1='17.5' y1='6.5' x2='17.5' y2='6.5'/></svg>
        </a>
    `;
    document.body.appendChild(fab);
}

// cookie consent banner
function addCookieBanner() {
    if (localStorage.getItem('nobsjj_cookie_accepted')) return;
    // add overlay
    const overlay = document.createElement('div');
    overlay.className = 'cookie-overlay';
    document.body.appendChild(overlay);
    // add banner
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
        <span>we use cookies to make this site work. no tracking, just basic stuff.</span>
        <button class='button accept-cookie'>accept</button>
    `;
    document.body.appendChild(banner);
    banner.querySelector('.accept-cookie').onclick = () => {
        localStorage.setItem('nobsjj_cookie_accepted', '1');
        banner.remove();
        overlay.remove();
    };
}

// launch pop-up modal
function addLaunchPopup() {
    if (localStorage.getItem('nobsjj_launch_popup_dismissed')) return;
    const modal = document.createElement('div');
    modal.className = 'launch-modal';
    modal.innerHTML = `
        <div class='launch-modal-content'>
            <span class='close-launch-modal'>&times;</span>
            <h2>🎉 NOBSJJ just launched in Berlin!</h2>
            <p>Drop by for a free trial lesson.</p>
            <a href='membership.html' class='button primary'>Get Started</a>
        </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = e => {
        if (e.target.classList.contains('launch-modal') || e.target.classList.contains('close-launch-modal')) {
            localStorage.setItem('nobsjj_launch_popup_dismissed', '1');
            modal.remove();
        }
    };
}

// schedule data (Berlin time)
const SCHEDULE = [
    { day: 1, name: 'Takedowns: All Levels', start: '11:30', end: '12:30' },
    { day: 1, name: 'Takedowns: All Levels', start: '21:30', end: '22:30' },
    { day: 2, name: 'Bite Size JJ', start: '11:30', end: '12:30' },
    { day: 3, name: 'Takedowns: All Levels', start: '21:30', end: '22:30' },
    { day: 4, name: 'All Levels', start: '21:30', end: '22:30' },
    { day: 5, name: 'All Levels', start: '12:00', end: '13:00' },
];

function addScheduleWidget() {
    const widget = document.createElement('div');
    widget.className = 'schedule-widget';
    // widget.innerHTML = `
    //     <button class='close-schedule-widget' title='Close'>&times;</button>
    //     <div class='schedule-info'>
    //         <span class='schedule-title'></span>
    //         <span class='schedule-time'></span>
    //         <span class='schedule-countdown'></span>
    //     </div>
    // `;
    widget.innerHTML = `
        <div class='schedule-info'>
            <span class='schedule-title'></span>
            <span class='schedule-time'></span>
            <span class='schedule-countdown'></span>
        </div>
    `;
    document.body.appendChild(widget);
    updateScheduleWidget(widget);
    setInterval(() => updateScheduleWidget(widget), 1000);
    widget.querySelector('.close-schedule-widget').onclick = () => widget.style.display = 'none';
}

function updateScheduleWidget(widget) {
    const berlin = getBerlinDate();
    const day = berlin.getDay();
    let soonest = null;
    for (const c of SCHEDULE) {
        const classDay = c.day;
        const [sh, sm] = c.start.split(':').map(Number);
        const [eh, em] = c.end.split(':').map(Number);
        // handle classes spanning past midnight
        const endDayOffset = (eh < sh || (eh === sh && em <= sm)) ? 1 : 0;
        // compute start
        const classStart = new Date(berlin);
        classStart.setDate(berlin.getDate() + (classDay - day + 7) % 7);
        classStart.setHours(sh, sm, 0, 0);
        // compute end, with next-day support
        const classEnd = new Date(classStart);
        classEnd.setDate(classStart.getDate() + endDayOffset);
        classEnd.setHours(eh, em, 0, 0);
        // if today and already ended, move to next week
        if (((classDay - day + 7) % 7) === 0 && berlin > classEnd) {
            classStart.setDate(classStart.getDate() + 7);
            classEnd.setDate(classEnd.getDate() + 7);
        }
        // if currently in progress
        if (berlin >= classStart && berlin < classEnd) {
            if (!soonest || classEnd < soonest.time) {
                soonest = { ...c, time: classEnd, start: classStart, inProgress: true };
            }
        } else if (classStart > berlin) {
            if (!soonest || classStart < soonest.time) {
                soonest = { ...c, time: classStart, start: classStart, inProgress: false };
            }
        }
    }
    const title = widget.querySelector('.schedule-title');
    const timeEl = widget.querySelector('.schedule-time');
    const countdown = widget.querySelector('.schedule-countdown');
    if (soonest && soonest.inProgress) {
        title.textContent = `Class in progress: ${soonest.name}`;
        timeEl.textContent = `Ends at ${soonest.time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
        const diff = Math.floor((soonest.time - berlin) / 1000);
        countdown.textContent = `Time left: ${formatCountdown(diff)}`;
    } else if (soonest) {
        title.textContent = `Next: ${soonest.name}`;
        timeEl.textContent = `Starts at ${soonest.time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
        const diff = Math.floor((soonest.time - berlin) / 1000);
        countdown.textContent = `Starts in: ${formatCountdown(diff)}`;
    } else {
        title.textContent = 'No upcoming classes';
        timeEl.textContent = '';
        countdown.textContent = '';
    }
}

function formatCountdown(seconds) {
    if (seconds < 0) return '0:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// render schedule table (for curriculum.html)
function renderScheduleTable() {
    const tableDiv = document.getElementById('schedule-table');
    if (!tableDiv) return;
    // group by day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = {};
    for (const c of SCHEDULE) {
        if (!grouped[c.day]) grouped[c.day] = [];
        grouped[c.day].push(c);
    }
    let html = `<table><tr><th>Day</th><th>Class</th><th>Time</th></tr>`;
    for (let d = 1; d <= 5; d++) {
        if (!grouped[d]) continue;
        for (let i = 0; i < grouped[d].length; i++) {
            const c = grouped[d][i];
            html += `<tr><td>${days[d]}</td><td class='schedule-title'>${c.name}</td><td>${c.start}-${c.end}</td></tr>`;
        }
    }
    html += `</table>`;
    tableDiv.innerHTML = html;
}

// call renderScheduleTable on curriculum page
if (window.location.pathname.endsWith('curriculum.html')) {
    document.addEventListener('DOMContentLoaded', renderScheduleTable);
}

addScheduleWidget();

// run banners and popups
addCookieBanner();
addLaunchPopup();