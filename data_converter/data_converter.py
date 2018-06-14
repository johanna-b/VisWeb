#!/usr/bin/env python

import sys
import math
import array
from PIL import Image
import numpy as np
import pydicom
import matplotlib.pyplot as plt

print('Python version:        %6.6s' % sys.version)


# ========================================================
def raw16_to_png(x_dim, y_dim, z_dim, dirname):
    print('reading raw16 slices')

    img_size = (x_dim, y_dim, z_dim)

    # read each slice
    for z in range(0, img_size[2]):

        slice_filename = str(z+1)

        # open file and read it into array
        with open(dirname+slice_filename, "rb") as f:
            arr = np.fromfile(f, dtype='>H', count=img_size[0]*img_size[1])
            arr = arr / 16 # only 12 bit used in dataset

        # convert to lower 8 bit
        slice = arr.astype(np.uint8)
        slice.shape = (x_dim, y_dim)

        slice_filename_out = 'output_' + str(z).zfill(4)

        # save array as png
        img = Image.fromarray(slice)
        img.save(dirname + slice_filename_out + ".png", "PNG")

        print ("processed slice " + str(z+1) + " : " + slice_filename_out)

    print ('raw->png done')


# ========================================================
def raw16vol_to_png(x_dim, y_dim, z_dim, dirname, filename):
    print('reading raw vol')

    img_size = (x_dim, y_dim, z_dim)

    # open file and read it into array

    print( dirname+filename )
    with open(dirname+filename, "rb") as f:
        arr = np.fromfile(f, dtype='>B', count=img_size[0]*img_size[1]*img_size[2])
        #arr = arr / 16
    print(arr)
    arr2 = arr.astype(np.uint8)
    arr2.shape = (x_dim, y_dim, z_dim)

    for z in range(0, img_size[2]):
        slice_filename_out = 'output_' + str(z).zfill(4)

        slice = arr2[:][:][z]

        # save array as png
        img = Image.fromarray(slice)
        img.save(dirname + slice_filename_out + ".png", "PNG")
        #img.show()

        print ("processed slice " + str(z) + " : " + slice_filename_out)

    print ('raw->png done')


# ========================================================
def slices_to_single_file(tilesize, dirname, filename, num_slices):
    print('slices to vol')

    tile_size = (tilesize, tilesize, tilesize)

    grid_size_x = 16
    grid_size_y = tilesize // grid_size_x
    count = 0

    imout = Image.new("L", (tile_size[0]*grid_size_x, tile_size[1]*grid_size_y))

    #sample to 256^3
    z_step = (num_slices + tile_size[2]-1) // tile_size[2]
    print(z_step)

    for z in range(0, num_slices, z_step):

        slice_filename = dirname + filename + str(z).zfill(4) + '.png'
        print(slice_filename)

        #read file
        img = Image.open(slice_filename)
        #img.show()
        img = img.resize((tile_size[0], tile_size[1]))
        #img.show()

        cur_y = count // grid_size_x
        cur_x = count % grid_size_x

        upperleft = (cur_x * tile_size[0], cur_y * tile_size[1] )
        imout.paste(img, upperleft)

        count = count+1

    #imout.show()
    imout.save(dirname + "tiledVol" + ".png", "PNG")

def DICOM_to_png(dirname, filename):
    dataset = pydicom.dcmread(dirname+filename)

    #Normal mode:
    print()
    print("Filename.........:", filename)
    print("Storage type.....:", dataset.SOPClassUID)
    print()

    pat_name = dataset.PatientName
    display_name = pat_name.family_name + ", " + pat_name.given_name
    print("Patient's name...:", display_name)
    print("Patient id.......:", dataset.PatientID)
    print("Modality.........:", dataset.Modality)
    print("Study Date.......:", dataset.StudyDate)

    if 'PixelData' in dataset:
        rows = int(dataset.Rows)
        cols = int(dataset.Columns)
        print("Image size.......: {rows:d} x {cols:d}, {size:d} bytes".format(
            rows=rows, cols=cols, size=len(dataset.PixelData)))
        if 'PixelSpacing' in dataset:
            print("Pixel spacing....:", dataset.PixelSpacing)

    # use .get() if not sure the item exists, and want a default value if missing
    print("Slice location...:", dataset.get('SliceLocation', "(missing)"))

    # plot the image using matplotlib
    plt.imshow(dataset.pixel_array, cmap=plt.cm.bone)
    plt.show()


print('========== Starting converter ==========')

dirname = "C:/Users/sushachawal/DICOMs/CT/"
#dirname = "/johanna/work/development/code/other/vis_web/data/raw/bunny/"
#raw16_to_png(512, 512, 361, dirname)

#dirname = "/johanna/work/development/code/other/vis_web/data/raw/hydrogen/"
filename = "IMG00184"
# raw16vol_to_png(256, 256, 110, dirname, filename)
#
# filename = "output_"
# #slices_to_single_file(128, dirname, filename, 316)
# slices_to_single_file(256, dirname, filename, 110)

DICOM_to_png(dirname, filename)

print('=========== Converting done! ===========')
