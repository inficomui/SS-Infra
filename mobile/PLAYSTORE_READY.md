# 🚀 SS-Infra: Play Store & Keystore Data

This file contains all the critical information you need to upload your app and manage your release credentials.

---

## 🏗️ 1. App Store Details (Metadata)

**App Title**: SS-Infra
**Short Description**: Comprehensive infrastructure and logistics management – built for Owners, Drivers, and Operators.

**Full Description**:
Manage your fleet and projects seamlessly. SS-Infra is a multi-role management solution designed to optimize logistics and infrastructure operations for businesses of any scale.

**Key Features**:
*   **Owners**: Real-time fleet performance and project financial overviews.
*   **Operators**: Efficient on-site coordination and task management.
*   **Drivers**: Simple portal for task status, navigation, and streamlined reporting.
*   **Payments**: Integrated Razorpay support for seamless transactions.
*   **Tracking**: Full integration with Maps and real-time notifications.

---

## 🔑 2. Release Credentials (Keystore)

| Attribute | Value |
| :--- | :--- |
| **Keystore File** | `ssinfra-release-key.jks` |
| **Key Alias** | `ssinfra-alias` |
| **Keystore Password** | `ssinfra123` |
| **Key Password** | `ssinfra123` |
| **Validity** | 10,000 days (approx. 27 years) |
| **Storage Path** | `mobile/ssinfra-release-key.jks` |

---

## 🛠️ 3. How to use this with Gradle (Signing)

To make your `./gradlew bundleRelease` work correctly with this keystore, I can help you update your `android/app/build.gradle` file.

**Current build command**:
```powershell
./gradlew bundleRelease
```
*Note: The generated AAB will be located at: `android/app/build/outputs/bundle/release/app-release.aab`*

---

## 📝 4. Play Store Checklist
1.  **AAB File**: The file produced by the Gradle command.
2.  **Privacy Policy**: Make sure you have a URL for your policy.
3.  **Data Safety**: You will need to declare that you use Location and Payment data.
4.  **Icons**: Your app is already using the new logos in `app.json`.

---
**Warning**: Never share your `ssinfra-release-key.jks` file or passwords with anyone. If you lose this file, you cannot update your app ever again on the Play Store.
