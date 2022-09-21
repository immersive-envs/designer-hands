# Import libraries 
import numpy as np
import torch
import cv2 as cv
import glob
import os
import argparse
import fnmatch
import time

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.model import load_model
from utils.config import load_cfg
from utils.utils import get_mano_path, imgUtils
from dataset.dataset_utils import IMG_SIZE
from core.test_utils import InterRender

if __name__ == '__main__':
    # Parse arguments (Not need to set)
    parser = argparse.ArgumentParser()
    parser.add_argument("--cfg", type=str, default='misc/model/config.yaml')
    parser.add_argument("--model", type=str, default='misc/model/wild_demo.pth')
    parser.add_argument("--save_path", type=str, default='../handPoseMesh')
    parser.add_argument("--render_size", type=int, default=256)
    opt = parser.parse_args()
    # Model initalize
    model = InterRender(cfg_path=opt.cfg,
                        model_path=opt.model,
                        render_size=opt.render_size)
    # Obtain input images
    shutdown = False
    mode_seperate = True
    # Process
    print("Module successfully setup, waiting for request...")
    pose_capture_exist=[]
    for file in os.listdir("../img"):
        if fnmatch.fnmatch(file, "*.jpg"):
            pose_capture_exist.append(file)
    # Wait for requests
    while shutdown==False:
        new_pose_capture=[]
        for file in os.listdir("../img"):
            if fnmatch.fnmatch(file, "*.jpg"):
                new_pose_capture.append(file)
        if len(pose_capture_exist) > len(new_pose_capture):
            break
        new_pose = list(set(new_pose_capture)-set(pose_capture_exist))
        if len(new_pose)==0:
            continue
        new_pose = new_pose[0]
        img_name = new_pose
        inp = "../img/" + new_pose
        time.sleep(0.2)
        img = cv.imread(inp)
        print(inp)
        params = model.run_model(img)
        v3d_left=params['v3d_left'].cpu()
        v3d_right=params['v3d_right'].cpu()
        # Concatenate left and right hand faces
        left_faces = torch.from_numpy(model.left_faces.astype(np.int64)).to('cpu').unsqueeze(0)
        right_faces = torch.from_numpy(model.right_faces.astype(np.int64)).to('cpu').unsqueeze(0)
        left_faces = right_faces[..., [1, 0, 2]]
        # Output for each hand individually
        #if mode_seperate:
        left_ver = v3d_left.detach().numpy()[0]
        right_ver = v3d_right.detach().numpy()[0]
        left_f = left_faces.detach().numpy()[0]
        right_f = right_faces.detach().numpy()[0]
        model.save_obj(os.path.join(opt.save_path, img_name + '_outputR.obj'),left_ver,left_f)
        model.save_obj(os.path.join(opt.save_path, img_name + '_outputL.obj'),right_ver,right_f)
        print(img_name + ".jpg processed Success! (Seperated)")
        #else:
        # Output for each hand together
        lrfaces = torch.cat((left_faces, right_faces + 778), dim=1).detach().numpy()
        v3d = torch.cat((v3d_left, v3d_right), dim=1).detach().numpy()
        model.save_obj(os.path.join(opt.save_path, img_name + '_output.obj'),v3d[0],lrfaces[0])
        print(img_name + ".jpg processed Success! (Concatenated)")
        pose_capture_exist = new_pose_capture
                
                    


