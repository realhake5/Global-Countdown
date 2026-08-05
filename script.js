// Simple data storage for users and leaderboard
let users = JSON.parse(localStorage.getItem('users')) || {};
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// Show the countdown
function updateGlobalCountdown() {
    const now = new Date();
    const nextYear = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
    const distance = nextYear - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Update current time
function updateTime() {
    const now = new Date();
    document.getElementById("clock").innerText = now.toLocaleString();
}

// Fetch user's location and weather info
function fetchLocationAndWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const locationResponse = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`);
            const locationData = await locationResponse.json();
            const city = locationData.address.city || locationData.address.town || locationData.address.village;
            const country = locationData.address.country;
            document.getElementById("location").innerText = `${city}, ${country}`;

            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const weatherData = await weatherResponse.json();
            const temp = weatherData.current_weather.temperature;
            const weatherDesc = weatherData.current_weather.weathercode;
            document.getElementById("weather").innerText = `${temp}°C, ${weatherDesc}`;
        });
    } else {
        document.getElementById("location").innerText = "Location not available";
        document.getElementById("weather").innerText = "Weather data not available";
    }
}

// Create a new user account
function registerUser() {
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    if (users[username]) {
        alert("Username already taken. Please choose another.");
    } else {
        users[username] = { password, playtime: 0 };
        localStorage.setItem('users', JSON.stringify(users));
        alert("Account created successfully!");
        showMainMenu(username);
    }
}

// Login an existing user
function loginUser() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    if (users[username] && users[username].password === password) {
        localStorage.setItem('currentUser', username);
        showMainMenu(username);
    } else {
        alert("Invalid username or password.");
    }
}

// Show the main menu after login or registration
function showMainMenu(username) {
    document.getElementById("start-menu").style.display = "none";
    document.getElementById("register-form").style.display = "none";
    document.getElementById("login-form").style.display = "none";
    document.getElementById("main-container").style.display = "block";

    // Update leaderboard and current user data
    updateLeaderboard();
    fetchLocationAndWeather();
    updatePlaytime(username);
}

// Log out the user
function logoutUser() {
    localStorage.removeItem('currentUser');
    document.getElementById("main-container").style.display = "none";
    document.getElementById("start-menu").style.display = "block";
}

// Update the leaderboard
function updateLeaderboard() {
    leaderboard = Object.entries(users).map(([username, data]) => {
        return { username, playtime: data.playtime };
    }).sort((a, b) => b.playtime - a.playtime);

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    const leaderboardList = document.getElementById("leaderboard");
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        const li = document.createElement("li");
        li.innerText = `${entry.username}: ${entry.playtime} minutes`;
        leaderboardList.appendChild(li);
    });
}

// Increment playtime every minute (or however often you prefer)
function updatePlaytime(username) {
    if (username) {
        // Simulate playtime incrementing (you can change the logic to update playtime more frequently)
        setInterval(() => {
            users[username].playtime += 1; // Increment playtime by 1 minute
            localStorage.setItem('users', JSON.stringify(users));
            updateLeaderboard(); // Update the leaderboard after updating playtime
        }, 60000); // Increment playtime every minute
    }
}

// Event listeners
document.getElementById("register-btn").addEventListener("click", function() {
    document.getElementById("start-menu").style.display = "none";
    document.getElementById("register-form").style.display = "block";
});

document.getElementById("login-btn").addEventListener("click", function() {
    document.getElementById("start-menu").style.display = "none";
    document.getElementById("login-form").style.display = "block";
});

document.getElementById("submit-register").addEventListener("click", registerUser);
document.getElementById("submit-login").addEventListener("click", loginUser);
document.getElementById("cancel-register").addEventListener("click", function() {
    document.getElementById("register-form").style.display = "none";
    document.getElementById("start-menu").style.display = "block";
});
document.getElementById("cancel-login").addEventListener("click", function() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("start-menu").style.display = "block";
});

document.getElementById("logout-btn").addEventListener("click", logoutUser);

// Update countdown and time every second
setInterval(updateGlobalCountdown, 1000);
setInterval(updateTime, 1000);

