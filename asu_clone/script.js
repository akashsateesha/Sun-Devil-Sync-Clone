// ASU Sun Devil Central - Data and Functionality

// Scraped data from ASU Sun Devil Central
const scrapedData = {
    "my_groups": [
        "Indian Students' Association at ASU"
    ],
    "suggested_groups": [
        "BRASA at ASU",
        "Association of Latino Professionals For America",
        "The Pre-Law Society"
    ],
    "announcements": [
        {
            "title": "Sun Devils are back - we game day together!",
            "content": "Join us for an exciting season of ASU sports! Show your Sun Devil pride and connect with fellow fans.",
            "badge": "Featured"
        },
        {
            "title": "Homecoming at ASU",
            "content": "Celebrate Homecoming week with events, activities, and traditions. Don't miss the parade and football game!",
            "badge": "Event"
        }
    ],
    "upcoming_events": [
        {
            "title": "Global Innovation Night",
            "date": "Nov 25",
            "month": "NOV",
            "day": "25",
            "time": "6:00 PM - 9:00 PM",
            "location": "Memorial Union",
            "description": "Showcase of innovative projects from students around the world"
        },
        {
            "title": "Book Club for International Students",
            "date": "Nov 27",
            "month": "NOV",
            "day": "27",
            "time": "4:00 PM - 5:30 PM",
            "location": "Hayden Library",
            "description": "Monthly book discussion and cultural exchange"
        },
        {
            "title": "The Poly Games",
            "date": "Dec 1",
            "month": "DEC",
            "day": "01",
            "time": "10:00 AM - 4:00 PM",
            "location": "Polytechnic Campus",
            "description": "Annual sports competition and community celebration"
        },
        {
            "title": "Winter Career Fair",
            "date": "Dec 5",
            "month": "DEC",
            "day": "05",
            "time": "9:00 AM - 3:00 PM",
            "location": "Sun Devil Stadium",
            "description": "Connect with top employers and explore career opportunities"
        },
        {
            "title": "Cultural Festival",
            "date": "Dec 8",
            "month": "DEC",
            "day": "08",
            "time": "5:00 PM - 10:00 PM",
            "location": "Tempe Campus",
            "description": "Celebrate diversity with food, music, and performances"
        },
        {
            "title": "Finals Week Study Sessions",
            "date": "Dec 12",
            "month": "DEC",
            "day": "12",
            "time": "All Day",
            "location": "Various Locations",
            "description": "Group study sessions and academic support"
        }
    ],
    "more_groups": [
        { "name": "Kendo at ASU", "members": 45, "category": "Sports" },
        { "name": "Kinesiology Honors Society at ASU", "members": 120, "category": "Academic" },
        { "name": "Korean Students Association", "members": 230, "category": "Cultural" },
        { "name": "ASU Robotics Club", "members": 180, "category": "Technology" },
        { "name": "Photography Club", "members": 95, "category": "Arts" },
        { "name": "Sustainability Coalition", "members": 150, "category": "Advocacy" },
        { "name": "Chess Club", "members": 60, "category": "Recreation" },
        { "name": "Entrepreneurship Society", "members": 200, "category": "Business" },
        { "name": "Dance Marathon", "members": 175, "category": "Service" },
        { "name": "Astronomy Club", "members": 85, "category": "Science" },
        { "name": "Gaming Guild", "members": 310, "category": "Recreation" },
        { "name": "Pre-Med Society", "members": 280, "category": "Academic" },
        { "name": "Film Production Club", "members": 110, "category": "Arts" },
        { "name": "Cycling Club", "members": 90, "category": "Sports" },
        { "name": "Women in STEM", "members": 250, "category": "Academic" },
        { "name": "Debate Team", "members": 70, "category": "Academic" }
    ],
    "funding_opportunities": [
        {
            "title": "GSO Event Funding",
            "description": "Funding for Graduate Student Organization events and activities",
            "deadline": "December 1, 2025",
            "amount": "Up to $2,000"
        },
        {
            "title": "Operations Funding",
            "description": "Support for student organization operational expenses",
            "deadline": "January 15, 2026",
            "amount": "Up to $5,000"
        },
        {
            "title": "Undergraduate Research Grant",
            "description": "Funding for undergraduate research projects and presentations",
            "deadline": "November 30, 2025",
            "amount": "Up to $1,500"
        },
        {
            "title": "Graduate Travel Grant",
            "description": "Support for graduate students attending conferences",
            "deadline": "December 15, 2025",
            "amount": "Up to $1,000"
        }
    ]
};

// Group icons mapping
const groupIcons = {
    "Cultural": "🌍",
    "Academic": "📚",
    "Sports": "⚽",
    "Technology": "💻",
    "Arts": "🎨",
    "Advocacy": "🌱",
    "Recreation": "🎮",
    "Business": "💼",
    "Service": "❤️",
    "Science": "🔬"
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadAnnouncements();
    loadMyGroups();
    loadSuggestedGroups();
    loadEvents();
    loadMoreGroups();
    loadFundingOpportunities();
    setupEventPagination();
    setupGroupSearch();
    addScrollAnimations();
});

// Load announcements
function loadAnnouncements() {
    const grid = document.getElementById('announcements-grid');

    scrapedData.announcements.forEach(announcement => {
        const card = document.createElement('div');
        card.className = 'card announcement-card fade-in';
        card.innerHTML = `
            <span class="announcement-badge">${announcement.badge}</span>
            <h3 class="card-title">${announcement.title}</h3>
            <p class="card-description">${announcement.content}</p>
        `;
        grid.appendChild(card);
    });
}

// Load my groups
function loadMyGroups() {
    const grid = document.getElementById('my-groups-grid');

    scrapedData.my_groups.forEach(groupName => {
        const card = document.createElement('div');
        card.className = 'card group-card fade-in';
        card.innerHTML = `
            <div class="group-icon">🇮🇳</div>
            <div class="group-info">
                <div class="group-name">${groupName}</div>
                <div class="group-members">Member since 2024</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Load suggested groups
function loadSuggestedGroups() {
    const grid = document.getElementById('suggested-groups-grid');
    const icons = ['🇧🇷', '💼', '⚖️'];

    scrapedData.suggested_groups.forEach((groupName, index) => {
        const card = document.createElement('div');
        card.className = 'card group-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="group-icon">${icons[index]}</div>
            <div class="group-info">
                <div class="group-name">${groupName}</div>
                <div class="group-members">${Math.floor(Math.random() * 200) + 50} members</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Event pagination
let currentEventPage = 0;
const eventsPerPage = 3;

function loadEvents() {
    const grid = document.getElementById('events-grid');
    grid.innerHTML = '';

    const start = currentEventPage * eventsPerPage;
    const end = start + eventsPerPage;
    const eventsToShow = scrapedData.upcoming_events.slice(start, end);

    eventsToShow.forEach((event, index) => {
        const card = document.createElement('div');
        card.className = 'card event-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="event-date">
                <div class="event-month">${event.month}</div>
                <div class="event-day">${event.day}</div>
            </div>
            <div class="event-info">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-details">
                    <div class="event-detail">🕒 ${event.time}</div>
                    <div class="event-detail">📍 ${event.location}</div>
                    <div class="event-detail">${event.description}</div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    updateEventPagination();
}

function setupEventPagination() {
    const prevBtn = document.getElementById('prev-events');
    const nextBtn = document.getElementById('next-events');

    prevBtn.addEventListener('click', () => {
        if (currentEventPage > 0) {
            currentEventPage--;
            loadEvents();
        }
    });

    nextBtn.addEventListener('click', () => {
        const maxPage = Math.ceil(scrapedData.upcoming_events.length / eventsPerPage) - 1;
        if (currentEventPage < maxPage) {
            currentEventPage++;
            loadEvents();
        }
    });
}

function updateEventPagination() {
    const maxPage = Math.ceil(scrapedData.upcoming_events.length / eventsPerPage);
    const info = document.getElementById('events-pagination-info');
    const prevBtn = document.getElementById('prev-events');
    const nextBtn = document.getElementById('next-events');

    info.textContent = `Page ${currentEventPage + 1} of ${maxPage}`;
    prevBtn.disabled = currentEventPage === 0;
    nextBtn.disabled = currentEventPage === maxPage - 1;
}

// Load more groups
function loadMoreGroups(filter = '') {
    const grid = document.getElementById('more-groups-grid');
    grid.innerHTML = '';

    const filteredGroups = scrapedData.more_groups.filter(group =>
        group.name.toLowerCase().includes(filter.toLowerCase())
    );

    filteredGroups.forEach((group, index) => {
        const card = document.createElement('div');
        card.className = 'card group-card fade-in';
        card.style.animationDelay = `${(index % 12) * 0.05}s`;
        const icon = groupIcons[group.category] || '👥';
        card.innerHTML = `
            <div class="group-icon">${icon}</div>
            <div class="group-info">
                <div class="group-name">${group.name}</div>
                <div class="group-members">${group.members} members</div>
            </div>
        `;
        grid.appendChild(card);
    });

    if (filteredGroups.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No groups found matching your search.</p>';
    }
}

// Setup group search
function setupGroupSearch() {
    const searchBar = document.getElementById('groups-search');

    searchBar.addEventListener('input', (e) => {
        loadMoreGroups(e.target.value);
    });
}

// Load funding opportunities
function loadFundingOpportunities() {
    const grid = document.getElementById('funding-grid');

    scrapedData.funding_opportunities.forEach((funding, index) => {
        const card = document.createElement('div');
        card.className = 'card funding-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <h3 class="card-title">${funding.title}</h3>
            <p class="card-description">${funding.description}</p>
            <div class="funding-deadline">
                ⏰ Deadline: ${funding.deadline}
            </div>
            <div style="margin-top: 12px; color: var(--asu-gold); font-weight: 600;">
                ${funding.amount}
            </div>
        `;
        grid.appendChild(card);
    });
}

// Add scroll animations
function addScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
