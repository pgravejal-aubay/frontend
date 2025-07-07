# --- Étape 1 : La Base ---
# On part d'une image officielle PyTorch qui contient déjà Python,
# les drivers CUDA et cuDNN pour le GPU.
FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

# --- Étape 2 : Configuration de l'environnement ---
WORKDIR /app
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# --- Étape 3 : Installation des dépendances système ---
# On regroupe toutes les installations système en une seule commande RUN pour optimiser.
#   - build-essential: Pour compiler les extensions C++ (mmcv, etc.)
#   - git: Parfois requis par pip pour installer des paquets depuis des dépôts Git.
#   - libgl1-mesa-glx et libglib2.0-0: Dépendances fondamentales pour OpenCV (corrige l'erreur libGL.so.1)
#   - Autres dépendances courantes pour OpenCV pour éviter des problèmes futurs.
RUN apt-get update && \
    export DEBIAN_FRONTEND=noninteractive && \
    apt-get install -y -qq --no-install-recommends \
    build-essential \
    git \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev && \
    rm -rf /var/lib/apt/lists/*

# --- Étape 4 : Installation des dépendances Python ---
# On copie d'abord requirements.txt pour profiter du cache Docker.
COPY requirements.txt .

# On met à jour pip et on installe les paquets Python.
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# --- Étape 5 : Copie du code de l'application ---
# On copie le reste du code de l'application.
COPY . .

# --- Étape 6 : Configuration du lancement ---
# Exposer le port que l'application écoutera.
EXPOSE 5000

# Commande pour lancer l'application avec Gunicorn.
# gunicorn doit être dans requirements.txt. Si ce n''est pas le cas, décommentez la ligne suivante.
# RUN pip install gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers=1", "--threads=4", "--timeout=120", "run:app"]