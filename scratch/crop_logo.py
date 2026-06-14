from PIL import Image
import os

def get_alpha_bbox(im, threshold=15):
    if im.mode != 'RGBA':
        im = im.convert('RGBA')
    
    alpha = im.split()[3]
    width, height = im.size
    left, top, right, bottom = width, height, 0, 0
    
    pixels = alpha.load()
    found = False
    
    for y in range(height):
        for x in range(width):
            if pixels[x, y] > threshold:
                if x < left: left = x
                if x > right: right = x
                if y < top: top = y
                if y > bottom: bottom = y
                found = True
                
    if found:
        return (left, top, right + 1, bottom + 1)
    return None

def main():
    img_path = "public/assets/images/logo.png"
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        return
        
    im = Image.open(img_path)
    print("Original size:", im.size)
    
    bbox = get_alpha_bbox(im)
    if bbox:
        print("Detected alpha bbox:", bbox)
        cropped = im.crop(bbox)
        cropped.save("public/assets/images/logo.png")
        cropped.save("images/logo.png")
        print("Cropped successfully!")
        print("New cropped size:", cropped.size)
    else:
        print("Could not detect any pixels above threshold.")

if __name__ == "__main__":
    main()
