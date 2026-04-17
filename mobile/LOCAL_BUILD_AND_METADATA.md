# SS-Infra: Local Build & App Store Metadata

This document provides all the details you need to build your app locally and prepare for the Google Play Store.

## 1. Play Store Description (Draft)

**App Title:** SS-Infra
**Short Description:** Comprehensive infrastructure and logistics management for Owners, Drivers, and Operators.

**Full Description:**
Manage your infrastructure projects and logistics with ease. SS-Infra is a powerful, multi-role platform designed to streamline operations across your entire fleet and project sites.

**Key Features:**
*   **For Owners**: Real-time overview of your infrastructure, projects, and financial performance. Track your fleet and maximize ROI.
*   **For Operators**: Efficiently manage project schedules, coordinate with drivers, and ensure smooth on-site operations. 
*   **For Drivers**: Easy portal for task management, route navigation, and status updates.
*   **Real-time Tracking**: Stay updated with live maps and location services.
*   **Secure Payments**: Integrated Razorpay for seamless financial transactions.
*   **Instant Notifications**: Never miss an update with real-time push notifications.

---

## 2. Generating Your Local Keystore

A keystore is your "digital signature" for the app. **Keep it safe!** If you lose it, you cannot update your app.

To generate a new keystore on your machine, run the following command in your terminal:

```powershell
keytool -genkey -v -keystore ssinfra-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ssinfra-alias
```

**What you'll need to remember (You will be prompted for these):**
*   **Keystore password**: Choose a strong password (you will need it for every build).
*   **Alias name**: `ssinfra-alias` (as set in the command above).
*   **Key password**: Usually the same as the keystore password.

---

## 3. Local Build Commands (Windows)

Expo's `eas build --local` is **not supported on Windows**. You must use the "Prebuild & Gradle" method.

### Step 1: Generate the Android project
Run this command in the `mobile` directory to create the `android` folder:
```powershell
npx expo prebuild --platform android
```

### Step 2: Build the AAB (For Play Store)
Once the `android` folder is created, run this from the `mobile` directory:
```powershell
cd android
./gradlew bundleRelease
```

### Step 3: Build the APK (For Testing)
Run this from the `mobile/android` directory:
```powershell
./gradlew assembleRelease
```

---

## 4. Keystore & Alias Data Summary

| Attribute | Value |
| :--- | :--- |
| **Keystore File** | `ssinfra-release-key.jks` |
| **Key Alias** | `ssinfra-alias` |
| **Keystore Pass** | `ssinfra123` |
| **Key Pass** | `ssinfra123` |
| **Validity** | 10,000 days |

---

> [!IMPORTANT]
> To use the keystore with Gradle, you will need to add the signing configuration to your `android/app/build.gradle` file after you run `npx expo prebuild`. If you'd like, I can help you automate this part once the folder is created.
