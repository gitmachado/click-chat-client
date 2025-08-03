# 📱 ClickChat - Modern Android Messaging App

![Demo Image](clickchat-demo.png)

![License](https://img.shields.io/github/license/seu-usuario/clickchat)
![Stars](https://img.shields.io/github/stars/seu-usuario/clickchat?style=social)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-blue)

> 🧪 Project under development.

ClickChat is a real-time Android messaging application built with React Native. It features a modern interface, robust capabilities, and cross-platform support.

---

## 📚 Table of Contents

- [🚀 Overview](#-overview)
- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📱 Prerequisites](#-prerequisites)
- [🚀 Getting Started](#-getting-started)

---

## 🚀 Overview

ClickChat is a modern messaging app built with React Native, offering real-time communication, Google authentication, and a clean, intuitive user experience.

---

## ✨ Features

- ✅ Real-time messaging using WebSocket  
- ✅ Google Sign-In integration  
- ✅ User blocking functionality  
- ✅ Light and Dark theme support  
- ✅ Push notifications  
- ✅ Image sharing  
- ✅ Audio sharing  
- ✅ Emoji picker  
- ✅ Profile customization  
- ✅ Favorite contacts feature  
- ✅ Screen to discovery new contacts  

---

## 🛠 Tech Stack

### 🧩 Core
- **React Native v0.73.4**  
  Main framework for cross-platform mobile development

---

### 🗂️ State Management & Storage
- **Redux**  
  Global state management with pure functions  
- **Context API (React Built-in)**  
  Global state and side-effect handling (e.g., cloud login logic)  
- **@react-native-async-storage/async-storage v1.22.2**  
  Persistent local data storage

---

### 🔐 Authentication & Cloud Services
- **@react-native-firebase/app v18.9.0**  
  Firebase core for initial setup  
- **@react-native-firebase/auth v18.9.0**  
  User authentication and session management  
- **@react-native-firebase/messaging v18.9.0**  
  Push notifications and real-time messaging  
- **@react-native-google-signin/google-signin v11.0.0**  
  Google Sign-In authentication provider

---

### 🔌 Real-Time Communication
- **Socket.IO**  
  Real-time bi-directional client-server communication

---

### 🔀 Navigation
- **@react-navigation/stack v6.3.21**  
  Stack-based navigation between screens

---

### 🎨 UI Components & Styling
- **react-native-element-dropdown v2.10.4**  
  Custom dropdown component  
- **react-native-emoji-selector v0.2.0**  
  Emoji picker component  
- **react-native-animatable v1.4.0**  
  Declarative animations for React Native

---

### 🖼 Media & Images
- **react-native-image-picker v7.1.2**  
  Gallery/camera image selection  
- **@bam.tech/react-native-image-resizer v3.0.9**  
  Image resizing utilities

---

### 🔊 Media Player
- **react-native-track-player v4.1.1**  
  Audio streaming and playback (including HTTP WebRadio sync across clients)

---

### 🧰 Utilities
- **date-fns v3.3.1**  
  Modern date utility functions  
- **react-native-get-random-values v1.10.0**  
  Secure random value generation

---

### 📲 Expo Modules
- **expo-modules-core v1.11.13**  
  Core Expo modules integration  
- **expo-navigation-bar v2.8.1**  
  Navigation bar customization  
- **expo-status-bar v1.11.1**  
  Status bar control and configuration

---

### 💰 Monetization
- **react-native-google-mobile-ads v13.0.2**  
  Google AdMob integration for monetization

---

### 🖐 UI Enhancement & Gesture Handling
- **react-native-reanimated v3.7.1**  
  High-performance animations  
- **react-native-gesture-handler v2.15.0**  
  Gesture and touch handling  
- **react-native-safe-area-context v4.9.0**  
  Handling of safe area insets on various devices

---

## 📱 Prerequisites

Before getting started, ensure you have the following tools and configurations:

- **React Native CLI**  
- **[Node.js](https://nodejs.org/)** (v18 or higher) – Required to run Metro Bundler and the ClickChat server  
- **[npm](https://www.npmjs.com/)** or **[yarn](https://yarnpkg.com/)** – To install project dependencies  
- **Android SDK** – Properly set in system environment variables (`ANDROID_HOME` and `PATH`)  
- **Android emulator** (e.g. Genymotion) **or** a real device  
  - On real devices, enable:  
    - **Developer Options** → **USB debugging**

---

## 🚀 Getting Started

Clone the repository and install the dependencies:

```bash
# Clone the repository
git clone https://github.com/gitmachado/click-chat-client.git

# Navigate to the project folder
cd click-chat-client

# Install dependencies
npm install
# or
yarn install

# Start the Metro Bundler
npx react-native start
