---
title: "Woody Plants"
date: "2025-09-15"
category: "gamedev"
excerpt: "This is a test article"
---
&nbsp;  
# Techniques for Efficient Woody Plants in 3D Environments
# Part 1: Tree Cards

## Headline 2
### Headline 3
#### Headline 4
##### Headline 5
###### Headline 6

### By Andy Bui&nbsp;  
#### 0 Contents&nbsp;  
&nbsp;  
#### 0.1 Background
#### 0.2 Software Landscape&nbsp;  
&nbsp;  

#### 1.0 Representation Using a Single Plane
#### 1.1 Representation Using Multiple Planes&nbsp;  
&nbsp;  

#### 0.1 Background
&nbsp;&nbsp;&nbsp;&nbsp;Woody plants are a staple in the context of game development, as their ubiquity in nature parallels their usage in 3D environments. Did you know that a mature maple tree can have around 100,000 leaves? It's no wonder that, at full detail, trees are incredibly resource-intensive to render in realtime, and pose a difficult challenge for environment artists  &nbsp;  
&nbsp;  

#### 0.2 Software Landscape&nbsp;  
&nbsp;&nbsp;&nbsp;&nbsp;The tools I use for this journal are Blender 3.3.16, Adobe Substance 3D Painter 2024, Adobe Photoshop 2024, and GIMP. There are a few tools ranging from Blender plugins to purpose-built software  &nbsp;  
&nbsp;  

#### 1.0 Representation Using a Single Plane&nbsp;  
&nbsp;&nbsp;&nbsp;&nbsp;Known as a tree card, we can represent any woody plant&nbsp;  &nbsp;  using an orthographic side view transposed onto a flat plane. In doing so, we're able to go from over 200,000 triangles in our full-fat model, to just 2 triangles for our tree card. Essentially a cardboard cutout (or more appropriately, a card), this technique makes use of a few key things. First is an opacity map that lets us define what areas, or *pixels*, of the image are transparent. Second is a normal map that bakes all of the details of a high-polygon tree onto our plane to give an illusion of depth. Combine these with a roughness and base color(diffuse) map, and we can get a lot of mileage out of just two triangles. 

&nbsp;&nbsp;&nbsp;&nbsp;For this demonstration I'll create the diffuse and roughness maps in Blender, and finish off in Substance 3D Painter.

    [ Illustrations: Pine Tree Scene in Blender, Cycles Preview ]

&nbsp;&nbsp;&nbsp;&nbsp;We'll start with a model of a coniferous tree in Blender, which you can generate using the free Sapling Tree Generator Addon. Set up the materials for the bark and leaves---I use maps from either Quixel Megascans or TCOM. For lighting, I recommend a setup that will cast nice, deep shadows between the larger forms of leaves.&nbsp;  
&nbsp;  

&nbsp;&nbsp;&nbsp;&nbsp;Head to output settings, and set the output resolution to anything of a square aspect ratio, for example 2048x2048. Add a camera to the scene, and under object data properties, configure it to use an orthographic lens. Position the camera to show the front of the tree, adjusting to fit the entire tree in frame.

    [ Illustration: Camera View ]

&nbsp;&nbsp;&nbsp;&nbsp;Before rendering the image, let's verify our render settings for Cycles. Most importantly, we want to enable transparency, because it will allow us to generate an alpha channel which can be used to create the opacity map. we'll also want to render to PNG, at atleast 512 samples, with at least 16 bounces for transparency under light paths->max bounces.

    [ Illustration: Rendered Result ]

&nbsp;&nbsp;&nbsp;&nbsp;Once we've rendered our image and are satisfied with the result, we now have what we need for the diffuse and opacity maps. For a game-ready end product, I recommend using Gimp or Photoshop to separate the RGB and A channels into their own separate JPEG images, as it's much cheaper than a single PNG image.
&nbsp;  

#### 1.2 Representation Using Multiple Planes&nbsp;  
&nbsp;&nbsp;&nbsp;&nbsp;Tree cards are a very effective way to render many trees from a distance, but the drawbacks become more apparent the closer they are to the player. Our normal map does a lot of heavy lifting to simulate how light cascades down every layer of leaves and branches, but there's only so much it can do to compensate for a fundamental lack of geometry.

&nbsp;&nbsp;&nbsp;&nbsp;To address this, we can augment our original plane with multiple support planes, arranged in a fan-out pattern as illustrated.

    [ Illustration: Multiple planes arranged in fan-out pattern ]

&nbsp;&nbsp;&nbsp;&nbsp;This process is better faciliated by some tweaks to the instructions in the previous section. 

&nbsp;&nbsp;&nbsp;&nbsp;For every tree, we need to make two different types of cards. First is the tree with all of its features including the trunk, branches, and leaves. Second is only the leaves---no trunk or branches. The latter will be used for the support planes, the reason for this being that excluding the trunk and branches allows more light to pass through every subsequent plane.

&nbsp;&nbsp;&nbsp;&nbsp;Additionally, I recommend starting with four variants of each tree, so that as we layer each support plane, there's less repetition between layers.

    [ Illustrations: Card for "Full" tree, card for "Half" tree ]
&nbsp;  

