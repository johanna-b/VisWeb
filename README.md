# VolRen: A lightweight web-based volumetric data explorer


#How to use

To load a dataset simply follow the prompts provided. The main file and its dimensions and datatype are required. Adding a segmentation mask is optional. If one is inculded it shoudl be in 8 bit format and the same dimensions as the volume. All of the files shoudl be `.raw` files. Click the visualize button to launch the data explorer. You should see the vo,ume rendered in the center, a panel with slice view on the upper lft and a panel with controls on the upper right. In the controls therre are options for controling the slices, transfer function and clipping planes. If a segmentation mask was included, there will be an additional section of the controls that allow you to select which segmentation ID's to render as well as whcih to selecticely clip. You can find 3 demo video on this repository.

#Code Overview

