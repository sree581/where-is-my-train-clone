# 🚆 Where Is My Train — Simple Train Tracker!

> 📘 This is the short, beginner-friendly overview. For full technical documentation (setup, environment variables, middleware, API reference, MongoDB models, testing, troubleshooting) see the main [README.md](../README.md).

Welcome to the **Where Is My Train** website! This is a simple, easy-to-use website that helps you find out where your train is, what time it will arrive, and where your train car is standing on the station platform! 🚂💨

---

## ❓ What Is This Project?

Imagine you are going on a fun trip with your family on a big train! 🎟️ 

Sometimes trains are super fast, but sometimes they get slow or stuck. Instead of sitting at the noisy station waiting and wondering *"Where is my train?"*, you can open this website on a phone or computer! 

It acts like a magic spy camera for trains across India! 🇮🇳✨

---

## 🌟 Cool Things This Website Can Do (Features)

* 🔍 **Search Live Trains:** Type in a train name or number to see exactly where it is moving right now on a map!
* 📋 **Check PNR Status:** Type your ticket number (PNR) to see if your seat is confirmed or if you get a bed near the window! 🛏️
* 🚃 **Coach & Seat Finder:** Helps you find where your train car (coach like B1, S3, or A1) will stop on the platform so you don't have to run with heavy bags! 🧳
* ❓ **Help Desk Button:** A small question-mark button (`?`) in the top right corner that takes you to a helper page (`helpdesk.html`) if you get confused or need extra help!
* 🎨 **Dark Mode Theme:** A dark screen mode so you can look at train times at night without hurting your eyes! 🌙

---

## 📁 What Is Inside the Folders? (File Map)

Here is a list of every single toy in our software toolbox:

| File Name | What It Does (In Simple Words) |
| :--- | :--- |
| **`index.html`** | The main home page of the website with the big blue header banner! 🏠 |
| **`index-legacy.html`** | The classic version of the train tracker page! |
| **`train-list.html`** | Shows all trains between two stations (`train-list.html?from=QLN&to=ERS`). 🚉 |
| **`tracking.html`** | Live running status and schedule of one train (`tracking.html?train=12626`). 📍 |
| **`coach.html`** | The special page that shows train coaches and seat maps (`coach.html?train=12626`)! 🚃 |
| **`helpdesk.html`** | The helper page for answering common passenger questions! 🙋‍♂️ |
| **`css/home.css`** | The main paint bucket! Gives the website nice fonts, spacing, and page layouts. 🎨 |
| **`style.css`** | The extra styling sheet that controls header colors, timeline tracks, and night mode! 🖌️ |
| **`js/home.js`** | The brain behind the screens! Makes buttons click, tabs switch, and searches work. 🧠 |

---

## 🛠️ How to Open and Play With It

You don't need any supercomputers or heavy installations to run this!

1. **Download the project** to your computer.
2. **Start the backend** (it talks to RapidAPI and MongoDB Atlas):
   * Copy `backend/.env.example` to `backend/.env` and fill in your own keys (never commit `.env`!).
   * In the `backend` folder run `npm install`, then `node server.js`.
   * The server runs on `http://localhost:5000` with these routes:
     `/api/trains/spot/:train`, `/api/trains/between/:from/:to`, `/api/trains/coach/:train`, `/api/pnr/:pnr`, `/api/history`.
   * Coach position and PNR status come live from RapidAPI. Live running status and trains-between-stations
     are not offered by the current RapidAPI plan, so those pages show clearly labelled sample data.
3. Find the file named **`index.html`**.
4. **Double-click it!** It will open right in your web browser (like Google Chrome or Safari).
5. Click on the top tabs to switch between **Search Train**, **PNR Status**, and **Coach Position**.
6. Click the `?` icon on the top-right header anytime you want to visit the Help Desk! 🆘

---

## 🧱 What Was Used to Build It?

* **HTML5:** The wooden building blocks that give the site its structure.
* **CSS3:** The colorful paint and decorations that make the header dark blue and buttons shiny.
* **JavaScript (JS):** The electric wires inside that make buttons react when you press them!

---

## 💡 Future Fun Ideas
* 🔔 Add live sound notifications when a train reaches your station!
* 🍔 Add a button to order yummy food right to your train seat!