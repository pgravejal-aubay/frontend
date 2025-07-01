
# Dans backend/app, ouvrir un terminal wsl: 
pip install install -r requierments.txt
set FLASK_APP=run.py

flask db init  # Only run once to create the migrations folder
flask db migrate -m "Initial user table"
flask db upgrade # Applies the migration to the database

# modèle POC2
Assurez-vous de placer les fichiers et dossiers suivants aux bons emplacements :
rtmpose-l_simcc-ucoco_dw-ucoco_270e-384x288-2438fd99_20230728.pth →
backend/app/POC2/MMPose/checkpoint/wholebody/

model.pt et vocab.json →
backend/app/POC2/checkpoints/

Dossier flan_model/ →
backend/app/POC2/

python run.py pour run le backend

# Dans frontend ouvrir un terminal powershell:

Intstaller node sur windows et ajouter npm / npx au path

npm install

npx expo install expo-file-system expo-document-picker expo-media-library react-native-picker expo-av expo-audio


npx expo start --clear pour run le frontend

# Pour visualiser

installer android studio, puis lancer le SDK de base,

depuis android studio creer un nouveau device ou alors utiliser l'existant en general c'est un telephone de base, cliquer sur la fleche pour le lancer, si le frontend tourne en meme temps normalement en appuyant sur a dans la console ou le front tourne l'app doit build et etre visualisée depuis l'émulateur. sinon il faut eteindre le telephone et le reallumer puis appuyer sur a dans le frontend.

ajouter la webcam dans les options android studio une fois qu'elle est connectée au fixe