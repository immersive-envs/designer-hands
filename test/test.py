import json
import numpy as np
from numpy.linalg import norm
import argparse

# Opening JSON file
parser = argparse.ArgumentParser()
parser.add_argument('-m', '--mode', type=str, default='PC-PC',
    help="Mode for hand pose design similarity check: 'PC-PC' for two PC tool designed hand poses, 'AR-PC' for a hololens captured tool hand pose and a PC designed")
parser.add_argument('--f','--first', type=str, required=True, help="The first designed pose file")
parser.add_argument('--s','--second', type=str, required=True, help="The second designed pose file")
parser.add_argument('--t','--threshold', type=float, default=0.8, help="The threshold for defining hand pose matching, default to 0.9")
opt = parser.parse_args()

f = open(opt.f)
f1 = open(opt.s)

def checkMoveAndPro():
    for i in range(len(data)):
        if (data[i]['type']=="Move"):
            if (data1[i]['type']!="Move" or data[i]["Label"]!=data1[i]["Label"]):
                print(str(i)+ "th Movements does't match!")
                exit()
        else:
            p1L.append(data[i]['left'])
            p1R.append(data[i]['right'])
            p2L.append(data1[i]['left'])
            p2R.append(data1[i]['right'])

def cosinsim(A,B):
    if (A==[] and B==[]):
        return "True"
    if (len(A)!=len(B)):
        cosine = "Pose doesn't match!"
        exit()
    else:
        cosine = np.dot(A,B)/(norm(A)*norm(B))
    return cosine

def calculateMatch(A,B):
    numpose = len(A)
    if (numpose!=len(B)):
        print("Numbers of Poses not matching!")
        exit()
    mat = []
    for n in range(numpose):
        avg = []
        if (len(A[n])!=len(B[n])):
            print("Pose missing, not matching!")
            exit()
        for i in range(len(A[n])):
            cis = cosinsim(A[n][i],B[n][i])
            if (cis=="True"):
                cis = 1
            avg.append(cis)
        mat.append(avg)
    return mat

# Weighted similarity score policy (AR-PC) (50%-25%-15%-10%)
def weightedSim(lst):
    if lst==[]:
        return 1
    rst = []
    for i in lst:
        if i ==[]:
            rst.append(1)
        else:
            wetScore = 0
            for j in range(0,len(i),4):
                wetScore += i[j]*0.5
                wetScore += i[j+1]*0.25
                wetScore += i[j+2]*0.15
                wetScore += i[j+3]*0.1
            rst.append(wetScore/5)
    return rst

if (opt.mode=='PC-PC'):
    print('PC and PC comparsion')
    data = json.load(f)
    data1 = json.load(f1)
    p1L = []
    p1R = []
    p2L = []
    p2R = []
    checkMoveAndPro()
    print("All movements are matched.")
else:
    if (opt.mode=='AR-PC'):
        print("AR and PC comparsion")
        data = json.load(f)
        data1 = json.load(f1)
        p1L = []
        p1R = []
        p2L = []
        p2R = []
        for i in range(len(data1)):
            if (data1[i]['type']=="pose"):
                p2L.append(data1[i]['left'])
                p2R.append(data1[i]['right'])
        frames = list(data.keys())
        buffer = []
        for j in range(len(frames)):
            if frames[j]=='flag':
                if buffer ==[]:
                    print("Invalid AR record!")
                    exit()
                else:
                    if data[frames[j]]=='l':
                        p1L.append(buffer[0])
                        p1R.append([])
                    else:
                        p1R.append(buffer[0])
                        p1L.append([])
            else:
                joints = list(data[frames[j]].keys())
                numjoints = len(joints)
                buffer.append(list(data[frames[j]][k] for k in joints))
    else:
        print("AR and AR comparsion")
        data = json.load(f)
        data1 = json.load(f1)
        p1L = []
        p1R = []
        p2L = []
        p2R = []
        frames = list(data.keys())
        buffer = []
        for j in range(len(frames)):
            if frames[j]=='flag':
                if buffer ==[]:
                    print("Invalid AR record!")
                    exit()
                else:
                    if data[frames[j]]=='l':
                        p1L.append(buffer[0])
                        p1R.append([])
                    else:
                        p1R.append(buffer[0])
                        p1L.append([])
            else:
                joints = list(data[frames[j]].keys())
                numjoints = len(joints)
                buffer.append(list(data[frames[j]][k] for k in joints))
        frames = list(data1.keys())
        buffer = []
        for j in range(len(frames)):
            if frames[j]=='flag':
                if buffer ==[]:
                    print("Invalid AR record!")
                    exit()
                else:
                    if data1[frames[j]]=='l':
                        p2L.append(buffer[0])
                        p2R.append([])
                    else:
                        p2R.append(buffer[0])
                        p2L.append([])
            else:
                joints = list(data1[frames[j]].keys())
                numjoints = len(joints)
                buffer.append(list(data1[frames[j]][k] for k in joints))

lefthand = calculateMatch(p1L,p2L)
righthand = calculateMatch(p1R,p2R)

# Weighted similarity score policy (40%-30%-20%-10%)
lmin = weightedSim(lefthand)
rmin = weightedSim(righthand)

lfail = 0
rfail = 0
for l in range(len(lmin)):
    if (lmin[l]<opt.t):
        # print(lefthand)
        print("The left hand pose "+str(l)+" doesn't match, with minimum accuracy: ")
        print(lmin[l])
        lfail += 1
for r in range(len(rmin)):
    if (rmin[l]<opt.t):
        print("The right hand pose "+str(r)+" doesn't match, with minimum accuracy: ")
        print(rmin[r])
        rfail += 1
if (lfail==0):
    # print(lefthand)
    print("All left hand poses are matched.")
else:
    print("Total "+ str(lfail) + " left hand poses mismatched.")
if (rfail==0):
    # print(righthand)
    print("All right hand poses are matched.")
else:
    print("Total "+ str(rfail) + " right hand poses mismatched.")

f.close()
f1.close()