#!/usr/bin/env python

import sys
import math
import array
import os
from PIL import Image
import numpy as np
import pydicom
import matplotlib.pyplot as plt
import scipy.misc

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

# ========================================================
def DICOM_to_png(dirname):
    print ("Loading DICOM files in ", dirname)
    try:
        files = sorted(os.listdir(dirname))
        pass
    except IOError as e:
        print ("Unable to open file: Check if file exists or is in directory")

    # Read the first image for data of all the slices
    # TODO: Need functionality to ensure that all the scans
    # in one file are indeed of the same scan
    dataset = pydicom.dcmread(dirname+files[0])

    #---------------------------------------------------------------------------
    # Print data of Patient
    print()
    #print("Filename.........:", "IMG"+str(filenum).zfill(5))
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
    #---------------------------------------------------------------------------

    for i in range(0, len(files)-1):
        im_array = pydicom.dcmread(dirname+files[i]).pixel_array
        im_array = im_array * (255.0/np.amax(im_array))
        im = Image.fromarray(im_array.astype(np.uint8))
        im = im.convert('L')
        im.save(dirname + 'output_' + str(i).zfill(4) + ".png", "PNG")

# ========================================================
def DICOM_to_whole_png(dirname):
    print ("Loading DICOM files in ", dirname)
    try:
        files = sorted(os.listdir(dirname))
        pass
    except IOError as e:
        print ("Unable to open file: Check if file exists or is in directory")

    # We aim to align the final slices in a square with zeros at the end
    # where a slice is not present. (The number of slices will not necessarily
    # be a square number)
    gridsize = int((uppersquare(len(files))**0.5))

    # Read the first image for data of all the slices
    # TODO: Need functionality to ensure that all the scans
    # in one file are indeed of the same scan
    dataset = pydicom.dcmread(dirname+files[0])

    #---------------------------------------------------------------------------
    # Print data of Patient
    print()
    #print("Filename.........:", "IMG"+str(filenum).zfill(5))
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
    #---------------------------------------------------------------------------

    # Assign the final image size
    image_size = tuple([gridsize*x for x in np.shape(dataset.pixel_array)])
    finalIm = np.zeros(image_size)
    row_index = 0
    col_index = 0
    for i in range(0, len(files)-1):
        dataset = pydicom.dcmread(dirname+files[i])
        finalIm[row_index: row_index + rows, col_index:col_index + cols] = dataset.pixel_array
        col_index += cols
        if(col_index == gridsize*cols):
            col_index = 0
            row_index += rows

    # Scale image to between 0 and 255
    print ("Minimum value in finalIm is: ", np.amin(finalIm))
    print ("Maximum value in finalIm is: ", np.amax(finalIm))

    # for i in range(0, np.shape(finalIm))
    finalIm *= (255.0/np.amax(finalIm))

    finalIm[finalIm>255.0] = 255.0
    print ("Minimum value in finalIm is: ", np.amin(finalIm))
    print ("Maximum value in finalIm is: ", np.amax(finalIm))

    finalIm = finalIm.astype(np.int)
    im = Image.fromarray(finalIm)
    im = im.convert('L')
    im.show()
    im.save("test.png")
    #im = scipy.misc.toimage(finalIm, cmin=0.0, cmax=256.0)
    #scipy.misc.toimage(finalIm, cmin=0.0, cmax=255.0).save('outfile.png')

    # NOTE: PIL save function not working for some reason. Workaround is above
    # im = Image.fromarray(finalIm)
    # im.show()
    # im.save("test.png")

def DICOM_viewer(dirname, filenum):
    print ("Loading DICOM files in ", dirname)
    try:
        files = os.listdir(dirname)
        pass
    except IOError as e:
        print ("Unable to open file: Check if file exists or is in directory")

    gridsize = int((uppersquare(len(files))**0.5))
    dataset = pydicom.dcmread(dirname+sorted(files)[filenum-1])
    #Normal mode:
    print()
    print("Filename.........:", "IMG"+str(filenum).zfill(5))
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

    print (type(dataset.pixel_array[0][0]))
    # plot the image using matplotlib
    plt.imshow(dataset.pixel_array, cmap=plt.cm.bone)
    plt.show()

def uppersquare(num):
    if((num**(0.5))%1 == 0): return num
    #floor_int = math.floor(num**(0.5))
    ceil_int = math.ceil(num**(0.5))
    return ceil_int*ceil_int
    #floor_sq = floor_int * floor_int
    #ceil_sq = ceil_int * ceil_int
    #if num - floor_sq < ceil_sq-num : return floor_sq
    #else: return ceil_sq

print('========== Starting converter ==========')

dirname = "C:/Users/sushachawal/DICOMs/CTA/SRS00003/"
#dirname = "/johanna/work/development/code/other/vis_web/data/raw/bunny/"
#raw16_to_png(512, 512, 361, dirname)

#dirname = "/johanna/work/development/code/other/vis_web/data/raw/hydrogen/"
#filename = "" #sys.argv[1]
# raw16vol_to_png(256, 256, 110, dirname, filename)
#
# filename = "output_"
# #slices_to_single_file(128, dirname, filename, 316)
# slices_to_single_file(256, dirname, filename, 110)

DICOM_to_png(dirname)
# DICOM_viewer(dirname, int(sys.argv[1]))


print('=========== Converting done! ===========')
