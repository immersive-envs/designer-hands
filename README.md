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
  - [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

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
Devices with 16GB RAM, 3.8GHz hexa-core CPU, GTX1070Max-Q above are recommended (guarantees solid 30fps realtime design experience).

### Prerequisites
*A WORKING RGB CAMERA IS COMPULSORY!*

For getting your hands on the Designer Hands, please make sure you have a device that has a nvidia CUDA GPU equipped. It is used for the backend hand mesh generation (we are currently working on the Docker version which aims for deployment in the server environment.) Currently, our backend is only supported on Windows (suggests Windows 10) & Linux(Ubuntu, Debian). 

Cameras with higher resolution, more FPS (30fps+), and higher dynamic range is always a good bonus to the using experience.

### Installation

Download and install Node.js@v18.17.0 from https://nodejs.org/dist/v18.17.0/win-x64/node.exe

Please make sure npm has the following packages installed:
- archiver@5.3.1
- electron@20.0.2
- file-saver@2.0.5
- image-data-uri@2.0.1
- immediate@3.0.6
- jszip@3.10.1 
- lie@3.3.0
- setimmediate@1.0.5
- pako@1.0.11
- three@0.144.0
- webcamjs@1.0.26
This can be done through:
```
npm install PACKAGE_NAME@VERSION
```
