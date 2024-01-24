# designer-hands

 ’Designer Hands,’ a 3D hand gesture designing pipeline aimed at
simplifying the gestural interface design process for immersive computing appli-
cations. This tool enables designers to use their bare hands freely to design both
static and dynamic hand gestures and to test and verify them with AR/VR
head-mounted displays (HMDs) without the need to own AR/VR devices in
the early design stages. This approach facilitates rapid prototyping and more
natural hand gesture design, as designers can perform the gestures themselves
and then incorporate them into the design, testing them on different platforms.
This abstract provides a high-level overview of the pipeline, and the full paper
will delve into the design architectures, the use of machine learning models, and
the evaluation of the design with real AR/VR HMDs. We hope DH will attract
many designers to explore gesture interaction designs for immersive computing
applications.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Configuration](#configuration)
    - [Frontend](#frontend)
    - [Backend](#backend)
- [Usage](#usage)
- [Pics](#pics)
- [License](#license)

## Features

- Static hand gesture design mesh generation.
- Static hand gesture design joint coordinates data generation.
- Static hand gesture design RGB photo output.
- Real-time hand gesture movement coordination recording.
- Flexibility of combining hand shape/movements in the hand gesture design.
- User friendly GUI design.
- Individually-deployable frontend & backend design (backend cloud deploy potential)
- Wide frontend compatability thanks to Nodejs & Electron (Windows, MacOS, Ubuntu, Web...)
- Experiment evaluated effiency.

## Getting Started
Devices with 16GB RAM, 3.8GHz hexa-core CPU, GTX1070Max-Q above are recommended for decent realtime design experience.

### Prerequisites
*A WORKING RGB CAMERA IS COMPULSORY!*

For getting your hands on the Designer Hands, please make sure you have a device that has a nvidia CUDA GPU equipped. It is used for the backend hand mesh generation (we are currently working on the Docker version which aims for deployment in the server environment.) Currently, our backend is only supported on Windows (suggests Windows 10) & Linux(Ubuntu, Debian). 

Cameras with higher resolution, more FPS (30fps+), and higher dynamic range is always a good bonus to the using experience.

### Configuration

#### Frontend

If Node.js is not installed on your computer, please visit https://nodejs.org/dist/v18.17.0/, download node-v18.17.0-x64.msi, and follow the GUI instructions of the installer to install Node.js version 18.17.0.

All the required Node.js packages are listed in the package.json. Thus, after installing Node.js, go to the 'designer-hand' directory and run the `npm update` command. When you run npm update, npm will look at the dependencies listed inside package.json file and check for newer versions that still satisfy the version constraints (if any) specified for each dependency. After that, run ```npm start```.

#### Backend
The Backend is designed base on IntagHand(https://github.com/Dw1010/IntagHand). However, the setup procedures are different due to the changes and optimizations made for supporting front-end features and inferencing effiency.

Create a python virtual environment with conda:
```
Conda create -n Designer_hand python=3.8
```

Please make sure the following packages are installed in the virtual environment Designer_hand:
- pytorch 1.12.0+cu116
- torchvision 0.13.0+cu116
- pytorch3D 0.7.0
- Opencv-python
- tqdm
- yacs >= 0.1.8

## Usage
Start the backend within the Designer_hand virtual environment:
```
Conda activate Designer_hand
cd IntagHand
python IntagHand/simplified.py
```
Followed by the frontend:
```
npm start
```
The **DesignJson** directory contains the saved gesture's hand joint 3D coordinates.

The **HandPoseMesh** directory contains the saved gesture's static hand shape mesh (showed on GUI for review).

The **img** directory contains the saved gesture's captured hand shape picture from camera stream.



The **test/test.py** responsible for hand gesture similarity comparisons between two designs, which can be run by:
 ```
python test.py --mode ? --first ? --second ? --threshold ?
```
**Mode** for hand pose design similarity check: 'PC-PC' (default) for two PC tool designed hand poses, 'AR-PC' for a hololens captured hand pose and a PC designed.

**First** for the first designed pose file directory.

**Second** for the second designed pose file directory.

**Threshold** for defining hand pose matching acceptance rate (default to 0.9).

## Pics
![Screenshot 2023-12-12 052906](https://github.com/immersive-envs/designer-hands/assets/22673200/5efcdc99-7ab7-44b5-bf47-4dda6973601b)

![Screenshot 2023-12-12 053029](https://github.com/immersive-envs/designer-hands/assets/22673200/be3eca35-1629-4847-9ac2-e88e21f7549f)

## License
This project is under Apache License 2.0.
