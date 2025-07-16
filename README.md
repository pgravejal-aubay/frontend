# Hands Up Installation Guide


## Prerequisites
 - Python 3.8.20
 - `pip` and `venv` (or `conda`) for environment management


## Pour lancer le backend (dans hands-up/backend)
 ### In a wsl terminal
 1) Create and activate a virtual environment :
   
    - With venv : 
    ```bash
        python -m venv venv
        # On macOS/Linux
        source venv/bin/activate
        # On Windows
        venv\Scripts\activate
    ```

    - With conda :
    ```bash
    conda create --name env python=3.8.20 -y
    conda activate env
    ```
2) Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

3) Setup the Database
    ```bash
    set FLASK_APP=run.py
    flask db init  # Only run once to create the migrations folder
    flask db migrate -m "Initial user table"
    flask db upgrade # Applies the migration to the database
    ```

4) Run the backend
   ```bash
   python run.py
   ```

## Pour lancer le frontend (dans hands-up/frontend) 
### In a powershell terminal

1) Install and setup node
     - Installer node sur windows
     - Ajouter node au path dans les variables d'environnement de l'ordinateur
  

2) Install npm and the expo library
    ```bash
        npm install
        npx expo install expo-file-system expo-document-picker expo-media-library react-native-picker expo-av expo-audio
    ```

3) Run the frontend
    ```bash
    npx expo start --clear
    ```

## App Preview Guide

### Using an Emulator (Android Studio)

1. **Install Android Studio**  
   - Launch the base SDK.

2. **Create or Launch a Virtual Device**  
   - Either create a new device or use the default one (usually a basic phone).
   - Click the play button to start the emulator.

3. **Run the App**  
   - If the frontend is already running, press `a` in the terminal where the frontend is running.
   - The app should build and appear in the emulator.
   - If it doesn’t:
     - Turn off the virtual device.
     - Restart it.
     - Press `a` again in the frontend terminal.

4. **Enable Webcam (Optional)**  
   - Connect your webcam to your computer.
   - In Android Studio, click the three dots next to the device name.
   - Go to **"Edit" > "Advanced Settings"**.
   - Add the webcam under additional settings.


##  Using a Physical Mobile Device (Android Only)

1. **Connect via QR Code**  
   - Scan the QR code displayed in the terminal (PowerShell).
   - Install **Expo Go** if prompted.
   - The app should launch automatically.

2. **If the Build Hangs**  
   - Close **Expo Go** completely (make sure all tabs are closed).
   - Restart the frontend.
   - Re-scan the QR code.
