FROM pytorch/pytorch:2.6.0-cuda12.4-cudnn9-devel

ENV DEBIAN_FRONTEND=noninteractive
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/

RUN apt-get update && apt-get install ffmpeg libsm6 libxext6 openjdk-8-jdk wget -y && apt-get clean

RUN wget -P backend/app/POC2/MMPose/checkpoint/wholebody/ https://download.openmmlab.com/mmpose/v1/projects/rtmposev1/rtmpose-l_simcc-ucoco_dw-ucoco_270e-384x288-2438fd99_20230728.pth

COPY ./backend/requirements.txt /tmp/requirements.txt

RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY ./backend /workspace/backend

ENTRYPOINT [ "/bin/bash" ]